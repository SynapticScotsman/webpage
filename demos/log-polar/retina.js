// retina.js — log-polar retinal pipeline stages
// (receptor, bipolar ON/OFF, ganglion-like spikes)

function ensureRetinaBuffers() {
  const size = gridSize();
  if (state.retinaReceptor.length !== size) {
    state.retinaReceptor  = new Array(size).fill(0);
    state.retinaAdapted   = new Array(size).fill(0);
    state.retinaOn        = new Array(size).fill(0);
    state.retinaOff       = new Array(size).fill(0);
    state.retinaSpikes    = new Array(size).fill(0);
    state.prevRetinaOn    = new Array(size).fill(0);
    state.prevRetinaOff   = new Array(size).fill(0);
  }
}

function clearRetinaGrid(arr) {
  for (let i = 0; i < arr.length; i++) arr[i] = 0;
}

function depositFeatureToGrid(feature, grid) {
  const aFloat = (feature.u / W) * state.angularBins;
  const rFloat = (feature.v / H) * state.radialBins;
  const a0 = Math.floor(aFloat);
  const r0 = Math.floor(rFloat);
  const weight = clamp(1.25 - feature.z / (state.depthRange + 4), 0.15, 1.2)
               * (1 + feature.pointSize * 0.08);

  if (state.kernelType === 'uniform') {
    if (r0 >= 0 && r0 < state.radialBins) {
      const a = ((a0 % state.angularBins) + state.angularBins) % state.angularBins;
      grid[gridIndex(r0, a)] += weight;
    }
    return;
  }

  // Gaussian 3×3
  for (let dr = -1; dr <= 1; dr++) {
    const rr = r0 + dr;
    if (rr < 0 || rr >= state.radialBins) continue;
    for (let da = -1; da <= 1; da++) {
      const aa = ((a0 + da) % state.angularBins + state.angularBins) % state.angularBins;
      const dd = dr * dr + da * da;
      const g  = dd === 0 ? 1 : dd === 1 ? 0.56 : 0.30;
      grid[gridIndex(rr, aa)] += weight * g;
    }
  }
}

function blurGrid(source) {
  const out = new Array(source.length).fill(0);
  for (let r = 0; r < state.radialBins; r++) {
    for (let a = 0; a < state.angularBins; a++) {
      let sum = 0, wsum = 0;
      for (let dr = -1; dr <= 1; dr++) {
        const rr = r + dr;
        if (rr < 0 || rr >= state.radialBins) continue;
        for (let da = -1; da <= 1; da++) {
          const aa = ((a + da) % state.angularBins + state.angularBins) % state.angularBins;
          const w  = (dr === 0 && da === 0) ? 1 : (Math.abs(dr) + Math.abs(da) === 1 ? 0.5 : 0.25);
          sum  += source[gridIndex(rr, aa)] * w;
          wsum += w;
        }
      }
      out[gridIndex(r, a)] = wsum ? sum / wsum : 0;
    }
  }
  return out;
}

function updateRetinaMap() {
  ensureRetinaBuffers();
  clearRetinaGrid(state.retinaReceptor);
  clearRetinaGrid(state.retinaAdapted);
  clearRetinaGrid(state.retinaOn);
  clearRetinaGrid(state.retinaOff);
  clearRetinaGrid(state.retinaSpikes);

  for (const f of state.visibleFeatures) depositFeatureToGrid(f, state.retinaReceptor);

  const blurred = blurGrid(state.retinaReceptor);

  for (let i = 0; i < state.retinaReceptor.length; i++) {
    const adapted          = state.retinaReceptor[i] - 0.72 * blurred[i];
    state.retinaAdapted[i] = adapted;
    state.retinaOn[i]      = Math.max(0, adapted);
    state.retinaOff[i]     = Math.max(0, -adapted);

    const dOn  = state.retinaOn[i]  - state.prevRetinaOn[i];
    const dOff = state.retinaOff[i] - state.prevRetinaOff[i];
    state.retinaSpikes[i] = Math.max(0, dOn) + Math.max(0, dOff);

    state.prevRetinaOn[i]  = state.retinaOn[i]  * 0.75 + state.prevRetinaOn[i]  * 0.25;
    state.prevRetinaOff[i] = state.retinaOff[i] * 0.75 + state.prevRetinaOff[i] * 0.25;
  }
}

// ── Drawing helpers ───────────────────────────────────────────

function drawWrappedLogArrow(vec) {
  const endX = vec.u0 + vec.du;
  if (!vec.seamJump && endX >= 0 && endX <= W) {
    drawArrow(logCtx, vec.u0, vec.v0, endX, vec.v0 + vec.dv, 1);
    return;
  }
  drawArrow(logCtx, vec.u0, vec.v0, (endX + W) % W, vec.v0 + vec.dv, 1);
}

