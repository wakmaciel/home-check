/* ===================================================================
   Home Check — app.js
   App 100% local: tudo fica salvo no localStorage do navegador/aparelho.
   =================================================================== */

const STORAGE_KEY = 'homecheck_financas_v1';

const GROUPS = [
  { id: 'sinal',        label: 'Sinal e Entrada (Incorporadora)' },
  { id: 'financiamento',label: 'Financiamento / Seguro de Obra' },
  { id: 'balao',        label: 'Balões (Pró-Soluto)' },
  { id: 'posChaves',    label: 'Pós-Chaves (Pró-Soluto Final)' },
  { id: 'taxas',        label: 'Taxas e Registros' },
  { id: 'outros',       label: 'Outras Despesas' },
];

const GROUP_COLORS = {
  sinal:        '#FDA534',
  financiamento:'#FB8A1E',
  balao:        '#F9590B',
  posChaves:    '#E04400',
  taxas:        '#B83600',
  outros:       '#8C6A4C',
};

// Categorias-modelo: cobrem o ciclo comum de uma compra de imóvel na planta
// (sinal, parcelas até as chaves, financiamento e taxas), mas SEM nenhum valor,
// data ou dado específico preenchido — cada pessoa configura com o próprio
// contrato em Categorias, e os "Valores de referência" são opcionais.
function defaultCategories(){
  return [
    { id:'sinal-ato', name:'Sinal (à vista)', group:'sinal', referenceValue:null, dueDate:null, recurring:false, note:'Valor de entrada pago na assinatura do contrato.' },
    { id:'parc-mensal', name:'Parcelas mensais da entrada', group:'sinal', referenceValue:null, dueDate:null, recurring:true, recurStart:null, recurEnd:null, note:'Parcelas cobradas pela incorporadora durante a obra, como parte da entrada.' },
    { id:'juros-obra', name:'Seguro / Juros de obra (mensal)', group:'financiamento', referenceValue:null, dueDate:null, recurring:true, recurStart:null, recurEnd:null, note:'Cobrado mensalmente pelo banco a partir da assinatura do financiamento, enquanto a obra não termina. Também chamado de "taxa de obra" ou "fase de obra".' },
    { id:'saldo-financ', name:'Saldo do preço (financiamento)', group:'financiamento', referenceValue:null, dueDate:null, recurring:false, note:'Parte paga via financiamento bancário e/ou recursos próprios.' },
    { id:'balao-anual', name:'Parcela anual (balão)', group:'balao', referenceValue:null, dueDate:null, recurring:false, note:'Parcela única anual, comum em contratos de compra na planta.' },
    { id:'balao-final', name:'Parcela única / balão final', group:'balao', referenceValue:null, dueDate:null, recurring:false, note:'Costuma ser a maior parcela antes ou na entrega das chaves. Pode virar parcelamento, dependendo do contrato.' },
    { id:'pos-chaves-final', name:'Pró-Soluto pós-chaves (saldo)', group:'posChaves', referenceValue:null, mode:'pendente', recurring:false, note:'Defina aqui, no dia, se vai pagar à vista ou parcelado.' },
    { id:'itbi', name:'ITBI', group:'taxas', referenceValue:null, dueDate:null, recurring:false, note:'Imposto de Transmissão de Bens Imóveis. Confira o prazo no seu contrato — atraso costuma gerar multa diária.' },
    { id:'cartorio', name:'Taxas Cartorárias / Registro', group:'taxas', referenceValue:null, dueDate:null, recurring:false, note:'Emolumentos e taxas do Cartório de Registro de Imóveis.' },
    { id:'outras', name:'Outras despesas', group:'outros', referenceValue:null, dueDate:null, recurring:false, note:'Advogado, vistoria, mudança, decoração, etc.' },
  ];
}

// Data de entrega "placeholder": hoje + 24 meses. É só um valor inicial razoável
// pra nada quebrar antes da pessoa configurar a data real do contrato dela em Ajustes.
function placeholderDeliveryDate(){
  const d = new Date();
  d.setMonth(d.getMonth() + 24);
  return d.toISOString().slice(0,10);
}

function defaultState(){
  return {
    schemaVersion: 1,
    settings: {
      propertyName: '',
      propertyAddress: '',
      deliveryDate: placeholderDeliveryDate(),
      purchaseDate: todayISO(),
      propertyValue: null,
    },
    categories: defaultCategories(),
    entries: [],
  };
}

let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.entries)) return parsed;
    }
  }catch(e){ console.warn('Falha ao ler dados salvos', e); }
  return defaultState();
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(e){ toast('Não foi possível salvar os dados (armazenamento cheio?)'); }
}

