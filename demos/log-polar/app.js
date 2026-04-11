// app.js — main simulation loop for log-polar retina demo

const sceneCanvas = document.getElementById('sceneCanvas');
const flowCanvas  = document.getElementById('flowCanvas');
const logCanvas   = document.getElementById('logCanvas');
const sceneCtx    = sceneCanvas.getContext('2d');
const flowCtx     = flowCanvas.getContext('2d');
const logCtx      = logCanvas.getContext('2d');

const W   = sceneCanvas.width;
const H   = sceneCanvas.height;
const TAU = Math.PI * 2;

const ui = {
  motionMode:       document.getElementById('motionMode'),
  toggleBtn:        document.getElementById('toggleBtn'),
  resetBtn:         document.getElementById('resetBtn'),
  centreBtn:        document.getElementById('centreBtn'),
  forwardSpeed:     document.getElementById('forwardSpeed'),
  spinSpeed:        document.getElementById('spinSpeed'),
  fixX:             document.getElementById('fixX'),
  fixY:             document.getElementById('fixY'),
  depthRange:       document.getElementById('depthRange'),
  spacingRange:     document.getElementById('spacingRange'),
  mapStyle:         document.getElementById('mapStyle'),
  kernelType:       document.getElementById('kernelType'),
  radialBins:       document.getElementById('radialBins'),
  angularBins:      document.getElementById('angularBins'),
  showTrails:       document.getElementById('showTrails'),
  showVectors:      document.getElementById('showVectors'),
  showGrid:         document.getElementById('showGrid'),
  showStructure:    document.getElementById('showStructure'),
  forwardSpeedValue:document.getElementById('forwardSpeedValue'),
  spinSpeedValue:   document.getElementById('spinSpeedValue'),
  fixXValue:        document.getElementById('fixXValue'),
  fixYValue:        document.getElementById('fixYValue'),
  depthRangeValue:  document.getElementById('depthRangeValue'),
  spacingValue:     document.getElementById('spacingValue'),
  radialBinsValue:  document.getElementById('radialBinsValue'),
  angularBinsValue: document.getElementById('angularBinsValue'),
  modeHeadline:     document.getElementById('modeHeadline'),
  modeBody:         document.getElementById('modeBody'),
  flowReadout:      document.getElementById('flowReadout'),
  mapHeadline:      document.getElementById('mapHeadline'),
  mapBody:          document.getElementById('mapBody')
};

const state = {
  mode: 'forward',
  playing: true,
  fixationX: W / 2,
  fixationY: H / 2,
  forwardSpeed: 6.2,
  spinSpeed: 0.55,
  depthRange: 26,
  spacing: 3.4,
  mapStyle: 'continuous',
  kernelType: 'uniform',
  radialBins: 18,
  angularBins: 36,
  showTrails: true,
  showVectors: true,
  showGrid: true,
  showStructure: true,
  focal: 265,
  near: 0.6,
  corridorHalfWidth: 4.6,
  corridorHalfHeight: 2.6,
  cameraZ: 0,
  cameraSpin: 0,
  totalLength: 0,
  slices: [],
  nextSliceSerial: 1,
  trailMap: new Map(),
  visibleFeatures: [],
  flowVectors: [],
  avgLPdx: 0,
  avgLPdy: 0,
  retinaReceptor: [],
  retinaAdapted: [],
  retinaOn: [],
  retinaOff: [],
  retinaSpikes: [],
  prevRetinaOn: [],
  prevRetinaOff: [],
  lastTime: performance.now()
};

const featureTemplates = [
  { x: -4.1, y:  1.6,   kind: 'left' },
  { x: -4.1, y:  0.6,   kind: 'left' },
  { x: -4.1, y: -0.6,   kind: 'left' },
  { x: -4.1, y: -1.6,   kind: 'left' },
  { x:  4.1, y:  1.6,   kind: 'right' },
  { x:  4.1, y:  0.6,   kind: 'right' },
  { x:  4.1, y: -0.6,   kind: 'right' },
  { x:  4.1, y: -1.6,   kind: 'right' },
  { x: -2.4, y: -2.25,  kind: 'floor' },
  { x:  0.0, y: -2.25,  kind: 'centre' },
  { x:  2.4, y: -2.25,  kind: 'floor' },
  { x: -1.4, y:  2.15,  kind: 'ceiling' },
  { x:  1.4, y:  2.15,  kind: 'ceiling' }
];