function drawGridRects(grid, mode) {
  let maxVal = 0;
  for (let i = 0; i < grid.length; i++) if (grid[i] > maxVal) maxVal = grid[i];
  maxVal = Math.max(maxVal, 0.001);
  const cellW = W / state.angularBins;
  const cellH = H / state.radialBins;

  for (let r = 0; r < state.radialBins; r++) {
    for (let a = 0; a < state.angularBins; a++) {
      const val = grid[gridIndex(r, a)] / maxVal;
      if (val <= 0.02) continue;
      let fill = `rgba(118,182,255,${(0.12 + val * 0.82).toFixed(3)})`;
      if (mode === 'bipolar-on')  fill = `rgba(143,240,212,${(0.12 + val * 0.88).toFixed(3)})`;
      if (mode === 'bipolar-off') fill = `rgba(255,181,111,${(0.12 + val * 0.88).toFixed(3)})`;
      if (mode === 'ganglion')    fill = `rgba(233,241,255,${(0.12 + val * 0.92).toFixed(3)})`;
      logCtx.fillStyle = fill;
      logCtx.fillRect(a * cellW, r * cellH, cellW, cellH);
    }
  }
}

function drawRetinaMosaicMode() {
  if (state.showGrid) {
    logCtx.save();
    logCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    logCtx.lineWidth = 1;
    const cellW = W / state.angularBins;
    const cellH = H / state.radialBins;
    for (let a = 1; a < state.angularBins; a++) {
      logCtx.beginPath(); logCtx.moveTo(a * cellW, 0); logCtx.lineTo(a * cellW, H); logCtx.stroke();
    }
    for (let r = 1; r < state.radialBins; r++) {
      logCtx.beginPath(); logCtx.moveTo(0, r * cellH); logCtx.lineTo(W, r * cellH); logCtx.stroke();
    }
    logCtx.restore();
  }

  if (state.mapStyle === 'mosaic' || state.mapStyle === 'receptor') {
    drawGridRects(state.retinaReceptor, 'receptor');
  } else if (state.mapStyle === 'bipolar') {
    drawGridRects(state.retinaOn,  'bipolar-on');
    drawGridRects(state.retinaOff, 'bipolar-off');
  } else if (state.mapStyle === 'ganglion') {
    drawGridRects(state.retinaSpikes, 'ganglion');
  }
}

function drawContinuousMode() {
  if (state.showGrid) {
    logCtx.save();
    logCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    logCtx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const x = (i / 8) * W;
      const y = (i / 8) * H;
      logCtx.beginPath(); logCtx.moveTo(x, 0); logCtx.lineTo(x, H); logCtx.stroke();
      logCtx.beginPath(); logCtx.moveTo(0, y); logCtx.lineTo(W, y); logCtx.stroke();
    }
    logCtx.restore();
  }

  // Feature dots
  for (const f of state.visibleFeatures) {
    const alpha = clamp(1.08 - f.z / (state.depthRange + 6), 0.18, 0.96);
    const fill  = featureColours[f.kind].replace(/0\.95\)/, `${alpha.toFixed(3)})`);
    logCtx.fillStyle = fill;
    logCtx.beginPath();
    logCtx.arc(f.u, f.v, clamp(f.pointSize * 0.44, 1.1, 4.2), 0, TAU);
    logCtx.fill();
  }

  // Trails
  if (state.showTrails) {
    logCtx.save();
    logCtx.strokeStyle = 'rgba(143,240,212,0.95)';
    logCtx.lineWidth = 2.05;
    for (const entry of state.trailMap.values()) {
      const hist = entry.history;
      if (!hist || hist.length < 2 || entry.age < 2) continue;
      logCtx.beginPath();
      logCtx.moveTo(hist[0].x, hist[0].y);
      let last = hist[0];
      for (let i = 1; i < hist.length; i++) {
        const p = hist[i];
        if (Math.abs(p.x - last.x) > W * 0.45) {
          logCtx.stroke();
          logCtx.beginPath();
          logCtx.moveTo(p.x, p.y);
        } else {
          logCtx.lineTo(p.x, p.y);
        }
        last = p;
      }
      logCtx.stroke();
    }
    logCtx.restore();
  }

  // Flow vectors
  if (state.showVectors) {
    logCtx.save();
    logCtx.strokeStyle = 'rgba(255,181,111,0.84)';
    logCtx.fillStyle   = 'rgba(255,181,111,0.84)';
    logCtx.lineWidth   = 1.4;
    for (let i = 0; i < state.flowVectors.length; i++) {
      if (i % 2 !== 0) continue;
      drawWrappedLogArrow(state.flowVectors[i]);
    }
    logCtx.restore();
  }
}

function drawLogPolar() {
  logCtx.clearRect(0, 0, W, H);
  const grad = logCtx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a1423');
  grad.addColorStop(1, '#07101a');
  logCtx.fillStyle = grad;
  logCtx.fillRect(0, 0, W, H);

  if (state.mapStyle === 'continuous') {
    drawContinuousMode();
  } else {
    drawRetinaMosaicMode();
  }

  // Axis labels (fixed Unicode)
  logCtx.fillStyle = 'rgba(150,171,201,0.92)';
  logCtx.font = '13px system-ui, sans-serif';
  logCtx.fillText('left/right = angle θ', 12, 22);
  logCtx.fillText('up/down = log radius ln(r)', 12, 40);
}