/* ---------------- utilidades ---------------- */
const $  = (sel, p=document) => p.querySelector(sel);
const $$ = (sel, p=document) => Array.from(p.querySelectorAll(sel));

const BRL = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' });
function money(v){ return BRL.format(v||0); }

/* Máscara de moeda nos inputs: a pessoa digita só números e o campo vai
   formatando como centavos ("15000" → "150,00"), estilo app de banco. */
const BRL_PLAIN = new Intl.NumberFormat('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });
function maskMoneyInput(el){
  const digits = el.value.replace(/\D/g,'').slice(0,13);
  el.value = digits ? BRL_PLAIN.format(parseInt(digits,10)/100) : '';
}
function moneyInputValue(el){
  const digits = el.value.replace(/\D/g,'');
  return digits ? parseInt(digits,10)/100 : NaN;
}
function setMoneyInput(el, v){
  el.value = (v === null || v === undefined || v === '' || isNaN(Number(v))) ? '' : BRL_PLAIN.format(Number(v));
}
$$('.money-input').forEach(el => el.addEventListener('input', () => maskMoneyInput(el)));
function fmtDate(iso){
  if(!iso) return '—';
  const d = parseISO(iso);
  return d.toLocaleDateString('pt-BR');
}
function parseISO(iso){ return new Date(iso + 'T00:00:00'); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function uid(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function monthKey(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
function monthLabel(key){
  const [y,m] = key.split('-').map(Number);
  return new Date(y, m-1, 1).toLocaleDateString('pt-BR', { month:'short', year:'2-digit' });
}
function addMonthsToKey(key, n){
  const [y,m] = key.split('-').map(Number);
  const d = new Date(y, m-1+n, 1);
  return monthKey(d);
}

function categoryById(id){ return state.categories.find(c => c.id === id); }
function groupLabel(id){ const g = GROUPS.find(g=>g.id===id); return g ? g.label : id; }

/* ---------------- tema (claro/escuro) ---------------- */
function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function isDarkMode(){ return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }

// As cores de DADOS (categorias) ficam vivas nos dois temas — só trocamos por uma
// variante um pouco mais clara no escuro, pra nenhuma fatia "desaparecer" contra
// o fundo escuro. As cores de CHROME (grade, eixos, bordas) vêm direto do CSS.
const PALETTE_LIGHT = ['#FDA534','#FB8A1E','#F9590B','#E04400','#B83600','#8C6A4C','#6B4326','#C24700','#FFC988','#3A2410'];
const PALETTE_DARK  = ['#FFB04D','#FF9A3D','#FF7A1E','#FF5A1A','#E0540D','#D9A974','#C9824E','#FF8C42','#FFD9A6','#E8B27A'];
function palette(){ return isDarkMode() ? PALETTE_DARK : PALETTE_LIGHT; }
function chartTheme(){
  return {
    grid: cssVar('--chart-grid'),
    text: cssVar('--ink-700'),
    sliceBorder: cssVar('--cream'),
    mutedFill: cssVar('--chart-muted-fill'),
    plannedLine: cssVar('--chart-planned-line'),
  };
}

/* ---------------- estatísticas / cálculos ---------------- */
function computeStats(){
  const totalPaid = state.entries.reduce((s,e)=> s + Number(e.value||0), 0);
  const totalRef = state.categories.reduce((s,c)=> s + (Number(c.referenceValue)||0), 0);

  const byCategoryPaid = {};
  state.categories.forEach(c => byCategoryPaid[c.id] = 0);
  state.entries.forEach(e => { byCategoryPaid[e.categoryId] = (byCategoryPaid[e.categoryId]||0) + Number(e.value||0); });

  const purchase = parseISO(state.settings.purchaseDate);
  const delivery = parseISO(state.settings.deliveryDate);
  const today = parseISO(todayISO());

  const totalDays = Math.max(1, Math.round((delivery - purchase) / 86400000));
  const elapsedDays = clamp(Math.round((today - purchase) / 86400000), 0, totalDays);
  const daysLeft = Math.max(0, Math.round((delivery - today) / 86400000));

  return { totalPaid, totalRef, byCategoryPaid, totalDays, elapsedDays, daysLeft, purchase, delivery, today };
}

function computeTimeline(stats){
  const purchase = stats.purchase, delivery = stats.delivery;
  const startKey = monthKey(purchase);
  const endKeyRaw = monthKey(delivery);

  const todayKey = monthKey(stats.today);
  let endKey = endKeyRaw;
  if(todayKey > endKey) endKey = todayKey;

  const labels = [];
  let cursor = startKey;
  let guard = 0;
  while(true){
    labels.push(cursor);
    if(cursor === endKey || guard > 60) break;
    cursor = addMonthsToKey(cursor, 1);
    guard++;
  }

  const plannedByMonth = {};
  labels.forEach(k => plannedByMonth[k] = 0);

  state.categories.forEach(cat => {
    const ref = Number(cat.referenceValue);
    if(!ref) return;
    if(cat.recurring){
      const rs = cat.recurStart ? monthKey(parseISO(cat.recurStart)) : startKey;
      const re = cat.recurEnd ? monthKey(parseISO(cat.recurEnd)) : endKey;
      const monthsInRange = labels.filter(k => k >= rs && k <= re);
      const n = Math.max(1, monthsInRange.length);
      const per = ref / n;
      monthsInRange.forEach(k => plannedByMonth[k] += per);
    } else {
      const due = cat.dueDate ? parseISO(cat.dueDate) : purchase;
      let k = monthKey(due);
      if(k < startKey) k = startKey;
      if(k > endKey) k = endKey;
      plannedByMonth[k] = (plannedByMonth[k]||0) + ref;
    }
  });

  const actualByMonth = {};
  labels.forEach(k => actualByMonth[k] = 0);
  state.entries.forEach(e => {
    if(!e.date) return;
    let k = monthKey(parseISO(e.date));
    if(k < startKey) k = startKey;
    if(k > endKey) k = endKey;
    actualByMonth[k] = (actualByMonth[k]||0) + Number(e.value||0);
  });

  let accP = 0, accA = 0;
  const plannedCum = [], actualCum = [];
  labels.forEach(k => {
    accP += plannedByMonth[k]; plannedCum.push(Math.round(accP*100)/100);
    accA += actualByMonth[k];  actualCum.push(Math.round(accA*100)/100);
  });

  return { labels: labels.map(monthLabel), plannedCum, actualCum };
}

/* ---------------- navegação por abas ---------------- */
let currentView = 'view-dashboard';

function switchView(viewId){
  currentView = viewId;
  $$('.view').forEach(v => v.classList.toggle('active', v.id === viewId));
  $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  const fab = $('#fabAdd');
  fab.style.display = (viewId === 'view-settings') ? 'none' : 'flex';
  if(viewId === 'view-dashboard') renderDashboard();
  if(viewId === 'view-entries') renderEntries();
  if(viewId === 'view-categories') renderCategories();
  if(viewId === 'view-settings') renderSettings();
}

$$('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

/* ---------------- sheets (modais) ---------------- */
function openSheet(id){
  $('#sheetBackdrop').classList.add('open');
  $('#' + id).classList.add('open');
}
function closeAllSheets(){
  $('#sheetBackdrop').classList.remove('open');
  $$('.sheet').forEach(s => s.classList.remove('open'));
}
$('#sheetBackdrop').addEventListener('click', closeAllSheets);
$$('[data-close-sheet]').forEach(b => b.addEventListener('click', closeAllSheets));

/* ---------------- toast ---------------- */
let toastTimer;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2400);
}

/* ===================================================================
   DASHBOARD
   =================================================================== */
let charts = { byCategory:null, timeline:null, bars:null };

function renderDashboard(){
  const stats = computeStats();

  $('#todayLabel').textContent = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });
  $('#deliveryDateLabel').textContent = fmtDate(state.settings.deliveryDate);
  $('#daysLeftNum').textContent = stats.daysLeft;

  const frac = stats.totalDays ? clamp(stats.elapsedDays / stats.totalDays, 0, 1) : 0;
  const circumference = 2 * Math.PI * 33;
  $('#countdownRing').setAttribute('stroke-dasharray', circumference.toFixed(1));
  $('#countdownRing').setAttribute('stroke-dashoffset', (circumference * (1-frac)).toFixed(1));
  $('#timeProgressFill').style.width = (frac*100).toFixed(1) + '%';
  $('#timeProgressLabel').textContent = stats.daysLeft > 0
    ? `${Math.round(frac*100)}% do prazo até a entrega já passou`
    : 'data prevista de entrega já alcançada';

  const totalRefRaw = stats.totalRef || state.settings.propertyValue || 0;
  const totalRefForPct = totalRefRaw || 1;
  const pct = clamp(stats.totalPaid / totalRefForPct, 0, 1.3);
  $('#liquidFill').style.height = Math.min(pct,1)*100 + '%';
  $$('.tank-pct-value').forEach(el => el.textContent = Math.round(pct*100) + '%');

  $('#totalPaidNum').textContent = money(stats.totalPaid);
  const diffEl = $('#totalDiffNum');
  if(totalRefRaw > 0){
    $('#totalRefNum').textContent = money(totalRefRaw);
    const diff = stats.totalPaid - totalRefRaw;
    diffEl.textContent = (diff>=0 ? '+ ' : '− ') + money(Math.abs(diff));
    diffEl.classList.remove('good','bad');
    diffEl.classList.add(diff > 0 ? 'bad' : 'good');
  } else {
    $('#totalRefNum').textContent = 'Defina em Ajustes';
    diffEl.textContent = '—';
    diffEl.classList.remove('good','bad');
  }

  renderRecentEntries();
  renderChartByCategory(stats);
  renderChartTimeline(stats);
  renderChartBars(stats);
}

function renderRecentEntries(){
  const card = $('#recentEntriesCard');
  const sorted = [...state.entries].sort((a,b)=> b.date.localeCompare(a.date)).slice(0,5);
  if(sorted.length === 0){
    card.innerHTML = `<div class="empty-state" style="padding:24px 6px;">
      <div class="e-icon">🧾</div>
      <h3>Nenhum lançamento ainda</h3>
      <p>Toque no botão laranja "+" para registrar o primeiro pagamento.</p>
    </div>`;
    return;
  }
  card.innerHTML = sorted.map(e => entryRowHtml(e)).join('');
  $$('.entry-row', card).forEach(row => row.addEventListener('click', () => openEntryEditor(row.dataset.id)));
}

function entryRowHtml(e){
  const cat = categoryById(e.categoryId);
  const color = cat ? (GROUP_COLORS[cat.group] || '#FB8A1E') : '#8C6A4C';
  const initial = (cat ? cat.name : 'Outro').trim().charAt(0).toUpperCase();
  return `<div class="entry-row" data-id="${e.id}" style="cursor:pointer;">
    <div class="entry-dot" style="background:${color};">${initial}</div>
    <div class="entry-main">
      <div class="t1">${cat ? cat.name : 'Categoria removida'}</div>
      <div class="t2">${fmtDate(e.date)} · ${e.method||''}</div>
    </div>
    <div class="entry-value">${money(e.value)}</div>
  </div>`;
}

function renderChartByCategory(stats){
  const cats = state.categories.filter(c => (stats.byCategoryPaid[c.id]||0) > 0);
  const data = cats.map(c => stats.byCategoryPaid[c.id]);
  const labels = cats.map(c => c.name);
  const pal = palette();
  const colors = cats.map((c,i) => pal[i % pal.length]);
  const theme = chartTheme();

  const ctx = $('#chartByCategory').getContext('2d');
  if(charts.byCategory) charts.byCategory.destroy();

  if(cats.length === 0){
    $('#legendByCategory').innerHTML = '<span class="hint">Nenhum pagamento lançado ainda.</span>';
    charts.byCategory = new Chart(ctx, { type:'doughnut', data:{ labels:['Sem dados'], datasets:[{data:[1], backgroundColor:[theme.mutedFill]}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{enabled:false} }, cutout:'68%' } });
    return;
  }

  charts.byCategory = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets:[{ data, backgroundColor:colors, borderWidth:2, borderColor:theme.sliceBorder }] },
    options: {
      responsive:true, maintainAspectRatio:false,
      cutout:'68%',
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: c => {
        const tot = c.dataset.data.reduce((s,v)=>s+v,0) || 1;
        return `${c.label}: ${money(c.raw)} (${Math.round(c.raw/tot*100)}%)`;
      } } } }
    }
  });

  const totalPaid = data.reduce((s,v)=>s+v, 0) || 1;
  $('#legendByCategory').innerHTML = cats.map((c,i)=>
    `<span class="legend-item"><span class="legend-dot" style="background:${colors[i]}"></span>${c.name} · <b>${money(data[i])}</b> (${Math.round(data[i]/totalPaid*100)}%)</span>`
  ).join('');
}