const featureColours = {
  left:    'rgba(118,182,255,0.95)',
  right:   'rgba(255,181,111,0.95)',
  floor:   'rgba(143,240,212,0.95)',
  centre:  'rgba(255,255,255,0.95)',
  ceiling: 'rgba(198,184,255,0.95)'
};

// ── Utilities ─────────────────────────────────────────────────
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function fmt(v, digits = 2) { return Number(v).toFixed(digits); }
function gridIndex(r, a)    { return r * state.angularBins + a; }
function gridSize()         { return state.radialBins * state.angularBins; }

// ── Simulation init ───────────────────────────────────────────
function resetSimulation() {
  state.cameraZ    = 0;
  state.cameraSpin = 0;
  state.flowVectors = [];
  state.visibleFeatures = [];
  state.avgLPdx = 0;
  state.avgLPdy = 0;
  state.trailMap.clear();
  initSlices();
  ensureRetinaBuffers();
  clearRetinaGrid(state.retinaReceptor);
  clearRetinaGrid(state.retinaAdapted);
  clearRetinaGrid(state.retinaOn);
  clearRetinaGrid(state.retinaOff);
  clearRetinaGrid(state.retinaSpikes);
  clearRetinaGrid(state.prevRetinaOn);
  clearRetinaGrid(state.prevRetinaOff);
}

function initSlices() {
  state.totalLength = Math.ceil((state.depthRange + 10) / state.spacing) * state.spacing;
  const sliceCount  = Math.ceil(state.totalLength / state.spacing);
  const start       = 2.2;
  state.slices = [];
  state.nextSliceSerial = 1;
  for (let i = 0; i < sliceCount; i++) {
    state.slices.push({ zWorld: start + i * state.spacing, serial: state.nextSliceSerial++ });
  }
}

// ── Motion & projection ────────────────────────────────────────
function getModeSpeeds() {
  if (state.mode === 'forward') return { forward: state.forwardSpeed, spin: 0 };
  if (state.mode === 'spin')    return { forward: 0, spin: state.spinSpeed };
  return { forward: state.forwardSpeed, spin: state.spinSpeed };
}

function getVisibleSlices() {
  const visible = [];
  for (const slice of state.slices) {
    const zRel = slice.zWorld - state.cameraZ;
    if (zRel > state.near && zRel <= state.depthRange + 6.5)
      visible.push({ z: zRel, serial: slice.serial });
  }
  visible.sort((a, b) => b.z - a.z);
  return visible;
}

function projectWorldPoint(x, y, zRel) {
  const zCam = zRel;
  if (zCam <= state.near) return null;
  const baseX = state.fixationX + (x / zCam) * state.focal;
  const baseY = state.fixationY - (y / zCam) * state.focal;
  const dx = baseX - state.fixationX;
  const dy = baseY - state.fixationY;
  const cosS = Math.cos(state.cameraSpin);
  const sinS = Math.sin(state.cameraSpin);
  const sx = state.fixationX + dx * cosS - dy * sinS;
  const sy = state.fixationY + dx * sinS + dy * cosS;
  if (sx < -120 || sx > W + 120 || sy < -120 || sy > H + 120) return null;
  return { sx, sy, zCam };
}

function getFeatureList() {
  const slices    = getVisibleSlices();
  const maxRadius = Math.hypot(
    Math.max(state.fixationX, W - state.fixationX),
    Math.max(state.fixationY, H - state.fixationY)
  );
  const features = [];
  for (const slice of slices) {
    for (let j = 0; j < featureTemplates.length; j++) {
      const tpl = featureTemplates[j];
      const p   = projectWorldPoint(tpl.x, tpl.y, slice.z);
      if (!p) continue;
      const dx     = p.sx - state.fixationX;
      const dy     = p.sy - state.fixationY;
      const radius = Math.max(1.5, Math.hypot(dx, dy));
      const theta  = Math.atan2(dy, dx);
      const u = ((theta + Math.PI) / TAU) * W;
      const v = ((Math.log(radius) - Math.log(1.5)) / (Math.log(maxRadius) - Math.log(1.5))) * H;
      features.push({
        id: slice.serial * 100 + j,
        kind: tpl.kind,
        sx: p.sx, sy: p.sy,
        u, v,
        z: p.zCam,
        pointSize: clamp((state.focal / p.zCam) * 0.18 + 2.1, 1.6, 7.5)
      });
    }
  }
  return features;
}

