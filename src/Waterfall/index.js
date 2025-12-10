// file for my waterfall plot 
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import Papa from 'papaparse';

// global vars
let scene, camera, renderer, raycaster, pointer, controls;
let gridGroup;      
let labels;  // group for the 3d axes labels and ticks 
let isolabels; // group for iso axes labels and ticks
let sliceNames;

// let isolatedGrid = null; 
let allowRaycast = true;
let globalFont = null;
let currentlyHovered = null;
let labelGroup = null;
let tickGroup = null; 
let globalMaxX;
let sceneParams = {}; 

// parameters for focusonSlice to access
let fontScale =null;
let x_axis_label = null;
let y_axis_label = null;
let title_label = null;

let title_x_iso = 0;
let title_y_iso = 0;
let title_z_iso = 0;
let label_off = 0;
let tick_scaler = 1;

const colors = [0x9999ff, 0xff9999, 0x99ff99, 0xffb84d];
let data = []; 
let sliceMeshes = []; 

let homeCamPos = new THREE.Vector3();
let homeCamTarget = new THREE.Vector3();
let tooltipElement = null;
let tooltipVisible = false;

// functions

// tooltip helpers
function initTooltip() {
  tooltipElement = document.getElementById('chart-tooltip');
  if (!tooltipElement) {
    tooltipElement = document.createElement('div');
    tooltipElement.id = 'chart-tooltip';
    tooltipElement.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      pointer-events: none;
      font-family: Arial, sans-serif;
      font-size: 12px;
      max-width: 300px;
      z-index: 1000;
      display: none;
      backdrop-filter: blur(2px);
    `;
    document.body.appendChild(tooltipElement);
  }
}

function showTooltip(sliceIndex, worldPosition, points = null) {
  if (!tooltipElement) initTooltip();
  if (!allowRaycast) return; 
  
  const mesh = sliceMeshes[sliceIndex];
  let sliceName = "Unknown Slice";
  let displayPoints = [];
  
  if (mesh && mesh.userData.originalData) {
    sliceName = sliceNames[sliceIndex] || `Slice ${sliceIndex}`;
    displayPoints = mesh.userData.originalData;  
    
    console.log(`Tooltip: ${sliceName}, Points:`, displayPoints);  
  }
  
  // convert 3d world to 2d screen pos
  const vector = worldPosition.clone();
  vector.project(camera);
  
  const widthHalf = window.innerWidth / 2;
  const heightHalf = window.innerHeight / 2;
  
  vector.x = (vector.x * widthHalf) + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;
  
  // tootltip content
  let tooltipHTML = `<div class="tooltip-title">${sliceName}</div>`;
  
  if (points && points.length > 0) {
    tooltipHTML += '<div class="tooltip-points">';

    const displayPoints = points.slice(0, 10); 
    displayPoints.forEach(point => {
      tooltipHTML += `<div class="tooltip-point">(${point.x.toFixed(2)}, ${point.y.toFixed(2)})</div>`;
    });
    if (points.length > 10) {
      tooltipHTML += `<div class="tooltip-point">... and ${points.length - 10} more</div>`;
    }
    tooltipHTML += '</div>';
  }
  
  tooltipElement.innerHTML = tooltipHTML;
  tooltipElement.style.left = `${vector.x + 15}px`;
  tooltipElement.style.top = `${vector.y - 15}px`;
  tooltipElement.style.display = 'block';
  tooltipVisible = true;
}

function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.style.display = 'none';
    tooltipVisible = false;
  }
}


function parseWaterfallCSV(csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true, 
    skipEmptyLines: true
  });
  // console.log("CSV Headers:", result.meta.fields);
  const data = result.data;

  const requiredHeaders = ["slice", "x", "y"];
  const headers = result.meta.fields.map(h => h.trim());
    if (!requiredHeaders.every(h => headers.includes(h))) {
  throw new Error(`CSV must contain headers: ${requiredHeaders.join(", ")}`);
  }

  // group by slicing variable 
  const grouped = data.reduce((acc, row) => {
    const sliceName = row.slice;
    if (!acc[sliceName]) acc[sliceName] = [];
    acc[sliceName].push({
      x: row.x,
      y: row.y,
      description: row.description || ""
    });
    return acc;
  }, {});

  return grouped; // { Apple: [...], Microsoft: [...], ... }
}

function array_average(data){
  let sum = 0; 
  for (let i = 0; i < data.length; i++){
    sum += data[i].y;
  }
  return sum/data.length;
}

function create_shapes(maxX, maxY, array, colors, sliceSpacing) {
  const sliceMeshesLocal = [];
  

  const paddingX = 2; 
  const paddingY = 2; 
  const sideX = maxX + paddingX;
  const sideY = maxY + paddingY;
  
  for (let i = 0; i < array.length; i++) {
    const list = array[i];
    
    const shape = new THREE.Shape();
    
    // start at bottom-left of shape
    shape.moveTo(0, 0);
    
    // drawing
    for (let j = 0; j < list.length; j++) {
      const xScaled = (list[j].x / maxX) * sideX;
      shape.lineTo(xScaled, list[j].y);
    }
    
    // close the shape back to bottom-right
    shape.lineTo((list[list.length - 1].x / maxX) * sideX, 0);
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = (i + 1) * sliceSpacing;
    
    mesh.userData.originalData = list;  
    mesh.userData.originalIndex = i;    
    
    scene.add(mesh);
    sliceMeshesLocal.push(mesh);
  }
  
  return { sliceSpacing, sliceMeshes: sliceMeshesLocal, sideX, sideY };
}

function grab_maxes(array){
  const flat = array.flat(Infinity);

  let maxValueX = -Infinity; 
  let maxValueY = -Infinity;
  for (const points of flat) {
    if (points.x > maxValueX) maxValueX = points.x;
    if (points.y > maxValueY) maxValueY = points.y;
  }
  return {maxX: maxValueX, maxY: maxValueY};
}

function generate_grid(xMax, yMax, array_length, divisions, sliceSpacing) {
  const paddingX = 2;
  const paddingY = 2;
  const sideX = xMax + paddingX;
  const sideY = yMax + paddingY;
  const sideZ = array_length * sliceSpacing + 1;

  function createRectGrid(width, height, divisions) {
    const size = Math.max(width, height);
    const grid = new THREE.GridHelper(size, divisions);
    grid.scale.set(width / size, 1, height / size);
    return grid;
  }

  const gridXZ = createRectGrid(sideX, sideZ, divisions);
  gridXZ.position.set(sideX / 2, 0, sideZ / 2);

  const gridXY = createRectGrid(sideX, sideY, divisions);
  gridXY.rotation.x = Math.PI / 2;
  gridXY.position.set(sideX / 2, sideY / 2, 0);

  const gridYZ = createRectGrid(sideY, sideZ, divisions);
  gridYZ.rotation.z = Math.PI / 2;
  gridYZ.position.set(0, sideY / 2, sideZ / 2);

  gridGroup.add(gridXZ);
  gridGroup.add(gridXY);
  gridGroup.add(gridYZ);

  return { sideX, sideY, sideZ, divisions };
}

function place_ticks(maxXY, divisions, gridSizeXY, material_text, axis, array, sliceSpacing, group, zRotation, offset = 0, zOffset = null) {
  if (!globalFont) return;
  
  if (zOffset === null) {
    zOffset = sliceSpacing * array.length + 1;
  }
  
  const scale = maxXY / divisions;
  let Ticks = [];
  for (let x = 0; x <= maxXY; x += scale) {
    Ticks.push(Math.round(x));
  }
  Ticks.push(Math.round(maxXY));

  for (let i = 0; i < Ticks.length; i++) {
    const labelGeo = new TextGeometry(Ticks[i].toString(), {
      font: globalFont,
      size: 0.5 * tick_scaler,
      height: 0.0,
      curveSegments: 8,
      bevelEnabled: false
    });
    labelGeo.computeBoundingBox();
    labelGeo.center();
    const textMesh = new THREE.Mesh(labelGeo, material_text);
    textMesh.raycast = () => {};

    const Pos = Ticks[i]; 

    if (axis === "x") {
      const scaledPos = (Pos / maxXY) * gridSizeXY;
      textMesh.position.set(scaledPos, offset, zOffset);
    } else {
      textMesh.position.set(offset, Pos, zOffset);
    }

    textMesh.scale.z = 0.001;
    textMesh.rotation.z = zRotation;
    group.add(textMesh);
  }
}

// where the event listeners are set up 
function setupThree(container, theme) {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  if (theme==="dark"){
    scene.background = new THREE.Color('black');}
    else {
      scene.background = new THREE.Color('white')
    }

  gridGroup = new THREE.Group();
  scene.add(gridGroup);

  const aspect = window.innerWidth / window.innerHeight;
  const d = 20;
  camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 100);
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();
  controls.enableRotate = false;   
  controls.enablePan = true;       
  controls.enableZoom = true;

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  window.addEventListener('pointermove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
  });

  window.addEventListener('click', () => {
    if (!allowRaycast) return;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(sliceMeshes, true);

    if (intersects.length > 0) {
      focusOnSlice(intersects[0].object, theme);
    }
  });

  initTooltip();
  
  // pointer move for tooltip positioning
  container.addEventListener('pointermove', (event) => {
    if (tooltipVisible && tooltipElement) {
      // update tooltip position based on mouse
      tooltipElement.style.left = `${event.clientX + 15}px`;
      tooltipElement.style.top = `${event.clientY - 15}px`;
    }
    
  });
  
  // hide tooltip when mouse leaves container
  container.addEventListener('pointerleave', () => {
    hideTooltip();
  });
  window.addEventListener('resize', () => {
    if (tooltipVisible) {
      hideTooltip();
    }
  });
}

// handling hover highlighting and tooltips
function animate() {
  requestAnimationFrame(animate);

  if (allowRaycast) {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(sliceMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const hitIndex = sliceMeshes.indexOf(hit);
      
      // hover highlighting
      if (currentlyHovered !== hit) {
        if (currentlyHovered && currentlyHovered.userData.originalColor) {
          currentlyHovered.material.color.copy(currentlyHovered.userData.originalColor);
        }
        currentlyHovered = hit;
        if (!hit.userData.originalColor) hit.userData.originalColor = hit.material.color.clone();
        hit.material.color.offsetHSL(0, 0, 0.15);
        
        // tooltip
        if (hitIndex !== -1 && data[hitIndex]) {
          const worldPosition = intersects[0].point;
          showTooltip(hitIndex, worldPosition, data[hitIndex]);
        }
      }
    } else if (currentlyHovered && currentlyHovered.userData.originalColor) {
      currentlyHovered.material.color.copy(currentlyHovered.userData.originalColor);
      currentlyHovered = null;
      hideTooltip();
    }
  }

  renderer.render(scene, camera);
}

function focusOnSlice(mesh, color_theme) {
  hideTooltip();
  allowRaycast = false;
  sliceMeshes.forEach(m => m.visible = false);
  mesh.visible = true;
  controls.enableRotate = true;

  if (labels) labels.visible = false;
  
  // remove existing ticks and labels
  if (labelGroup) {
    scene.remove(labelGroup);
    labelGroup = null;
  }
  if (tickGroup) {
    scene.remove(tickGroup);
    tickGroup = null;
  }

// calculating cam positioning
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  const size = boundingBox.getSize(new THREE.Vector3());
  

  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 3;
  

  const target = new THREE.Vector3(
    center.x,
    center.y,
    mesh.position.z
  );
  
  const cameraPos = new THREE.Vector3(
    center.x,
    center.y,
    mesh.position.z + distance
  );
  
  // storre current pos
  const currentPos = camera.position.clone();
  const currentTarget = controls.target.clone();
  
  // animate to new pos
  animateCamera(
    currentPos,
    cameraPos,
    currentTarget,
    target
  );
  
  isolabels = new THREE.Group();
  scene.add(isolabels);

  const sliceIndex = sliceMeshes.indexOf(mesh);
  const sliceName = sliceNames[sliceIndex] || `Slice ${sliceIndex}`;
  const isolatedTitle = `${title_label} (${sliceName})`;
  
  console.log(`Isolated view: ${sliceName}, Index: ${sliceIndex}`);


  if (globalFont) {
    createAxisLabels(
      color_theme, 
      x_axis_label,
      y_axis_label, 
      fontScale,
      sceneParams.sideX, 
      sceneParams.sideY, 
      sceneParams.sideZ, 
      sceneParams.divisions, 
      sceneParams.maxX, 
      sceneParams.maxY, 
      sceneParams.data, 
      sceneParams.sliceSpacing, 
      isolabels, 
      -2 - label_off, 0, 0, 
      0, 0, 0, 
      1
    );
    createAxisLabels(
      color_theme, 
      isolatedTitle, 
      null, 
      fontScale,
      sceneParams.sideX, 
      sceneParams.sideY, 
      sceneParams.sideZ, 
      sceneParams.divisions, 
      sceneParams.maxX, 
      sceneParams.maxY, 
      sceneParams.data, 
      sceneParams.sliceSpacing, 
      isolabels, 
      10, 0, 0, 
      title_x_iso, title_y_iso, title_z_iso, 
      1.5);

  } else {
    console.warn("Font not loaded yet, skipping axis labels in isolated view");
  }

  console.log(sliceName)
  
  document.getElementById("backButton").style.display = "block";
}

function restore3D() {
  allowRaycast = true;
  
  const currentPos = camera.position.clone();
  const currentTarget = controls.target.clone();
  
  sliceMeshes.forEach(m => {
    m.visible = true;
    m.position.y = 0;
  });
  
  if (gridGroup) gridGroup.visible = true;
  if (labels) labels.visible = true;
  if (isolabels) isolabels.visible = false;

  
  document.getElementById("backButton").style.display = "none";
  
// animate from current to home 
  animateCamera(
    currentPos,
    homeCamPos.clone(),
    currentTarget,
    homeCamTarget.clone()
  );
  
  setTimeout(() => {
    controls.enabled = false;
  }, 1200);
}

function rememberHomeCamera() {
  homeCamPos = camera.position.clone();
  homeCamTarget = controls.target.clone();
}

function loadFont(url) {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader();
    loader.load(url, (font) => {
      globalFont = font;
      resolve(font);
    }, undefined, (err) => reject(err));
  });
}

function createAxisLabels(theme, xLabel, yLabel, scale, sideX, sideY, sideZ, divisions, maxX, maxY, data, sliceSpacing, group, offset = 0, tickRo = Math.PI/4, axRo = Math.PI/4, tOffx = 0, tOffy = 0,tOffz = 0, tscale = 1) {

  if (!globalFont) return;
  let font_color;
  if (theme==="dark"){
    font_color = 0xffffff;}
    else {
      font_color = 0x000000
    }
  const material_text = new THREE.MeshBasicMaterial({ color: font_color, side: THREE.DoubleSide });

  const labelXGeo = new TextGeometry(xLabel, { font: globalFont, size: .5 * scale * tscale, height: 0, curveSegments: 8 });
  labelXGeo.computeBoundingBox();
  labelXGeo.center();
  const labelXMesh = new THREE.Mesh(labelXGeo, material_text);
  labelXMesh.position.set(sideX / 2 + tOffx, offset + tOffy, sideZ + 3 + tOffz);
  labelXMesh.rotation.x = -axRo;
  labelXMesh.scale.z = 0.001;
  group.add(labelXMesh);


  if (yLabel != null) {
    const labelYGeo = new TextGeometry(yLabel, { font: globalFont, size: .5 * scale * tscale, height: 0, curveSegments: 8 });
    labelYGeo.computeBoundingBox();
    labelYGeo.center();
    const labelYMesh = new THREE.Mesh(labelYGeo, material_text);
    labelYMesh.position.set(offset + tOffx, sideY / 1.5 + tOffy, sideZ + 3 + tOffz);
    labelYMesh.rotation.z = Math.PI / 2;
    labelYMesh.rotation.y = axRo;
    labelYMesh.scale.z = 0.001;
    group.add(labelYMesh);
  }

  place_ticks(maxX, divisions, sideX, material_text, "x", data, sliceSpacing, group, tickRo, -1);
  place_ticks(maxY, divisions, sideY, material_text, "y", data, sliceSpacing, group, tickRo, -1);
}

function animateCamera(fromPos, toPos, fromTarget, toTarget, duration = 1.2, onComplete = null) {
  const targetProxy = {
    x: fromTarget.x,
    y: fromTarget.y,
    z: fromTarget.z
  };

  // Disable controls during animation
  controls.enabled = false;

  gsap.to(camera.position, {
    x: toPos.x,
    y: toPos.y,
    z: toPos.z,
    duration,
    ease: "power2.inOut",
  });

  gsap.to(targetProxy, {
    x: toTarget.x,
    y: toTarget.y,
    z: toTarget.z,
    duration,
    ease: "power2.inOut",
    onUpdate: () => {
      controls.target.set(targetProxy.x, targetProxy.y, targetProxy.z);
      controls.update();
    },
    onComplete: () => {
      // Re-enable controls after animation
      controls.enabled = true;
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }
  });
}
  
function adjustCameraToScene() {
  // Create a bounding box that encompasses all visible objects
  const boundingBox = new THREE.Box3();
  
  // Add all slice meshes to the bounding box
  sliceMeshes.forEach(mesh => {
    boundingBox.expandByObject(mesh);
  });
  
  // Add grid to the bounding box
  boundingBox.expandByObject(gridGroup);
  
  // Calculate the size of the bounding box
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  
  // Get the center of the bounding box
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  
  console.log("Scene size:", size, "Center:", center);
  
  // Calculate the maximum dimension
  const maxDimension = Math.max(size.x, size.y, size.z);
  
  // Adjust the orthographic camera frustum
  const aspect = camera.aspect || window.innerWidth / window.innerHeight;
  const frustumSize = maxDimension * 1.5; // Add some padding
  
  camera.left = -frustumSize * aspect / 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  
  // Position the camera to view the entire scene
  const distance = maxDimension * 2;
  camera.position.set(
    center.x + distance,
    center.y + distance,
    center.z + distance
  );
  
  // Update camera and controls
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
  
  // Remember the home position for later
  rememberHomeCamera();
}

async function createWaterfallPlot(csv_file, div_name, color_theme, title, 
  title_x, title_y, title_z, 
  title_x2, title_y2, title_z2,
  xLabel, yLabel, label_offset, label_scale = 1, tick_scale = 1) {
  console.log("Papa:", Papa);
  const container = document.getElementById(div_name);
  setupThree(container, color_theme);  
  // controls.enableRotate = true;

  document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.getElementById("backButton");
    backButton.addEventListener("click", restore3D);
  });

  const fontLoader = new FontLoader();
  const font = await new Promise((resolve, reject) => {
    fontLoader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      resolve,
      undefined,
      reject
    );
  });
  
globalFont = font;
  let grouped;
  try {
    const response = await fetch(csv_file);  // fetch the CSV
    const csvText = await response.text();     // read as text
    grouped = parseWaterfallCSV(csvText); // parse CSV → grouped object
    console.log(grouped)
    // console.log(csvText)

    // Convert to nested array for create_shapes
    data = Object.values(grouped).map(slice => slice.sort((a,b) => a.x - b.x));
  } catch (err) {
    console.error("CSV load/parse failed:", err);
    return;
  }

  const originalSliceNames = Object.keys(grouped);
  
  const slicesWithAverages = originalSliceNames.map((name, index) => ({
    name,
    data: data[index],
    average: array_average(data[index])
  }));
  
  slicesWithAverages.sort((a, b) => b.average - a.average);
  
  data = slicesWithAverages.map(slice => slice.data);
  sliceNames = slicesWithAverages.map(slice => slice.name);  
  
  console.log("Sorted slice names:", sliceNames);  

  const slices = Object.keys(grouped); 

  const { maxX, maxY } = grab_maxes(data);
  globalMaxX = maxX;
  
  // Pass maxY to create_shapes and get sideX, sideY back
  const { sliceSpacing, sliceMeshes: createdSlices, sideX, sideY } = create_shapes(maxX, maxY, data, colors, 1.5);
  sliceMeshes = createdSlices;

  const len = data.length;
  const { sideZ, divisions } = generate_grid(maxX, maxY, len, 10, sliceSpacing);
  
  // storing in sceneParams so focusOnSlice can access
  sceneParams.sideX = sideX;
  sceneParams.sideY = sideY;
  sceneParams.sideZ = sideZ;
  sceneParams.divisions = divisions;
  sceneParams.maxX = maxX;
  sceneParams.maxY = maxY;
  sceneParams.sliceSpacing = sliceSpacing;
  sceneParams.data = data;

  labels = new THREE.Group()
  scene.add(labels)

  fontScale = label_scale 

  x_axis_label = xLabel
  y_axis_label = yLabel
  title_label = title

  title_x_iso = title_x2
  title_y_iso = title_y2
  title_z_iso = title_z2

  label_off = label_offset
  tick_scaler = tick_scale

  createAxisLabels(color_theme, xLabel, yLabel, fontScale,sideX, sideY, sideZ, divisions, maxX, maxY, data, sliceSpacing, labels, -label_offset);
  createAxisLabels(color_theme, title, null, fontScale,sideX, sideY, sideZ, divisions, maxX, maxY, data, sliceSpacing, labels, 15, Math.PI/4, Math.PI/4, 6 + title_x, 5 + title_y,-5 + title_z, 1.5);

  rememberHomeCamera();
  animate();
}

export { createWaterfallPlot };