function renderChartTimeline(stats){
  const tl = computeTimeline(stats);
  const theme = chartTheme();
  const ctx = $('#chartTimeline').getContext('2d');
  if(charts.timeline) charts.timeline.destroy();

  charts.timeline = new Chart(ctx, {
    type:'line',
    data:{
      labels: tl.labels,
      datasets:[
        {
          label:'Pago (real)', data: tl.actualCum, borderColor:'#F9590B', backgroundColor:'rgba(249,89,11,.18)',
          fill:true, tension:.3, pointRadius:2, borderWidth:3
        },
        {
          label:'Previsto (contrato)', data: tl.plannedCum, borderColor: theme.plannedLine, backgroundColor:'transparent',
          borderDash:[6,5], fill:false, tension:.3, pointRadius:0, borderWidth:2
        }
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11}, color: theme.text } }, tooltip:{ callbacks:{ label: c => `${c.dataset.label}: ${money(c.raw)}` } } },
      scales:{
        y:{ ticks:{ callback:v => 'R$ ' + (v/1000).toFixed(0)+'k', font:{size:10}, color: theme.text }, grid:{ color: theme.grid } },
        x:{ ticks:{ font:{size:10}, color: theme.text }, grid:{ display:false } }
      }
    }
  });
}

function renderChartBars(stats){
  const cats = state.categories.filter(c => c.referenceValue || stats.byCategoryPaid[c.id] > 0);
  const theme = chartTheme();
  const ctx = $('#chartBars').getContext('2d');
  if(charts.bars) charts.bars.destroy();

  if(cats.length === 0){
    charts.bars = new Chart(ctx, { type:'bar', data:{labels:[], datasets:[]}, options:{ responsive:true, maintainAspectRatio:false } });
    return;
  }

  charts.bars = new Chart(ctx, {
    type:'bar',
    data:{
      labels: cats.map(c=>c.name),
      datasets:[
        { label:'Pago', data: cats.map(c=>stats.byCategoryPaid[c.id]||0), backgroundColor:'#F9590B', borderRadius:6 },
        { label:'Previsto', data: cats.map(c=> c.referenceValue || 0), backgroundColor: theme.mutedFill, borderRadius:6 },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      indexAxis:'y',
      plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11}, color: theme.text } }, tooltip:{ callbacks:{ label: c => `${c.dataset.label}: ${money(c.raw)}` } } },
      scales:{
        x:{ ticks:{ callback:v=>'R$ '+(v/1000).toFixed(0)+'k', font:{size:10}, color: theme.text }, grid:{ color: theme.grid } },
        y:{ ticks:{ font:{size:10.5}, color: theme.text }, grid:{ display:false } }
      }
    }
  });
}