function getFrames() {
  const slices = getVisibleSlices();
  const frames = [];
  for (const slice of slices) {
    const corners = [
      projectWorldPoint(-state.corridorHalfWidth, -state.corridorHalfHeight, slice.z),
      projectWorldPoint( state.corridorHalfWidth, -state.corridorHalfHeight, slice.z),
      projectWorldPoint( state.corridorHalfWidth,  state.corridorHalfHeight, slice.z),
      projectWorldPoint(-state.corridorHalfWidth,  state.corridorHalfHeight, slice.z)
    ];
    if (corners.every(Boolean)) frames.push({ z: slice.z, corners });
  }
  return frames;
}

function updateMotion(dt) {
  const motion = getModeSpeeds();
  state.cameraZ    += motion.forward * dt;
  state.cameraSpin += motion.spin    * dt;
  for (const slice of state.slices) {
    while (slice.zWorld - state.cameraZ < state.near + 0.65) {
      slice.zWorld += state.totalLength;
      slice.serial  = state.nextSliceSerial++;
    }
  }
}

function updateFeaturesAndFlow() {
  state.visibleFeatures = getFeatureList();
  state.flowVectors = [];
  let sumDx = 0, sumDy = 0, count = 0;
  const currentIds  = new Set();
  const edgeMargin  = 20;

  for (const f of state.visibleFeatures) {
    currentIds.add(f.id);
    const prev     = state.trailMap.get(f.id);
    const nearEdge = f.sx < edgeMargin || f.sx > W - edgeMargin ||
                     f.sy < edgeMargin || f.sy > H - edgeMargin;

    if (!prev) {
      state.trailMap.set(f.id, {
        sx: f.sx, sy: f.sy, u: f.u, v: f.v,
        age: 0, smoothDx: 0, smoothDy: 0,
        history: [{ x: f.u, y: f.v }]
      });
      continue;
    }

    let du = f.u - prev.u;
    if (du >  W / 2) du -= W;
    if (du < -W / 2) du += W;
    const dv       = f.v - prev.v;
    const rawDx    = f.sx - prev.sx;
    const rawDy    = f.sy - prev.sy;
    const cartJump = Math.hypot(rawDx, rawDy);
    const seamJump = Math.abs(f.u - prev.u) > W * 0.45;
    const tooClose = f.z < 1.45;
    const unstable = nearEdge || cartJump > 42 || Math.abs(dv) > 28 || tooClose;

    if (unstable) {
      prev.sx = f.sx; prev.sy = f.sy;
      prev.u  = f.u;  prev.v  = f.v;
      prev.age = 0; prev.smoothDx = 0; prev.smoothDy = 0;
      prev.history = [{ x: f.u, y: f.v }];
      continue;
    }

    prev.age     += 1;
    prev.smoothDx = prev.smoothDx * 0.68 + rawDx * 0.32;
    prev.smoothDy = prev.smoothDy * 0.68 + rawDy * 0.32;

    if (prev.age >= 2) {
      state.flowVectors.push({
        id: f.id, kind: f.kind,
        x0: prev.sx, y0: prev.sy, x1: f.sx, y1: f.sy,
        drawDx: prev.smoothDx, drawDy: prev.smoothDy,
        u0: prev.u, v0: prev.v, u1: f.u, v1: f.v,
        du, dv, seamJump, z: f.z
      });
      sumDx += du; sumDy += dv; count++;
    }

    prev.sx = f.sx; prev.sy = f.sy;
    prev.u  = f.u;  prev.v  = f.v;
    prev.history.push({ x: f.u, y: f.v });
    if (prev.history.length > 22) prev.history.shift();
  }

  for (const id of Array.from(state.trailMap.keys())) {
    if (!currentIds.has(id)) state.trailMap.delete(id);
  }

  state.avgLPdx = count ? sumDx / count : 0;
  state.avgLPdy = count ? sumDy / count : 0;
  updateRetinaMap();
}

