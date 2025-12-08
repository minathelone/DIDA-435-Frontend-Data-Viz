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
let labelOffset =null;

const colors = [0x9999ff, 0xff9999, 0x99ff99, 0xffb84d];
let data = []; 
let sliceMeshes = []; 

let homeCamPos = new THREE.Vector3();
let homeCamTarget = new THREE.Vector3();

// functions

function parseWaterfallCSV(csvText) {
  // Remove BOM if present
  const result = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true, 
    skipEmptyLines: true
  });
  // console.log("CSV Headers:", result.meta.fields);
  const data = result.data;

  const requiredHeaders = ["slice", "x", "y"];
  // const headers = result.meta.fields;
  // if (!requiredHeaders.every(h => headers.includes(h))) {
  //   throw new Error(`CSV must contain headers: ${requiredHeaders.join(", ")}`);
  // }
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

function create_shapes(maxX, array, colors, sliceSpacing){
  const sliceMeshesLocal = [];
  for (let i = 0; i < array.length; i++) {
    const list = array[i];
    const sideX = maxX + 2;

    const shape = new THREE.Shape();
    shape.moveTo(list[0].x, 0);
    for (let j = 0; j < list.length; j++) {
      const xScaled = (list[j].x / maxX) * sideX;
      shape.lineTo(xScaled, list[j].y);
    }
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
    mesh.position.z = (i+1) * sliceSpacing;
    scene.add(mesh);
    sliceMeshesLocal.push(mesh);
  }
  return { sliceSpacing, sliceMeshes: sliceMeshesLocal };
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

function generate_grid(xMax, yMax, array_length, divisions, sliceSpacing){
  const sideX = xMax + 2;
  const sideY = yMax + 2;
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

function place_ticks(maxXY, divisions, gridSizeXY, material_text, axis, array, sliceSpacing, group, zRotation, offset = 0, zOffset = sliceSpacing * array.length + 1) {
  if (!globalFont) return;

  const scale = maxXY / divisions;
  let Ticks = [];
  for (let x=0; x<= maxXY; x+= scale){
    Ticks.push(Math.round(x));
  }
  Ticks.push(Math.round(maxXY));

  for (let i = 0; i < Ticks.length; i++) {
    const labelGeo = new TextGeometry(Ticks[i].toString(), {
      font: globalFont,
      size: 0.5,
      height: 0.0,
      curveSegments: 8,
      bevelEnabled: false
    });
    labelGeo.computeBoundingBox();
    labelGeo.center();
    const textMesh = new THREE.Mesh(labelGeo, material_text);
    textMesh.raycast = () => {};

    const Pos = (Ticks[i] / maxXY) * (gridSizeXY-1);

    if (axis === "x") {
      textMesh.position.set(Pos, offset, zOffset);
    } else {
      textMesh.position.set(offset, Pos, zOffset);
    }

    textMesh.scale.z = 0.001;
    textMesh.rotation.z = zRotation;
    group.add(textMesh);
  }
}

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
}

function animate() {
  requestAnimationFrame(animate);

  if (allowRaycast) {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(sliceMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (currentlyHovered !== hit) {
        if (currentlyHovered && currentlyHovered.userData.originalColor) {
          currentlyHovered.material.color.copy(currentlyHovered.userData.originalColor);
        }
        currentlyHovered = hit;
        if (!hit.userData.originalColor) hit.userData.originalColor = hit.material.color.clone();
        hit.material.color.offsetHSL(0, 0, 0.15);
      }
    } else if (currentlyHovered && currentlyHovered.userData.originalColor) {
      currentlyHovered.material.color.copy(currentlyHovered.userData.originalColor);
      currentlyHovered = null;
    }
  }

  renderer.render(scene, camera);
}

function focusOnSlice(mesh, color_theme) {
  allowRaycast = false;
  sliceMeshes.forEach(m => m.visible = false);
  mesh.visible = true;
  controls.enableRotate = true;

  if (labels) labels.visible = false;
  
  // Remove any existing label and tick groups
  if (labelGroup) {
    scene.remove(labelGroup);
    labelGroup = null;
  }
  if (tickGroup) {
    scene.remove(tickGroup);
    tickGroup = null;
  }

  // Get the slice's bounding box
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  const size = boundingBox.getSize(new THREE.Vector3());
  
  // Calculate the maximum dimension for camera distance
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 3; // Adjust multiplier as needed
  
  // Calculate target (center of the slice)
  const target = new THREE.Vector3(
    center.x,
    center.y,
    mesh.position.z
  );
  
  // Calculate camera position (behind and above the slice)
  const cameraPos = new THREE.Vector3(
    center.x,
    center.y, //+ distance * 0.5,
    mesh.position.z + distance
  );
  
  // Store current position and target
  const currentPos = camera.position.clone();
  const currentTarget = controls.target.clone();
  
  // Animate to new position
  animateCamera(
    currentPos,
    cameraPos,
    currentTarget,
    target
  );
  
  isolabels = new THREE.Group()
  scene.add(isolabels)

  createAxisLabels(color_theme, "time in years since 2020","revenue in billions", fontScale,sceneParams.sideX, sceneParams.sideY, sceneParams.sideZ, sceneParams.divisions, sceneParams.maxX, sceneParams.maxY, sceneParams.data, sceneParams.sliceSpacing, isolabels, -2, 0, 0);
  document.getElementById("backButton").style.display = "block";
}

function restore3D() {
  allowRaycast = true;
  
  // Store current position and target BEFORE changing anything
  const currentPos = camera.position.clone();
  const currentTarget = controls.target.clone();
  
  sliceMeshes.forEach(m => {
    m.visible = true;
    // Reset Y position if it was modified during isolation
    m.position.y = 0;
  });
  
  if (gridGroup) gridGroup.visible = true;
  if (labels) labels.visible = true;
  if (isolabels) isolabels.visible = false;

  // if (theme==="light"){
  //   scene.background = new THREE.Color(0x000000);}
  //   else{
  //     scene.background = new THREE.Color(0xffffff);}
  
  document.getElementById("backButton").style.display = "none";
  
  // Animate FROM current position TO home position
  animateCamera(
    currentPos,
    homeCamPos.clone(),
    currentTarget,
    homeCamTarget.clone()
  );
  
  // Re-enable controls after animation completes
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

function createAxisLabels(theme, xLabel, yLabel, scale, sideX, sideY, sideZ, divisions, maxX, maxY, data, sliceSpacing, group, offset = 0, tickRo = Math.PI/4, axRo = Math.PI/4) {

  if (!globalFont) return;
  let font_color;
  if (theme==="dark"){
    font_color = 0xffffff;}
    else {
      font_color = 0x000000
    }
  const material_text = new THREE.MeshBasicMaterial({ color: font_color, side: THREE.DoubleSide });

  const labelXGeo = new TextGeometry(xLabel, { font: globalFont, size: .5 * scale, height: 0, curveSegments: 8 });
  labelXGeo.computeBoundingBox();
  labelXGeo.center();
  const labelXMesh = new THREE.Mesh(labelXGeo, material_text);
  labelXMesh.position.set(sideX / 2, offset, sideZ + 3);
  labelXMesh.rotation.x = -axRo;
  labelXMesh.scale.z = 0.001;
  group.add(labelXMesh);

  const labelYGeo = new TextGeometry(yLabel, { font: globalFont, size: .5 * scale , height: 0, curveSegments: 8 });
  labelYGeo.computeBoundingBox();
  labelYGeo.center();
  const labelYMesh = new THREE.Mesh(labelYGeo, material_text);
  labelYMesh.position.set(offset, sideY/ 1.5, sideZ + 3);
  labelYMesh.rotation.z = Math.PI / 2;
  labelYMesh.rotation.y = axRo;
  labelYMesh.scale.z = 0.001;
  group.add(labelYMesh);

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

async function createWaterfallPlot(csv_file, div_name, color_theme, xLabel, yLabel, label_scale = 1) {
  console.log("Papa:", Papa);
  const container = document.getElementById(div_name);
  setupThree(container, color_theme);  
  // controls.enableRotate = true;

  document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.getElementById("backButton");
    backButton.addEventListener("click", restore3D);
  });

  // try {
  //   await loadFont('/fonts/helvetiker_regular.typeface.json');
  // } catch (err) {
  //   console.error("Font load failed:", err);
  //   return;
  // }

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

  const sliceNames = Object.keys(grouped); // names of slices for tooltip hovering later 

  data.sort((a, b) => array_average(b) - array_average(a));

  const { maxX, maxY } = grab_maxes(data);
  globalMaxX = maxX;
  const { sliceSpacing, sliceMeshes: createdSlices } = create_shapes(maxX, data, colors, 1.5);
  sliceMeshes = createdSlices;

  const len = data.length;
  const { sideX, sideY, sideZ, divisions } = generate_grid(maxX, maxY, len, 10, sliceSpacing);
  
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
  createAxisLabels(color_theme, xLabel, yLabel, fontScale,sideX, sideY, sideZ, divisions, maxX, maxY, data, sliceSpacing, labels);
  

  rememberHomeCamera();
  animate();
}

export { createWaterfallPlot };