/* ===================================================================
   LANÇAMENTOS
   =================================================================== */
function populateCategorySelects(){
  const buildOptions = (selectEl, withAllOption) => {
    const prevValue = selectEl.value;
    selectEl.innerHTML = '';
    if(withAllOption){
      const opt = document.createElement('option');
      opt.value = ''; opt.textContent = 'Todas as categorias';
      selectEl.appendChild(opt);
    }
    GROUPS.forEach(g => {
      const cats = state.categories.filter(c => c.group === g.id);
      if(cats.length === 0) return;
      const og = document.createElement('optgroup');
      og.label = g.label;
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = c.name;
        og.appendChild(opt);
      });
      selectEl.appendChild(og);
    });
    // mantém a seleção anterior se a opção ainda existir (evita resetar o filtro a cada render)
    if(prevValue && [...selectEl.options].some(o => o.value === prevValue)){
      selectEl.value = prevValue;
    }
  };
  buildOptions($('#entryCategory'), false);
  buildOptions($('#filterCategory'), true);
}

function renderEntries(){
  populateCategorySelects();
  const filterVal = $('#filterCategory').value;
  const list = $('#entriesList');
  let entries = [...state.entries].sort((a,b)=> b.date.localeCompare(a.date));
  if(filterVal) entries = entries.filter(e => e.categoryId === filterVal);

  if(entries.length === 0){
    list.innerHTML = `<div class="glass card empty-state">
      <div class="e-icon">📭</div>
      <h3>Sem lançamentos${filterVal ? ' nessa categoria' : ''}</h3>
      <p>Toque no "+" para adicionar um pagamento.</p>
    </div>`;
    return;
  }

  let lastMonth = null;
  const groups = [];
  entries.forEach(e => {
    const mk = e.date.slice(0,7);
    if(mk !== lastMonth){
      groups.push({ key: mk, items: [] });
      lastMonth = mk;
    }
    groups[groups.length-1].items.push(e);
  });

  const html = groups.map(g => {
    const total = g.items.reduce((s,e)=> s + Number(e.value||0), 0);
    return `<div class="month-label">${monthLabel(g.key)} · ${money(total)}</div>
      <div class="glass card" style="padding:4px 14px;">
        ${g.items.map(entryRowHtml).join('')}
      </div>`;
  }).join('');

  list.innerHTML = html;
  $$('.entry-row', list).forEach(row => row.addEventListener('click', () => openEntryEditor(row.dataset.id)));
}

