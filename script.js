/* ============================================================
   CALCULADORA 3D RESINA — MOPHINHO
   script.js — Application logic
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================
const DEFAULT_VALUES = {
  depreciation:   1.50,
  maintenance:    0.50,
  energy:         0.80,
  resinQty:       150,
  pricePerGram:   0.25,
  errorMargin:    10,
  printHours:     4,
  finishingHours: 1.5,
  hourlyRate:     30,
  cleaning:       3,
  packaging:      5,
  profitMargin:   30,
};

let state = { ...DEFAULT_VALUES };
let lastResult = null;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPct(value) {
  return value.toFixed(1).replace('.', ',') + '%';
}

function parseNum(val) {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) || n < 0 ? 0 : n;
}

function today() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ============================================================
// CALCULATION ENGINE
// ============================================================
function calculate(s) {
  const resinCost    = s.resinQty * s.pricePerGram;
  const resinWithErr = resinCost * (1 + s.errorMargin / 100);
  const printCost    = s.printHours * (s.energy + s.depreciation + s.maintenance);
  const laborCost    = s.finishingHours * s.hourlyRate;
  const extras       = s.cleaning + s.packaging;
  const totalCost    = resinWithErr + printCost + laborCost + extras;
  const finalPrice   = totalCost * (1 + s.profitMargin / 100);
  const profit       = finalPrice - totalCost;

  const totalHours   = (s.printHours + s.finishingHours) || 1;
  const totalGrams   = s.resinQty || 1;
  const perGram      = finalPrice / totalGrams;
  const perHour      = finalPrice / totalHours;
  const markupPct    = totalCost > 0 ? ((finalPrice / totalCost - 1) * 100) : 0;
  const realMargin   = finalPrice > 0 ? (profit / finalPrice * 100) : 0;

  return {
    resinWithErr, printCost, laborCost, extras,
    totalCost, finalPrice, profit,
    profitMargin: s.profitMargin,
    perGram, perHour, markupPct, realMargin,
  };
}

// ============================================================
// DOM HELPERS
// ============================================================
function $(id) { return document.getElementById(id); }

function setText(id, val) {
  const el = $(id);
  if (el) el.textContent = val;
}

// ============================================================
// RENDER RESULTS
// ============================================================
function renderResults(r) {
  setText('result-price',   formatBRL(r.finalPrice));
  setText('result-cost',    formatBRL(r.totalCost));
  setText('result-profit',  formatBRL(r.profit));

  setText('bd-resin',    formatBRL(r.resinWithErr));
  setText('bd-printing', formatBRL(r.printCost));
  setText('bd-labor',    formatBRL(r.laborCost));
  setText('bd-extras',   formatBRL(r.extras));
  setText('bd-total',    formatBRL(r.totalCost));
  setText('bd-margin',   formatPct(r.profitMargin));
  setText('bd-final',    formatBRL(r.finalPrice));

  setText('stat-per-gram',   formatBRL(r.perGram));
  setText('stat-per-hour',   formatBRL(r.perHour));
  setText('stat-markup',     formatPct(r.markupPct));
  setText('stat-profit-pct', formatPct(r.realMargin));

  // Animate price
  const priceEl = $('result-price');
  priceEl.classList.remove('animate');
  void priceEl.offsetWidth; // reflow
  priceEl.classList.add('animate');

  // Draw chart
  drawChart(r);
}

// ============================================================
// CANVAS PIE CHART
// ============================================================
function drawChart(r) {
  const canvas = $('cost-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const size = 130;
  canvas.width  = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width  = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const total = r.resinWithErr + r.printCost + r.laborCost + r.extras;

  const segments = [
    { value: r.resinWithErr, color: getComputedStyle(document.documentElement).getPropertyValue('--color-resin').trim()    || '#7c6af5' },
    { value: r.printCost,    color: getComputedStyle(document.documentElement).getPropertyValue('--color-printing').trim() || '#3ecfcf' },
    { value: r.laborCost,    color: getComputedStyle(document.documentElement).getPropertyValue('--color-labor').trim()    || '#f59e3e' },
    { value: r.extras,       color: getComputedStyle(document.documentElement).getPropertyValue('--color-extras').trim()   || '#f565a6' },
  ];

  const cx = size / 2, cy = size / 2, radius = size / 2 - 8;
  ctx.clearRect(0, 0, size, size);

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
    ctx.lineWidth = 16;
    ctx.stroke();
    setText('leg-resin',    '0%');
    setText('leg-printing', '0%');
    setText('leg-labor',    '0%');
    setText('leg-extras',   '0%');
    return;
  }

  let startAngle = -Math.PI / 2;
  segments.forEach(seg => {
    const sliceAngle = (seg.value / total) * 2 * Math.PI;
    if (sliceAngle <= 0) return;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += sliceAngle;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 20, 0, Math.PI * 2);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim();
  ctx.fill();

  const pct = v => total > 0 ? formatPct(v / total * 100) : '0%';
  setText('leg-resin',    pct(r.resinWithErr));
  setText('leg-printing', pct(r.printCost));
  setText('leg-labor',    pct(r.laborCost));
  setText('leg-extras',   pct(r.extras));
}

// ============================================================
// READ ALL INPUTS INTO STATE
// ============================================================
function readInputs() {
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (key && key in state) {
      state[key] = parseNum(el.value);
    }
  });
}

// ============================================================
// POPULATE INPUTS FROM STATE
// ============================================================
function populateInputs(s) {
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (key && key in s) {
      el.value = s[key];
    }
  });
  // Sync slider
  const slider = $('profit-slider');
  if (slider) slider.value = Math.min(s.profitMargin, 200);
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg, duration = 2500) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// THEME
// ============================================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('calc3d_theme', theme);
  // Redraw chart after theme change
  if (lastResult) setTimeout(() => drawChart(lastResult), 50);
}

// ============================================================
// PRESET MANAGEMENT
// ============================================================
const PRESET_KEY = 'calc3d_presets';

function getPresets() {
  try { return JSON.parse(localStorage.getItem(PRESET_KEY)) || {}; }
  catch { return {}; }
}

function savePresets(presets) {
  localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
}

function renderPresetList() {
  const presets = getPresets();
  const list = $('preset-list');
  const keys = Object.keys(presets);

  if (keys.length === 0) {
    list.innerHTML = '<p class="preset-empty">Nenhum preset salvo ainda.</p>';
    return;
  }

  list.innerHTML = keys.map(name => `
    <div class="preset-item" data-name="${encodeURIComponent(name)}">
      <span class="preset-item-name" title="${name}">${name}</span>
      <span class="preset-item-date">${presets[name].savedAt || ''}</span>
      <button class="preset-btn preset-btn-load" data-action="load" data-preset="${encodeURIComponent(name)}" aria-label="Carregar preset ${name}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
        </svg>
      </button>
      <button class="preset-btn preset-btn-delete" data-action="delete" data-preset="${encodeURIComponent(name)}" aria-label="Excluir preset ${name}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  `).join('');
}

// ============================================================
// HISTORY MANAGEMENT
// ============================================================
const HISTORY_KEY = 'calc3d_history';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addHistoryEntry(s, r) {
  const history = getHistory();
  const entry = {
    id: Date.now(),
    savedAt: today(),
    inputs: { ...s },
    result: {
      resinWithErr: r.resinWithErr,
      printCost:    r.printCost,
      laborCost:    r.laborCost,
      extras:       r.extras,
      totalCost:    r.totalCost,
      finalPrice:   r.finalPrice,
      profit:       r.profit,
      profitMargin: r.profitMargin,
    },
  };
  history.unshift(entry);
  if (history.length > 50) history.pop(); // cap
  saveHistory(history);
}

function renderHistoryList() {
  const history = getHistory();
  const list = $('history-list');

  if (history.length === 0) {
    list.innerHTML = '<p class="history-empty">Nenhum cálculo salvo ainda. Calcule uma peça e salve!</p>';
    return;
  }

  list.innerHTML = history.map((entry, idx) => `
    <div class="history-item" id="hitem-${entry.id}">
      <div class="history-item-header" data-toggle="${entry.id}">
        <span class="history-price">${formatBRL(entry.result.finalPrice)}</span>
        <span class="history-date">${entry.savedAt}</span>
        <div class="history-actions">
          <button class="history-btn history-btn-reuse" data-action="reuse" data-idx="${idx}" aria-label="Reutilizar valores">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
          </button>
          <button class="history-btn history-btn-delete" data-action="delete-history" data-id="${entry.id}" aria-label="Excluir histórico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="history-details" id="hdetail-${entry.id}">
        <div class="history-breakdown">
          <div class="history-bd-item"><span>Resina (c/ erro):</span><span>${formatBRL(entry.result.resinWithErr)}</span></div>
          <div class="history-bd-item"><span>Impressão:</span><span>${formatBRL(entry.result.printCost)}</span></div>
          <div class="history-bd-item"><span>Mão de obra:</span><span>${formatBRL(entry.result.laborCost)}</span></div>
          <div class="history-bd-item"><span>Extras:</span><span>${formatBRL(entry.result.extras)}</span></div>
          <div class="history-bd-item"><span>Custo total:</span><span>${formatBRL(entry.result.totalCost)}</span></div>
          <div class="history-bd-item"><span>Margem:</span><span>${formatPct(entry.result.profitMargin)}</span></div>
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================================
// SHARE VIA URL
// ============================================================
function encodeStateToURL(s) {
  const params = new URLSearchParams();
  Object.entries(s).forEach(([k, v]) => params.set(k, v));
  return `${location.origin}${location.pathname}?${params.toString()}`;
}

function decodeStateFromURL() {
  const params = new URLSearchParams(location.search);
  const decoded = {};
  let found = false;
  Object.keys(DEFAULT_VALUES).forEach(k => {
    if (params.has(k)) {
      decoded[k] = parseNum(params.get(k));
      found = true;
    }
  });
  return found ? decoded : null;
}

// ============================================================
// PDF EXPORT
// ============================================================
function exportPDF(s, r) {
  if (!window.jspdf) {
    showToast('⚠️ Biblioteca PDF não carregada. Tente novamente.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pw = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(124, 106, 245);
  doc.rect(0, 0, pw, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculadora 3D Resina', pw / 2, 14, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Custo — Mophinho', pw / 2, 22, { align: 'center' });
  doc.text(`Gerado em: ${today()}`, pw / 2, 30, { align: 'center' });

  y = 45;
  doc.setTextColor(30, 30, 30);

  const section = (title) => {
    doc.setFillColor(240, 242, 248);
    doc.rect(14, y, pw - 28, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(title.toUpperCase(), 17, y + 5);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    y += 10;
  };

  const row = (label, value, bold = false) => {
    if (bold) doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(label, 17, y);
    doc.text(value, pw - 14, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 7;
  };

  const divider = () => {
    doc.setDrawColor(200, 200, 210);
    doc.line(14, y, pw - 14, y);
    y += 5;
  };

  // INPUTS
  section('Dados de Entrada');
  row('Depreciação da máquina', `R$ ${s.depreciation.toFixed(2)}/h`);
  row('Manutenção', `R$ ${s.maintenance.toFixed(2)}/h`);
  row('Energia elétrica', `R$ ${s.energy.toFixed(2)}/h`);
  row('Quantidade de resina', `${s.resinQty}g`);
  row('Valor por grama', `R$ ${s.pricePerGram.toFixed(3)}/g`);
  row('Margem de erro', `${s.errorMargin}%`);
  row('Horas de impressão', `${s.printHours}h`);
  row('Horas de acabamento', `${s.finishingHours}h`);
  row('Valor hora de trabalho', `R$ ${s.hourlyRate.toFixed(2)}/h`);
  row('Insumos de limpeza', formatBRL(s.cleaning));
  row('Embalagem', formatBRL(s.packaging));
  row('Margem de lucro', `${s.profitMargin}%`);

  y += 3;
  divider();

  section('Breakdown de Custos');
  row('Resina (com margem de erro)', formatBRL(r.resinWithErr));
  row('Custo de impressão',          formatBRL(r.printCost));
  row('Mão de obra',                 formatBRL(r.laborCost));
  row('Custos extras',               formatBRL(r.extras));
  divider();
  row('Custo Total',                 formatBRL(r.totalCost), true);

  y += 3;
  doc.setFillColor(124, 106, 245);
  doc.rect(14, y, pw - 28, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PREÇO FINAL DE VENDA', 17, y + 5.5);
  doc.text(formatBRL(r.finalPrice), pw - 14, y + 5.5, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Lucro estimado: ${formatBRL(r.profit)}   |   Margem: ${formatPct(r.profitMargin)}`, pw / 2, y + 11, { align: 'center' });

  // Footer
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Mophinho — Calculadora 3D Resina', pw / 2, 287, { align: 'center' });

  doc.save(`custo-impressao-3d-${Date.now()}.pdf`);
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(id) {
  const modal = $(id);
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = $(id);
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ============================================================
// EVENT BINDINGS
// ============================================================
function initEvents() {

  // --- CALCULATE ---
  $('btn-calculate').addEventListener('click', () => {
    readInputs();
    const r = calculate(state);
    lastResult = r;
    renderResults(r);
    showToast('✅ Cálculo realizado com sucesso!');
    // Rola suavemente até o card de resultado
    const resultCard = $('result-card');
    if (resultCard) {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // --- RESET ---
  $('btn-reset').addEventListener('click', () => {
    // Zera todos os inputs visíveis
    document.querySelectorAll('[data-key]').forEach(el => { el.value = ''; });
    // Zera o slider
    const sliderEl = $('profit-slider');
    if (sliderEl) sliderEl.value = 0;
    // Zera o estado
    state = Object.fromEntries(Object.keys(DEFAULT_VALUES).map(k => [k, 0]));
    lastResult = null;
    // Zera os resultados exibidos
    const empty = { resinWithErr: 0, printCost: 0, laborCost: 0, extras: 0,
      totalCost: 0, finalPrice: 0, profit: 0, profitMargin: 0,
      perGram: 0, perHour: 0, markupPct: 0, realMargin: 0 };
    renderResults(empty);
    showToast('🗑️ Todos os campos foram limpos.');
  });

  // --- PROFIT SLIDER <-> INPUT SYNC ---
  const slider = $('profit-slider');
  const profitInput = $('profit-margin');

  slider.addEventListener('input', () => {
    profitInput.value = slider.value;
    state.profitMargin = parseNum(slider.value);
  });

  profitInput.addEventListener('input', () => {
    const v = parseNum(profitInput.value);
    slider.value = Math.min(v, 200);
    state.profitMargin = v;
  });

  // Generic input change (keep state warm)
  document.querySelectorAll('[data-key]').forEach(el => {
    el.addEventListener('change', () => {
      const key = el.dataset.key;
      if (key) state[key] = parseNum(el.value);
    });
  });

  // --- DETAILS TOGGLE ---
  $('btn-details-toggle').addEventListener('click', function() {
    const panel  = $('details-panel');
    const isOpen = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!isOpen));
    panel.hidden = isOpen;
    this.querySelector('span').textContent = isOpen ? 'Ver detalhes' : 'Ocultar detalhes';
  });

  // --- THEME TOGGLE ---
  $('btn-theme').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- SHARE ---
  $('btn-share').addEventListener('click', () => {
    readInputs();
    const url = encodeStateToURL(state);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('🔗 Link copiado para a área de transferência!');
      });
    } else {
      prompt('Copie o link abaixo:', url);
    }
  });

  // --- PDF EXPORT ---
  $('btn-pdf').addEventListener('click', () => {
    if (!lastResult) {
      showToast('⚠️ Calcule primeiro antes de exportar o PDF.');
      return;
    }
    readInputs();
    exportPDF(state, lastResult);
    showToast('📄 PDF gerado com sucesso!');
  });

  // --- SAVE TO HISTORY ---
  $('btn-save-history').addEventListener('click', () => {
    if (!lastResult) {
      showToast('⚠️ Realize um cálculo antes de salvar.');
      return;
    }
    readInputs();
    addHistoryEntry(state, lastResult);
    showToast('💾 Salvo no histórico!');
  });

  // --- PRESET PANEL ---
  $('btn-preset-open').addEventListener('click', () => {
    renderPresetList();
    openModal('modal-preset');
  });

  $('btn-preset-save').addEventListener('click', () => {
    const name = $('preset-name-input').value.trim();
    if (!name) { showToast('⚠️ Digite um nome para o preset.'); return; }
    readInputs();
    const presets = getPresets();
    presets[name] = { ...state, savedAt: today() };
    savePresets(presets);
    $('preset-name-input').value = '';
    renderPresetList();
    showToast(`💾 Preset "${name}" salvo!`);
  });

  $('preset-list').addEventListener('click', e => {
    const loadBtn   = e.target.closest('[data-action="load"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (loadBtn) {
      const name = decodeURIComponent(loadBtn.dataset.preset);
      const presets = getPresets();
      if (presets[name]) {
        state = { ...DEFAULT_VALUES, ...presets[name] };
        populateInputs(state);
        closeModal('modal-preset');
        showToast(`✅ Preset "${name}" carregado!`);
      }
    }

    if (deleteBtn) {
      const name = decodeURIComponent(deleteBtn.dataset.preset);
      const presets = getPresets();
      delete presets[name];
      savePresets(presets);
      renderPresetList();
      showToast(`🗑️ Preset "${name}" excluído.`);
    }
  });

  // --- HISTORY PANEL ---
  $('btn-history-open').addEventListener('click', () => {
    renderHistoryList();
    openModal('modal-history');
  });

  $('history-list').addEventListener('click', e => {
    const toggleHeader = e.target.closest('[data-toggle]');
    const reuseBtn     = e.target.closest('[data-action="reuse"]');
    const deleteBtn    = e.target.closest('[data-action="delete-history"]');

    if (reuseBtn && !e.target.closest('.history-btn-delete')) {
      const history = getHistory();
      const idx = parseInt(reuseBtn.dataset.idx, 10);
      if (history[idx]) {
        state = { ...DEFAULT_VALUES, ...history[idx].inputs };
        populateInputs(state);
        closeModal('modal-history');
        showToast('🔄 Valores do histórico carregados!');
      }
    }

    if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id, 10);
      let history = getHistory();
      history = history.filter(h => h.id !== id);
      saveHistory(history);
      renderHistoryList();
      showToast('🗑️ Entrada removida do histórico.');
    }

    if (toggleHeader && !reuseBtn && !deleteBtn) {
      const id = toggleHeader.dataset.toggle;
      const detail = $('hdetail-' + id);
      if (detail) detail.classList.toggle('open');
    }
  });

  // --- CLOSE MODALS ---
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        const id = overlay.id;
        if (id) closeModal(id);
      }
    });
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['modal-preset', 'modal-history'].forEach(id => {
        if (!$(id).hidden) closeModal(id);
      });
    }
  });
}

// ============================================================
// FIRST-RUN SETUP
// ============================================================
function firstRunSetup() {
  const presets = getPresets();
  if (Object.keys(presets).length === 0) {
    presets['Padrão Básico'] = {
      ...DEFAULT_VALUES,
      savedAt: today(),
    };
    savePresets(presets);
  }
}

// ============================================================
// INIT
// ============================================================
function init() {
  // Theme
  const savedTheme = localStorage.getItem('calc3d_theme') || 'dark';
  applyTheme(savedTheme);

  // First-run default preset
  firstRunSetup();

  // URL params (sharing)
  const urlState = decodeStateFromURL();
  if (urlState) {
    state = { ...DEFAULT_VALUES, ...urlState };
    showToast('🔗 Valores carregados via link compartilhado!');
    // Clean URL
    history.replaceState(null, '', location.pathname);
  }

  // Populate inputs
  populateInputs(state);

  // Sync slider initial value
  const slider = $('profit-slider');
  if (slider) slider.value = Math.min(state.profitMargin, 200);

  // Bind events
  initEvents();

  // Initial render (empty)
  const emptyResult = {
    resinWithErr: 0, printCost: 0, laborCost: 0, extras: 0,
    totalCost: 0, finalPrice: 0, profit: 0, profitMargin: state.profitMargin,
    perGram: 0, perHour: 0, markupPct: 0, realMargin: 0,
  };
  renderResults(emptyResult);

  // If loaded from URL, auto-calculate
  if (urlState) {
    const r = calculate(state);
    lastResult = r;
    renderResults(r);
  }
}

// ============================================================
// START
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