// ── Scene drawing ─────────────────────────────────────────────
function drawBackdrop(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0e1a2b');
  grad.addColorStop(1, '#07111b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(
    state.fixationX, state.fixationY, 0,
    state.fixationX, state.fixationY, W * 0.75
  );
  glow.addColorStop(0, 'rgba(118,182,255,0.08)');
  glow.addColorStop(1, 'rgba(118,182,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function drawFixation(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgba(143,240,212,0.95)';
  ctx.fillStyle   = 'rgba(143,240,212,0.16)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.arc(state.fixationX, state.fixationY, 19, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(state.fixationX - 9, state.fixationY);
  ctx.lineTo(state.fixationX + 9, state.fixationY);
  ctx.moveTo(state.fixationX, state.fixationY - 9);
  ctx.lineTo(state.fixationX, state.fixationY + 9);
  ctx.stroke();
  ctx.restore();
}

function drawArrow(ctx, x0, y0, x1, y1, scale = 1) {
  const dx = x1 - x0, dy = y1 - y0;
  if (Math.hypot(dx, dy) < 0.35) return;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  const angle = Math.atan2(dy, dx);
  const head  = 4.8 * scale;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(angle - 0.42) * head, y1 - Math.sin(angle - 0.42) * head);
  ctx.lineTo(x1 - Math.cos(angle + 0.42) * head, y1 - Math.sin(angle + 0.42) * head);
  ctx.closePath();
  ctx.fill();
}