$('#filterCategory').addEventListener('change', renderEntries);

function openEntryEditor(entryId){
  const isEdit = !!entryId;
  $('#entrySheetTitle').textContent = isEdit ? 'Editar lançamento' : 'Novo lançamento';
  $('#entryId').value = entryId || '';
  $('#btnDeleteEntry').style.display = isEdit ? 'block' : 'none';

  if(isEdit){
    const e = state.entries.find(x=>x.id===entryId);
    $('#entryCategory').value = e.categoryId;
    $('#entryDate').value = e.date;
    setMoneyInput($('#entryValue'), e.value);
    $('#entryMethod').value = e.method || 'PIX';
    $('#entryNote').value = e.note || '';
  } else {
    $('#entryDate').value = todayISO();
    $('#entryValue').value = '';
    $('#entryMethod').value = 'PIX';
    $('#entryNote').value = '';
    if(state.categories.length) $('#entryCategory').value = state.categories[0].id;
  }
  openSheet('sheetEntry');
}

$('#btnSaveEntry').addEventListener('click', () => {
  const categoryId = $('#entryCategory').value;
  const date = $('#entryDate').value;
  const value = moneyInputValue($('#entryValue'));
  if(!categoryId || !date || isNaN(value) || value <= 0){
    toast('Preencha categoria, data e um valor válido.');
    return;
  }
  const id = $('#entryId').value;
  const payload = { categoryId, date, value, method: $('#entryMethod').value, note: $('#entryNote').value.trim() };
  if(id){
    const idx = state.entries.findIndex(e=>e.id===id);
    if(idx>-1) state.entries[idx] = { ...state.entries[idx], ...payload };
  } else {
    state.entries.push({ id: uid(), ...payload });
  }
  saveState();
  closeAllSheets();
  toast('Lançamento salvo.');
  switchView(currentView);
});

