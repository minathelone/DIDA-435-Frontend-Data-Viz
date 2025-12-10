export function createButterflyChart({
  containerSelector,
  statusSelector,
  sortButtonSelector,
  labels: labelsParam,
  dataSource,
  chartTitle: chartTitleParam,
  initialMode: initialModeParam
} = {}) {
  const labels = labelsParam;
  const DATA_SOURCE = dataSource;
  const chartTitle = chartTitleParam;
  const initialMode = initialModeParam;

  try {
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = chartTitle;
  } catch (e) {}

  function parseNum(v){
    if (v == null || v === '') return NaN;
    const cleaned = String(v).trim().replace(',', '.');
    const n = +cleaned;
    return Number.isNaN(n) ? NaN : n;
  }

  let lastLoadInfo = { total: 0, shown: 0 };

  async function loadData() {
    try {
      if (!DATA_SOURCE || !DATA_SOURCE.url) {
        return [];
      }

      if (DATA_SOURCE.type === 'json') {
        const res = await fetch(DATA_SOURCE.url);
        const raw = await res.json();

        if (Array.isArray(raw) && raw.length &&
            raw[0].age != null && raw[0].male != null && raw[0].female != null) {
          return raw;
        }
        
        const s = DATA_SOURCE.rightScale || 1;
        return raw.map(r => ({
          age: r[DATA_SOURCE.categoryCol],
          male: parseNum(r[DATA_SOURCE.leftCol]),
          female: parseNum(r[DATA_SOURCE.rightCol]) * s
        }));
      }

      const rows = await d3.csv(DATA_SOURCE.url);
      const s = DATA_SOURCE.rightScale || 1;
      let mapped = rows.map(r => ({
        age: r[DATA_SOURCE.categoryCol],
        male: parseNum(r[DATA_SOURCE.leftCol]),
        female: parseNum(r[DATA_SOURCE.rightCol]) * s
      })).filter(d => !Number.isNaN(d.male) && !Number.isNaN(d.female));

      const originalCount = mapped.length;
      
      const maxRows = 20;
      if (mapped.length > maxRows){
        mapped = mapped
          .sort((a,b) => (b.male + b.female) - (a.male + a.female))
          .slice(0, maxRows);
      }

      lastLoadInfo = { total: originalCount, shown: mapped.length };

      return mapped;
    } catch (err) {
      console.error('Data load failed:', err);
      return [];
    }
  }

  /* Themes */
  const themes = {
    DarkPG:  { left:["#9999FF","#9999FF"], right:["#FF9999","#FF9999"], bg:"#000000", text:"#f1f5f9" },
    LightPG: { left:["#9999FF","#9999FF"], right:["#FF9999","#FF9999"], bg:"#f6f7fb", text:"#0f172a" }
  };

  const state = {
    data: [],
    year: null,
    theme: 'DarkPG',
    grid: false,
    showValues: false,
    sortByDiff: true
  };

  if (typeof initialMode === 'string'){
    const m = initialMode.toLowerCase();
    state.theme = m === 'light' ? 'LightPG' : 'DarkPG';
  }
  
  /* Mount & sizes */
  const root = d3.select(containerSelector);
  if (root.empty()) {
    console.error('createButterflyChart: containerSelector did not match any element:', containerSelector);
    return;
  }

  const rootNode = root.node();
  const width = rootNode && rootNode.clientWidth ? rootNode.clientWidth : 1180;
  const W = Math.min(1180, width);
  const H = Math.round(0.5 * W);
  const M = { top: 72, right: 26, bottom: 40, left: 170 };
  const iw = W - M.left - M.right, ih = H - M.top - M.bottom;

  const svg = root.append("svg")
    .attr("width", W).attr("height", H)
    .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio","xMidYMid meet")
    .attr("role","img")
    .attr("aria-label","Butterfly chart comparing left and right values by category");

  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

  let sideLeftLabel = labels.left;
  let sideRightLabel = labels.right;
  let axisLeftTextNode = null;
  let axisRightTextNode = null;

  const defs = svg.append("defs");
  const gradL = defs.append("linearGradient").attr("id","gradL").attr("x1","100%").attr("x2","0%");
  gradL.selectAll("stop").data([0,1]).enter().append("stop").attr("offset", d=> (d*100)+"%").attr("stop-color", "#6b8bff");
  const gradR = defs.append("linearGradient").attr("id","gradR").attr("x1","0%")
    .attr("x2","100%");
  gradR.selectAll("stop").data([0,1]).enter().append("stop").attr("offset", d=> (d*100)+"%").attr("stop-color", "#ff8c8c");

  defs.append("filter").attr("id","softShadow")
    .attr("x","-20%").attr("y","-20%").attr("width","140%").attr("height","160%")
    .append("feDropShadow").attr("dx",0).attr("dy",1.6).attr("stdDeviation",1.8).attr("flood-opacity",0.22);

  defs.append("filter").attr("id","softShadowHover")
    .attr("x","-30%").attr("y","-30%").attr("width","160%").attr("height","180%")
    .append("feDropShadow").attr("dx",0).attr("dy",3).attr("stdDeviation",3.2).attr("flood-opacity",0.28);

  const highlight = defs.append("linearGradient").attr("id","barHighlight")
    .attr("x1","0%").attr("y1","0%").attr("x2","0%").attr("y2","100%");
  highlight.selectAll("stop").data([
    {o:"0%", c:"rgba(255,255,255,.35)"},
    {o:"25%", c:"rgba(255,255,255,.10)"},
    {o:"100%",c:"rgba(255,255,255,0)"},
  ]).enter().append("stop").attr("offset",d=>d.o).attr("stop-color",d=>d.c);

  /* TOOLTIP */
  const tip = d3.select("#tip");

  function showTip(e, d, side){
    let body = '';
    if (side === 'left'){
      body = `<div>${sideLeftLabel}: <b>${fmtShort(d.male)}</b></div>`;
    } else if (side === 'right'){
      body = `<div>${sideRightLabel}: <b>${fmtShort(d.female)}</b></div>`;
    } else {
      body = `<div>${sideLeftLabel}: <b>${fmtShort(d.male)}</b></div>
              <div>${sideRightLabel}: <b>${fmtShort(d.female)}</b></div>`;
    }

    tip.style('opacity',1)
       .html(`<div style="font-weight:700;margin-bottom:4px">${d.age}</div>
              ${body}`);
    moveTip(e);
  }
  function moveTip(e){
    const [mx,my] = d3.pointer(e, document.body);
    tip.style('transform', `translate(${mx+14}px,${my+14}px)`);
  }
  const hideTip = () => { tip.style('opacity',0); tip.text(''); };

  /* SCALES & AXES */
  function maxMF(data){ return d3.max(data, d => Math.max(d.male, d.female)); }
  let maxVal = maxMF([]);
  const xAll   = d3.scaleLinear().domain([-maxVal,maxVal]).range([0,iw]).clamp(true);
  const xLeft  = d3.scaleLinear().domain([0,maxVal]).range([xAll(0), xAll(-maxVal)]).clamp(true);
  const xRight = d3.scaleLinear().domain([0,maxVal]).range([xAll(0), xAll(maxVal)]).clamp(true);
  const y      = d3.scaleBand().domain([]).range([18,ih]).padding(0.28);
  const gridG = g.append("g").attr("class","grid");
  const axisTopG = g.append("g").attr("class","axis axis-top").attr("transform","translate(0,8)");
  const axisLeftG = g.append("g").attr("class","axis axis-left");

  axisLeftTextNode = g.append("text")
    .attr("x", 0)
    .attr("y", -32)
    .attr("text-anchor","middle")
    .style("font-weight",700)
    .style("font-size","18px")
    .attr("fill","var(--muted)")
    .text(sideLeftLabel);
  axisRightTextNode = g.append("text")
    .attr("x", iw)
    .attr("y", -32)
    .attr("text-anchor","middle")
    .style("font-weight",700)
    .style("font-size","18px")
    .attr("fill","var(--muted)")
    .text(sideRightLabel);
  g.append("line").attr("x1",iw/2).attr("x2",iw/2).attr("y1",0).attr("y2",ih).attr("stroke","var(--axis)");

  /* Layers */
  const diffLayer = g.append("g").attr("aria-hidden","true");
  const leftG = g.append("g").attr("class","left-layer");
  const rightG = g.append("g").attr("class","right-layer");
  const valueG = g.append("g").attr("class","value-layer");

  /* Helpers */
  const fmt = d3.format(".0f");
  const fmtShort = d3.format("~s");

  function setStatus(msg){
    const el = statusSelector ? document.querySelector(statusSelector) : null;
    if (el) el.textContent = msg || '';
  }

  function updateStatusMessage(){
    if (!lastLoadInfo || !lastLoadInfo.total) return;
    const modeText = state.sortByDiff
      ? 'by largest gap.'
      : 'alphabetically by category.';
    setStatus(`Showing top ${lastLoadInfo.shown} of ${lastLoadInfo.total} categories ${modeText}`);
  }

  function openDetail(d){
    const titleEl = document.getElementById('detailTitleFull');
    const metaEl = document.getElementById('detailMetaFull');
    const leftLabelEl = document.getElementById('detailLeftLabel');
    const rightLabelEl = document.getElementById('detailRightLabel');
    const leftFill = document.getElementById('detailLeftFill');
    const rightFill = document.getElementById('detailRightFill');
    const statLabelLeft = document.getElementById('statLabelLeft');
    const statLabelRight = document.getElementById('statLabelRight');
    const statValueLeft = document.getElementById('statValueLeft');
    const statValueRight = document.getElementById('statValueRight');
    const statTotal = document.getElementById('statTotal');
    const statDiff = document.getElementById('statDiff');
    const statShareLabel = document.getElementById('statShareLabel');
    const statShare = document.getElementById('statShare');
    const statRank = document.getElementById('statRank');

    if (!titleEl) return;

    titleEl.textContent = d.age;

    // compute analytics
    const total = d.male + d.female;
    const diff = d.female - d.male; 
    const absDiff = Math.abs(diff);
    const percRight = total ? (d.female / total) * 100 : 0;
    const percDiff = total ? (absDiff / total) * 100 : 0;

    const sortedByDiff = [...state.data].sort((a,b)=>Math.abs(b.male-b.female)-Math.abs(a.male-a.female));
    const rank = sortedByDiff.findIndex(x=>x.age===d.age) + 1;

    const sideLead = diff > 0 ? sideRightLabel : diff < 0 ? sideLeftLabel : 'Neither side';
    const leadText = diff === 0
      ? 'Both sides are equal here.'
      : `${sideLead} leads by ${fmtShort(absDiff)} (${percDiff.toFixed(1)}% of total).`;

    if (metaEl) metaEl.textContent = leadText;

    const leftPct = total ? (d.male / total) * 100 : 0;
    const rightPct = total ? (d.female / total) * 100 : 0;

    if (leftLabelEl) leftLabelEl.textContent = `${sideLeftLabel} (${fmtShort(d.male)})`;
    if (rightLabelEl) rightLabelEl.textContent = `${sideRightLabel} (${fmtShort(d.female)})`;
    if (leftFill) leftFill.style.width = `${leftPct.toFixed(1)}%`;
    if (rightFill) rightFill.style.width = `${rightPct.toFixed(1)}%`;

    if (statLabelLeft) statLabelLeft.textContent = sideLeftLabel;
    if (statLabelRight) statLabelRight.textContent = sideRightLabel;
    if (statValueLeft) statValueLeft.textContent = fmtShort(d.male);
    if (statValueRight) statValueRight.textContent = fmtShort(d.female);
    if (statTotal) statTotal.textContent = fmtShort(total);
    if (statDiff) statDiff.textContent = `${diff > 0 ? '+' : diff < 0 ? '-' : ''}${fmtShort(absDiff)}`;
    if (statShareLabel) statShareLabel.textContent = `${sideRightLabel} share`;
    if (statShare) statShare.textContent = `${percRight.toFixed(1)}%`;
    if (statRank) statRank.textContent = `#${rank} by gap`;

    document.body.dataset.view = 'detail';
  }
  function closeDetail(){
    document.body.dataset.view = '';
  }

  function updateTheme(name = state.theme, animate = true){
    const t = themes[name] || themes.LightPG;
    const dur = (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? 400 : 0;
    gradL.selectAll("stop").data(t.left).transition().duration(dur).attr("stop-color", d=>d);
    gradR.selectAll("stop").data(t.right).transition().duration(dur).attr("stop-color", d=>d);
    const darkOn = /^Dark/.test(name);
    document.documentElement.dataset.dark = darkOn ? "true" : "false";
    if (darkOn){
      document.documentElement.style.setProperty('--text', '#f1f5f9');
      document.documentElement.style.setProperty('--bg-grad', '#000000');
      document.documentElement.style.setProperty('--panel', 'transparent');
      document.documentElement.style.setProperty('--panel-border', 'transparent');
      document.documentElement.style.setProperty('--muted', '#ffffff');
      document.documentElement.style.setProperty('--axis', '#ffffff');
      document.documentElement.style.setProperty('--grid', '#111827');
    } else {
      document.documentElement.style.setProperty('--bg-grad', '#ffffff');
      document.documentElement.style.setProperty('--panel', '#ffffff');
      document.documentElement.style.setProperty('--panel-border', 'transparent');
      document.documentElement.style.setProperty('--axis', '#111827');
      document.documentElement.style.setProperty('--grid', '#e5e7eb');
      document.documentElement.style.setProperty('--text', '#000000');
      document.documentElement.style.setProperty('--muted', '#111827');
    }
  }

  function updateScales(){
    const baseMax = maxMF(state.data || []);
    maxVal = baseMax || 0;
    xAll.domain([-maxVal,maxVal]);
    xLeft.domain([0,maxVal]).range([xAll(0), xAll(-maxVal)]);
    xRight.domain([0,maxVal]).range([xAll(0), xAll(maxVal)]);
    y.domain((state.data || []).map(d=>d.age));
  }
  function truncateLabel(name){
    const s = String(name || '').trim();
    return s.length > 20 ? s.slice(0, 20) + '…' : s;
  }
  function getTicks(){
    // Let d3 pick a nice set of symmetric ticks around 0 based on the data range
    if (!maxVal || !Number.isFinite(maxVal)) {
      return d3.ticks(-100, 100, 4);
    }
    const maxAbs = Math.max(0, maxVal);
    const tickCount = 6; // aim for ~5–7 labels total
    return d3.ticks(-maxAbs, maxAbs, tickCount);
  }
  function drawAxes(){
    const ticks = getTicks();
    axisTopG.call(
      d3.axisTop(xAll)
        .tickValues(ticks)
        .tickFormat(v => fmtShort(Math.abs(v)))
        .tickSizeOuter(0)
    );
    
    if (axisLeftTextNode){
      axisLeftTextNode
        .attr("x", xAll(-maxVal) + 16)
        .attr("y", -32)
        .text(sideLeftLabel);
    }
    if (axisRightTextNode){
      axisRightTextNode
        .attr("x", xAll(maxVal) - 16)
        .attr("y", -32)
        .text(sideRightLabel);
    }
    axisLeftG.attr("transform","translate(0,0)")
      .call(d3.axisLeft(y)
        .tickSize(0)
        .tickPadding(28)
        .tickFormat(truncateLabel)
      );
    axisLeftG.selectAll("path.domain").attr("display","none");
    axisLeftG.selectAll("text")
      .attr("fill","var(--muted)")
      .style("font-weight",600)
      .each(function(d){
        const full = String(d || '').trim();
        if (!full) return;
        d3.select(this).selectAll('title').remove();
        d3.select(this).append('title').text(full);
      });
    gridG.selectAll("*").remove();
    if (state.grid){
      const ticks = getTicks();
      gridG
        .attr("transform", `translate(0,${ih})`)
        .call(
          d3.axisBottom(xAll)
            .tickValues(ticks)
            .tickSize(-ih)
            .tickFormat("")
        );
      gridG.selectAll(".domain").remove();
    }
  }
  function clearMode(){
    leftG.selectAll("*").remove();
    rightG.selectAll("*").remove();
    diffLayer.selectAll("*").remove();
    valueG.selectAll("*").remove();
  }

  function renderBars(){
    diffLayer.selectAll("*").remove();

    const leftRow = leftG.selectAll("g.leftG").data(state.data || [], d=>d.age)
      .join(enter => enter.append("g").attr("class","leftG")
        .attr("transform", d=>`translate(0,${y(d.age)})`)
        .attr("data-y", d=>y(d.age))
        .call(g=>g.append("rect").attr("class","bar-left")
          .attr("height", y.bandwidth())
          .attr("rx", Math.min(18, y.bandwidth() / 2))
          .attr("ry", Math.min(18, y.bandwidth() / 2))
          .attr("fill", "url(#gradL)")
          .attr("opacity", 1)
        )
      );
    leftRow.attr("transform", d=>`translate(0,${y(d.age)})`).attr("data-y", d=>y(d.age));
    leftRow.select("rect")
      .attr("x", d => xAll(-d.male))
      .attr("width", d => xAll(0) - xAll(-d.male))
      .attr("height", y.bandwidth())
      .attr("opacity", 1);

    const rightRow = rightG.selectAll("g.rightG").data(state.data || [], d=>d.age)
      .join(enter => enter.append("g").attr("class","rightG")
        .attr("transform", d=>`translate(0,${y(d.age)})`)
        .attr("data-y", d=>y(d.age))
        .call(g=>g.append("rect").attr("class","bar-right")
          .attr("x", xRight(0))
          .attr("height", y.bandwidth())
          .attr("rx", Math.min(18, y.bandwidth() / 2))
          .attr("ry", Math.min(18, y.bandwidth() / 2))
          .attr("fill", "url(#gradR)")
          .attr("opacity", 1)
        )
      );
    rightRow.attr("transform", d=>`translate(0,${y(d.age)})`).attr("data-y", d=>y(d.age));
    rightRow.select("rect")
      .attr("x", xAll(0))
      .attr("width", d => xAll(d.female) - xAll(0))
      .attr("height", y.bandwidth())
      .attr("rx", Math.min(18, y.bandwidth() / 2))
      .attr("ry", Math.min(18, y.bandwidth() / 2));

    g.selectAll(".age-label").remove();

    leftG.raise();
    rightG.raise();
    addHover();
    drawValuesIfNeeded();
  }

  function drawValuesIfNeeded(){
    valueG.selectAll("*").remove();
    if (!state.showValues) return;
    valueG.raise();
    const large = maxVal >= 1e6;
    const f = large ? fmtShort : fmt;
    const fs = large ? 10 : 12;
    valueG.selectAll("text.val").data(state.data || [], d=>d.age).join("text")
      .attr("class","val")
      .attr("font-size", fs).attr("font-weight", 700)
      .attr("fill", "var(--text)")
      .attr("stroke","#fff").attr("stroke-width",3).attr("paint-order","stroke")
      .attr("text-anchor", "middle")
      .attr("x", iw/2).attr("y", d=>y(d.age)+y.bandwidth()/2+4)
      .text(d => `${f(d.male)} • ${f(d.female)}`);
  }

  function addHover(){
    if (!state.data || state.data.length > 800) return;
    const leftItems = g.selectAll('g.leftG');
    const rightItems = g.selectAll('g.rightG');

    leftItems.attr('tabindex', 0)
      .attr('role','button')
      .attr('aria-label', d => `${d.age}. ${sideLeftLabel} ${d.male}. ${sideRightLabel} ${d.female}.`)
      .on('mouseenter', function(event, d){ showTip(event, d, 'left'); })
      .on('mousemove', e => { moveTip(e); })
      .on('mouseleave', function(){ hideTip(); })
      .on('click', function(event, d){ hideTip(); openDetail(d); });

    rightItems.attr('tabindex', 0)
      .attr('role','button')
      .attr('aria-label', d => `${d.age}. ${sideLeftLabel} ${d.male}. ${sideRightLabel} ${d.female}.`)
      .on('mouseenter', function(event, d){ showTip(event, d, 'right'); })
      .on('mousemove', e => { moveTip(e); })
      .on('mouseleave', function(){ hideTip(); })
      .on('click', function(event, d){ hideTip(); openDetail(d); });

    svg.on('mouseleave', () => hideTip());
  }

  function render(){
    updateScales();
    drawAxes();
    clearMode();
    renderBars();

    if (state.data && state.data.length > 120){
      setStatus('Showing many categories — interactivity reduced for performance.');
    }
  }
  
  try{
    const backBtn = document.getElementById('detailBack');
    if (backBtn) backBtn.addEventListener('click', closeDetail);
    document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeDetail(); });
  }catch(e){}

  function getBaseData(){
    return structuredClone(state.data || []);
  }

  function applyLimitForView(){
    setStatus('');
    state.data = getBaseData();
    updateTheme(state.theme);
    applySort();
    render();
    updateStatusMessage();
    if (typeof updateSortButton === 'function') updateSortButton();
  }

  function applySort(){
    const arr = [...(state.data || [])];
    if (state.sortByDiff){
      arr.sort((a,b)=>Math.abs(b.male-b.female)-Math.abs(a.male-a.female));
    } else {
      arr.sort((a,b)=> d3.ascending(a.age, b.age));
    }
    state.data = arr;
  }

  function updateSortButton(){
    const btn = sortButtonSelector ? document.querySelector(sortButtonSelector) : null;
    if (!btn) return;
    btn.textContent = state.sortByDiff ? 'Sorted by Diff' : 'Sorted A–Z';
    btn.setAttribute('aria-pressed', String(state.sortByDiff));
  }

  const sortBtn = sortButtonSelector ? document.querySelector(sortButtonSelector) : null;
  if (sortBtn){
    sortBtn.addEventListener('click', ()=>{
      state.sortByDiff = !state.sortByDiff;
      applySort();
      render();
      updateSortButton();
      updateStatusMessage();
    });
  }

  document.addEventListener('keydown', (e)=>{
    if (e.shiftKey && (e.key==='D' || e.key==='d')){
      state.sortByDiff = !state.sortByDiff;
      applySort();
      render();
      updateSortButton();
      updateStatusMessage();
    }
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.body.style.animation="none";

  updateTheme(state.theme, false);

  loadData().then(rows => {
    state.data = rows;
    applyLimitForView();
  });

  svg.style("opacity",0).transition().duration(800).ease(d3.easeCubicOut).style("opacity",1);
}