function drawCorridorStructure(ctx, faint = false) {
  if (!state.showStructure) return;
  const frames = getFrames();
  if (!frames.length) return;
  ctx.save();
  ctx.lineWidth   = faint ? 1 : 1.6;
  ctx.strokeStyle = faint ? 'rgba(255,255,255,0.11)' : 'rgba(233,241,255,0.22)';
  for (let i = 0; i < frames.length; i++) {
    const c = frames[i].corners;
    ctx.beginPath();
    ctx.moveTo(c[0].sx, c[0].sy);
    ctx.lineTo(c[1].sx, c[1].sy);
    ctx.lineTo(c[2].sx, c[2].sy);
    ctx.lineTo(c[3].sx, c[3].sy);
    ctx.closePath();
    ctx.stroke();
    if (i < frames.length - 1) {
      const n = frames[i + 1].corners;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(c[k].sx, c[k].sy);
        ctx.lineTo(n[k].sx, n[k].sy);
        ctx.stroke();
      }
    }
  }
  ctx.strokeStyle = faint ? 'rgba(143,240,212,0.14)' : 'rgba(143,240,212,0.28)';
  ctx.setLineDash([7, 6]);
  const centreLine = frames
    .map(frame => projectWorldPoint(0, -state.corridorHalfHeight, frame.z))
    .filter(Boolean);
  if (centreLine.length > 1) {
    ctx.beginPath();
    ctx.moveTo(centreLine[0].sx, centreLine[0].sy);
    for (let i = 1; i < centreLine.length; i++) ctx.lineTo(centreLine[i].sx, centreLine[i].sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawFeatureMarkers(ctx, alphaScale = 1) {
  for (const f of state.visibleFeatures) {
    const alpha  = clamp((1.05 - f.z / (state.depthRange + 6)) * alphaScale, 0.18, 1);
    const colour = featureColours[f.kind].replace(/0\.95\)/, `${alpha.toFixed(3)})`);
    ctx.fillStyle = colour;
    if (f.kind === 'left' || f.kind === 'right') {
      const w = f.pointSize * 1.25;
      const h = f.pointSize * 0.95;
      ctx.fillRect(f.sx - w * 0.5, f.sy - h * 0.5, w, h);
    } else {
      ctx.beginPath();
      ctx.arc(f.sx, f.sy, f.pointSize * 0.48, 0, TAU);
      ctx.fill();
    }
  }
}

function drawScene() {
  drawBackdrop(sceneCtx);
  drawCorridorStructure(sceneCtx, false);
  drawFeatureMarkers(sceneCtx, 1);
  drawFixation(sceneCtx);
  sceneCtx.fillStyle = 'rgba(150,171,201,0.92)';
  sceneCtx.font = '13px system-ui, sans-serif';
  sceneCtx.fillText('Click to move fixation — keep it near corridor centre for cleaner separation', 12, 22);
}

function drawFlowField() {
  drawBackdrop(flowCtx);
  drawCorridorStructure(flowCtx, true);
  drawFeatureMarkers(flowCtx, 0.32);
  if (state.showVectors) {
    flowCtx.save();
    flowCtx.strokeStyle = 'rgba(255,181,111,0.92)';
    flowCtx.fillStyle   = 'rgba(255,181,111,0.92)';
    flowCtx.lineWidth   = 1.9;
    const arrowScale    = 6.5;
    let drawn = 0;
    for (let i = 0; i < state.flowVectors.length; i++) {
      const vec = state.flowVectors[i];
      if (vec.z < 1.8) continue;
      if (drawn % 2 === 1) { drawn++; continue; }
      drawArrow(flowCtx,
        vec.x1, vec.y1,
        vec.x1 + vec.drawDx * arrowScale,
        vec.y1 + vec.drawDy * arrowScale, 1.15);
      drawn++;
    }
    flowCtx.restore();
  }
  drawFixation(flowCtx);
  flowCtx.fillStyle = 'rgba(150,171,201,0.92)';
  flowCtx.font = '13px system-ui, sans-serif';
  flowCtx.fillText('Orange arrows — stable tracked features only', 12, 22);
}

// ── Readouts ──────────────────────────────────────────────────
function updateReadouts() {
  ui.forwardSpeedValue.textContent = `${fmt(state.forwardSpeed, 1)} u/s`;
  ui.spinSpeedValue.textContent    = `${fmt(state.spinSpeed, 2)} rad/s`;
  ui.fixXValue.textContent         = `${Math.round(state.fixationX)} px`;
  ui.fixYValue.textContent         = `${Math.round(state.fixationY)} px`;
  ui.depthRangeValue.textContent   = `${state.depthRange} u`;
  ui.spacingValue.textContent      = `${fmt(state.spacing, 1)} u`;
  ui.radialBinsValue.textContent   = `${state.radialBins}`;
  ui.angularBinsValue.textContent  = `${state.angularBins}`;

  // Fixed Unicode: Δθ · Δln(r)
  const dx = state.avgLPdx / W;
  const dy = state.avgLPdy / H;
  ui.flowReadout.textContent = `Δθ ${fmt(dx, 3)} · Δln(r) ${fmt(dy, 3)}`;

  const fixOffset   = Math.hypot(state.fixationX - W / 2, state.fixationY - H / 2);
  const centredHint = fixOffset < 35
    ? 'Fixation is close to the corridor centre, so the separation should look cleaner.'
    : 'Fixation is off-centre — expect more mixing between the two components.';

  if (state.mode === 'forward') {
    ui.modeHeadline.textContent = 'Forward motion → mostly vertical drift';
    ui.modeBody.textContent = `Doorway frames expand away from fixation. In log-polar space, radial expansion reorganises mainly as motion along log-radius. ${centredHint}`;
  } else if (state.mode === 'spin') {
    ui.modeHeadline.textContent = 'Spin → mostly horizontal drift';
    ui.modeBody.textContent = 'Camera spin rotates the whole image around fixation. In log-polar space that rotation becomes a mostly horizontal shift (angle changes, radius stays nearly constant).';
  } else {
    ui.modeHeadline.textContent = 'Combined: two tendencies easier to factorise';
    ui.modeBody.textContent = `Forward translation expands the corridor while spin rotates the image. In the transformed view those effects read as vertical and horizontal tendencies rather than a tangled single flow field. ${centredHint}`;
  }

  const mapText = {
    continuous: {
      head: 'Continuous transform',
      body: 'Best for reading the geometry directly. A plain image-space transform with overlaid trails and flow vectors.'
    },
    mosaic: {
      head: 'Kernel mosaic',
      body: 'Features are pooled into discrete log-polar bins. Closer in spirit to a log-polar kernel arrangement than the continuous view.'
    },
    receptor: {
      head: 'Receptor-like map',
      body: 'Shows pooled signal strength across the log-polar mosaic. A browser approximation of sampled receptor activity.'
    },
    bipolar: {
      head: 'Bipolar ON/OFF map',
      body: 'Simple centre-surround contrast stage. Green bins are ON-like; orange bins are OFF-like.'
    },
    ganglion: {
      head: 'Ganglion-like spikes',
      body: 'Thresholded change in the ON/OFF maps over time — a crude spiking approximation, not the exact package internals.'
    }
  };
  ui.mapHeadline.textContent = mapText[state.mapStyle].head;
  ui.mapBody.textContent     = mapText[state.mapStyle].body;
}

function syncUI() {
  ui.motionMode.value    = state.mode;
  ui.toggleBtn.textContent = state.playing ? 'Pause' : 'Play';
  ui.forwardSpeed.value  = state.forwardSpeed;
  ui.spinSpeed.value     = state.spinSpeed;
  ui.fixX.value          = state.fixationX;
  ui.fixY.value          = state.fixationY;
  ui.depthRange.value    = state.depthRange;
  ui.spacingRange.value  = state.spacing;
  ui.mapStyle.value      = state.mapStyle;
  ui.kernelType.value    = state.kernelType;
  ui.radialBins.value    = state.radialBins;
  ui.angularBins.value   = state.angularBins;
  ui.showTrails.checked  = state.showTrails;
  ui.showVectors.checked = state.showVectors;
  ui.showGrid.checked    = state.showGrid;
  ui.showStructure.checked = state.showStructure;
  updateReadouts();
}

function bindUI() {
  ui.motionMode.addEventListener('change', e => { state.mode = e.target.value; });
  ui.toggleBtn.addEventListener('click', () => {
    state.playing = !state.playing;
    ui.toggleBtn.textContent = state.playing ? 'Pause' : 'Play';
  });
  ui.resetBtn.addEventListener('click', () => { resetSimulation(); });
  ui.centreBtn.addEventListener('click', () => {
    state.fixationX = W / 2;
    state.fixationY = H / 2;
    syncUI();
  });
  ui.forwardSpeed.addEventListener('input', e => { state.forwardSpeed = Number(e.target.value); updateReadouts(); });
  ui.spinSpeed.addEventListener('input',    e => { state.spinSpeed    = Number(e.target.value); updateReadouts(); });
  ui.fixX.addEventListener('input',         e => { state.fixationX   = Number(e.target.value); updateReadouts(); });
  ui.fixY.addEventListener('input',         e => { state.fixationY   = Number(e.target.value); updateReadouts(); });
  ui.depthRange.addEventListener('input',   e => { state.depthRange  = Number(e.target.value); resetSimulation(); updateReadouts(); });
  ui.spacingRange.addEventListener('input', e => { state.spacing     = Number(e.target.value); resetSimulation(); updateReadouts(); });
  ui.mapStyle.addEventListener('change',    e => { state.mapStyle    = e.target.value; updateReadouts(); });
  ui.kernelType.addEventListener('change',  e => { state.kernelType  = e.target.value; });
  ui.radialBins.addEventListener('input',   e => { state.radialBins  = Number(e.target.value); ensureRetinaBuffers(); updateReadouts(); });
  ui.angularBins.addEventListener('input',  e => { state.angularBins = Number(e.target.value); ensureRetinaBuffers(); updateReadouts(); });
  ui.showTrails.addEventListener('change',    e => { state.showTrails    = e.target.checked; });
  ui.showVectors.addEventListener('change',   e => { state.showVectors   = e.target.checked; });
  ui.showGrid.addEventListener('change',      e => { state.showGrid      = e.target.checked; });
  ui.showStructure.addEventListener('change', e => { state.showStructure = e.target.checked; });

  sceneCanvas.addEventListener('click', e => {
    const rect   = sceneCanvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    state.fixationX = clamp((e.clientX - rect.left) * scaleX, 0, W);
    state.fixationY = clamp((e.clientY - rect.top)  * scaleY, 0, H);
    syncUI();
  });
}

// ── Main loop ─────────────────────────────────────────────────
function tick(now) {
  const dt    = Math.min(0.04, (now - state.lastTime) / 1000);
  state.lastTime = now;
  if (state.playing) updateMotion(dt);
  updateFeaturesAndFlow();
  drawScene();
  drawFlowField();
  drawLogPolar();
  updateReadouts();
  requestAnimationFrame(tick);
}

bindUI();
resetSimulation();
syncUI();
requestAnimationFrame(tick);