$('#btnDeleteEntry').addEventListener('click', () => {
  const id = $('#entryId').value;
  if(!id) return;
  if(confirm('Excluir este lançamento? Essa ação não pode ser desfeita.')){
    state.entries = state.entries.filter(e=>e.id!==id);
    saveState();
    closeAllSheets();
    toast('Lançamento excluído.');
    switchView(currentView);
  }
});

/* ===================================================================
   CATEGORIAS
   =================================================================== */
function populateGroupSelect(){
  const sel = $('#categoryGroup');
  sel.innerHTML = GROUPS.map(g => `<option value="${g.id}">${g.label}</option>`).join('');
}

function renderCategories(){
  const stats = computeStats();
  const list = $('#categoriesList');
  let html = '';
  GROUPS.forEach(g => {
    const cats = state.categories.filter(c => c.group === g.id);
    if(cats.length === 0) return;
    html += `<div class="section-title">${g.label}</div>`;
    html += cats.map(c => categoryCardHtml(c, stats)).join('');
  });
  if(!html){
    html = `<div class="glass card empty-state"><div class="e-icon">🗂️</div><h3>Nenhuma categoria</h3><p>Toque no "+" no topo para criar uma.</p></div>`;
  }
  list.innerHTML = html;

  $$('.cat-card', list).forEach(card => {
    card.addEventListener('click', () => openCategoryEditor(card.dataset.id));
  });
}

function categoryCardHtml(c, stats){
  const paid = stats.byCategoryPaid[c.id] || 0;
  const ref = Number(c.referenceValue) || 0;
  const pct = ref ? clamp(paid/ref,0,1) : 0;
  const color = GROUP_COLORS[c.group] || '#FB8A1E';

  let modeChip = '';
  if(c.group === 'posChaves'){
    const labelMap = { pendente:'A decidir', avista:'À vista', parcelado:'Parcelado' };
    modeChip = `<span style="font-size:11px; font-weight:700; padding:3px 9px; border-radius:99px; background:rgba(255,255,255,.6); color:var(--ember-700); white-space:nowrap;">${labelMap[c.mode]||'A decidir'}</span>`;
  }

  return `<div class="glass card cat-card" data-id="${c.id}" style="cursor:pointer;">
    <div class="head">
      <div>
        <div class="name">${c.name}</div>
        ${c.note ? `<div class="group">${c.note}</div>` : ''}
      </div>
      ${modeChip}
    </div>
    ${ref ? `<div class="progress-track"><div class="progress-fill" style="width:${(pct*100).toFixed(1)}%; background: linear-gradient(90deg, ${color}, var(--ember-700));"></div></div>` : ''}
    <div class="nums">
      <span>Pago: <b>${money(paid)}</b></span>
      <span>${ref ? `Previsto: <b>${money(ref)}</b>` : '<span style="color:var(--ink-500)">sem valor de referência</span>'}</span>
    </div>
  </div>`;
}

let categoryModeSelected = 'pendente';

function openCategoryEditor(categoryId){
  const isEdit = !!categoryId;
  $('#categorySheetTitle').textContent = isEdit ? 'Editar categoria' : 'Nova categoria';
  $('#categoryId').value = categoryId || '';
  $('#btnDeleteCategory').style.display = isEdit ? 'block' : 'none';

  if(isEdit){
    const c = categoryById(categoryId);
    $('#categoryName').value = c.name;
    $('#categoryGroup').value = c.group;
    setMoneyInput($('#categoryRef'), c.referenceValue);
    $('#categoryDue').value = c.dueDate || '';
    $('#categoryNote').value = c.note || '';
    categoryModeSelected = c.mode || 'pendente';
  } else {
    $('#categoryName').value = '';
    $('#categoryGroup').value = 'outros';
    $('#categoryRef').value = '';
    $('#categoryDue').value = '';
    $('#categoryNote').value = '';
    categoryModeSelected = 'pendente';
  }
  updateCategoryModeVisibility();
  updateCategoryModeButtons();
  openSheet('sheetCategory');
}

function updateCategoryModeVisibility(){
  $('#categoryModeField').style.display = ($('#categoryGroup').value === 'posChaves') ? 'block' : 'none';
}
function updateCategoryModeButtons(){
  $$('#categoryModeSeg button').forEach(b => b.classList.toggle('active', b.dataset.mode === categoryModeSelected));
}
$('#categoryGroup').addEventListener('change', updateCategoryModeVisibility);
$$('#categoryModeSeg button').forEach(b => b.addEventListener('click', () => {
  categoryModeSelected = b.dataset.mode;
  updateCategoryModeButtons();
}));

$('#btnAddCategoryTop').addEventListener('click', () => openCategoryEditor(null));

$('#btnSaveCategory').addEventListener('click', () => {
  const name = $('#categoryName').value.trim();
  if(!name){ toast('Dê um nome para a categoria.'); return; }
  const id = $('#categoryId').value;
  const group = $('#categoryGroup').value;
  const refParsed = moneyInputValue($('#categoryRef'));
  const referenceValue = isNaN(refParsed) ? null : refParsed;
  const dueDate = $('#categoryDue').value || null;
  const note = $('#categoryNote').value.trim();

  if(id){
    const idx = state.categories.findIndex(c=>c.id===id);
    if(idx>-1){
      state.categories[idx] = { ...state.categories[idx], name, group, referenceValue, dueDate, note, mode: categoryModeSelected };
    }
  } else {
    state.categories.push({ id: uid(), name, group, referenceValue, dueDate, note, recurring:false, mode: categoryModeSelected });
  }
  saveState();
  closeAllSheets();
  toast('Categoria salva.');
  renderCategories();
  populateCategorySelects();
});

$('#btnDeleteCategory').addEventListener('click', () => {
  const id = $('#categoryId').value;
  if(!id) return;
  const hasEntries = state.entries.some(e=>e.categoryId===id);
  const msg = hasEntries
    ? 'Essa categoria tem lançamentos associados. Excluí-la não apaga os lançamentos, mas eles ficarão sem categoria. Continuar?'
    : 'Excluir esta categoria?';
  if(confirm(msg)){
    state.categories = state.categories.filter(c=>c.id!==id);
    saveState();
    closeAllSheets();
    toast('Categoria excluída.');
    renderCategories();
    populateCategorySelects();
  }
});

/* ===================================================================
   AJUSTES
   =================================================================== */
function renderSettings(){
  $('#settingPropertyName').value = state.settings.propertyName || '';
  $('#settingPropertyAddress').value = state.settings.propertyAddress || '';
  $('#settingDeliveryDate').value = state.settings.deliveryDate;
  $('#settingPurchaseDate').value = state.settings.purchaseDate;
  setMoneyInput($('#settingPropertyValue'), state.settings.propertyValue);
  renderBrandMark();
  renderIdentitySection();
}

function renderBrandMark(){
  const name = state.settings.propertyName ? `Home Check · ${state.settings.propertyName}` : 'Home Check';
  const sub = state.settings.propertyAddress || 'Controle de pagamentos do seu imóvel até a entrega';
  $('#brandName').textContent = name;
  $('#brandSub').textContent = sub;
}

// Antes de a pessoa preencher nome/endereço, o formulário fica aberto (primeiro
// uso). Depois de preenchido, ele some — o cartão "Home Check" já mostra tudo,
// e só volta a abrir se a pessoa tocar no lápis (ou no próprio cartão).
let editingPropertyInfo = false;
function renderIdentitySection(){
  const hasIdentity = !!(state.settings.propertyName || state.settings.propertyAddress);
  const showEditCard = !hasIdentity || editingPropertyInfo;
  $('#identityEditCard').style.display = showEditCard ? 'block' : 'none';
}
function openIdentityEditor(){ editingPropertyInfo = true; renderIdentitySection(); }
$('#brandMarkCard').addEventListener('click', openIdentityEditor);
// O card do gráfico NÃO navega mais no toque — tocar nas fatias/pontos mostra o
// tooltip com os valores. Quem quiser ir pra aba usa o link do cabeçalho.
$$('.chart-link').forEach(b => b.addEventListener('click', () => switchView(b.dataset.goto)));
$('#btnEditIdentity').addEventListener('click', (ev) => { ev.stopPropagation(); openIdentityEditor(); });
$('#btnDoneIdentity').addEventListener('click', () => { editingPropertyInfo = false; renderIdentitySection(); });

function bindSettingInput(id, key, isNumber, onAfter){
  $('#'+id).addEventListener('change', (ev) => {
    let v = ev.target.value;
    if(isNumber){
      const n = moneyInputValue(ev.target);
      v = isNaN(n) ? null : n;
    }
    state.settings[key] = v;
    saveState();
    toast('Ajuste salvo.');
    if(onAfter) onAfter();
  });
}
bindSettingInput('settingPropertyName', 'propertyName', false, renderBrandMark);
bindSettingInput('settingPropertyAddress', 'propertyAddress', false, renderBrandMark);
bindSettingInput('settingDeliveryDate', 'deliveryDate', false);
bindSettingInput('settingPurchaseDate', 'purchaseDate', false);
bindSettingInput('settingPropertyValue', 'propertyValue', true);

$('#btnExportJson').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
  downloadBlob(blob, `homecheck-backup-${todayISO()}.json`);
  toast('Backup exportado.');
});

$('#btnImportJson').addEventListener('click', () => $('#fileImportJson').click());
$('#fileImportJson').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      if(!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.entries)) throw new Error('formato inválido');
      if(confirm('Importar este backup vai substituir todos os dados atuais do app. Continuar?')){
        state = parsed;
        saveState();
        toast('Backup importado.');
        switchView(currentView);
      }
    }catch(e){
      toast('Arquivo inválido. Verifique se é um backup exportado por este app.');
    }
  };
  reader.readAsText(file);
  ev.target.value = '';
});

$('#btnExportCsv').addEventListener('click', () => {
  const rows = [['Data','Categoria','Grupo','Valor (R$)','Forma de pagamento','Observação']];
  [...state.entries].sort((a,b)=>a.date.localeCompare(b.date)).forEach(e => {
    const cat = categoryById(e.categoryId);
    rows.push([
      fmtDate(e.date),
      cat ? cat.name : '(categoria removida)',
      cat ? groupLabel(cat.group) : '',
      String(e.value).replace('.',','),
      e.method || '',
      (e.note||'').replace(/[\r\n;]+/g,' ')
    ]);
  });
  rows.push([]);
  rows.push(['Resumo por categoria']);
  rows.push(['Categoria','Grupo','Valor de referência (R$)','Total pago (R$)']);
  const stats = computeStats();
  state.categories.forEach(c => {
    rows.push([ c.name, groupLabel(c.group), c.referenceValue ? String(c.referenceValue).replace('.',',') : '', String(stats.byCategoryPaid[c.id]||0).replace('.',',') ]);
  });

  const csv = '\uFEFF' + rows.map(r => r.map(f => `"${String(f).replace(/"/g,'""')}"`).join(';')).join('\r\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
  downloadBlob(blob, `homecheck-relatorio-${todayISO()}.csv`);
  toast('Relatório exportado.');
});

$('#btnResetAll').addEventListener('click', () => {
  if(confirm('Isso vai apagar TODOS os lançamentos, categorias personalizadas e ajustes deste app. Essa ação não pode ser desfeita. Tem certeza?')){
    if(confirm('Confirma mesmo? Considere exportar um backup antes.')){
      state = defaultState();
      saveState();
      toast('Dados apagados.');
      switchView('view-dashboard');
    }
  }
});

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

/* ===================================================================
   FAB — contextual
   =================================================================== */
$('#fabAdd').addEventListener('click', () => {
  if(currentView === 'view-categories') openCategoryEditor(null);
  else openEntryEditor(null);
});

/* ===================================================================
   BOOT
   =================================================================== */
function boot(){
  populateGroupSelect();
  populateCategorySelects();
  switchView('view-dashboard');

  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  // O CSS já troca de tema sozinho (prefers-color-scheme), mas os gráficos são
  // <canvas> — as cores ficam "gravadas" na criação, então precisamos redesenhar
  // na hora em que o usuário troca claro/escuro no iOS com o app aberto.
  if(window.matchMedia){
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onThemeChange = () => { if(currentView === 'view-dashboard') renderDashboard(); };
    if(mq.addEventListener) mq.addEventListener('change', onThemeChange);
    else if(mq.addListener) mq.addListener(onThemeChange); // fallback p/ Safari mais antigo
  }
}
boot();
