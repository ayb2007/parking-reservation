const zonesData = {
  A: { rows: [18, 16], prefix: 'A' },
  B: { rows: [16, 14], prefix: 'B' },
  C: { rows: [10, 10], prefix: 'C' },
};

const seededRand = (seed) => { let s=seed; return()=>{s=(s*9301+49297)%233280; return s/233280;}; };

const spotTypes = ['free','free','free','taken','reserved','free','free','free','taken','free'];
let selectedSpot = null;
let currentZone = 'A';

let spotsData = [];
let allSpots = [];
  
async function fetchSpots() {
  try {
    const response = await fetch('/api/spots');
    if (!response.ok) throw new Error('Erreur réseau');
    allSpots = await response.json();
    renderGrid(currentZone);
  } catch (error) {
    console.error(error);
  }
}

function renderGrid(zone) {
  const zd = zonesData[zone];
  [1, 2].forEach(rowIdx => {
    const grid = document.getElementById(`spot-grid${rowIdx === 1 ? '' : '-2'}`);
    grid.innerHTML = '';
    const count = zd.rows[rowIdx - 1];
    
    for (let i = 1; i <= count; i++) {
      const num = `${zd.prefix}${String(rowIdx === 1 ? i : i + count).padStart(2, '0')}`;
      
      const dbSpot = allSpots.find(s => s.id === num);
      
      let cls = dbSpot ? dbSpot.status : 'reserved';
      
      const div = document.createElement('div');
      div.className = `spot ${cls}`;
      div.dataset.id = num;
      div.dataset.status = cls;
      
      const icon = cls === 'free' ? '🟢' : cls === 'taken' ? '🔴' : '⚫';
      div.innerHTML = `<span class="spot-icon">${icon}</span><span class="spot-num">${num}</span>`;
      
      if (cls === 'free') {
        div.addEventListener('click', () => selectSpot(num, div));
      }
      grid.appendChild(div);
    }
  });
}

function switchZone(btn, zone) {
  document.querySelectorAll('.zone-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentZone = zone;
  renderGrid(zone);
  clearSelection();
}

function selectSpot(id, el) {
  document.querySelectorAll('.spot.selected').forEach(s => {
    const status = s.dataset.status;
    s.classList.remove('selected');
    s.classList.add(status);
  });
  document.querySelectorAll('.spot-card.active-card').forEach(c => c.classList.remove('active-card'));

  el.classList.remove('free');
  el.classList.add('selected');
  selectedSpot = id;

  const display = document.getElementById('selected-display');
  display.innerHTML = `
    <div class="spot-icon-big">🅿️</div>
    <div class="spot-info-text">
      <div class="spot-name">Place ${id}</div>
      <div class="spot-desc">Zone ${currentZone} — ${currentZone==='C'?'Électrique ⚡':'Standard'}</div>
    </div>`;

  updatePrice();
  document.getElementById('btn-reserve').disabled = false;
  showToast('✅', `Place ${id} sélectionnée !`);
}

function clearSelection() {
  selectedSpot = null;
  document.getElementById('selected-display').innerHTML = `
    <div class="spot-icon-big">🅿️</div>
    <div class="spot-info-text">
      <div class="spot-name">Aucune place sélectionnée</div>
      <div class="spot-desc">Cliquez sur une place pour continuer</div>
    </div>`;
  document.getElementById('btn-reserve').disabled = true;
  document.getElementById('rate-display').textContent = '—';
  document.getElementById('duration-display').textContent = '—';
  document.getElementById('total-display').textContent = '—';
}

function updatePrice() {
  if (!selectedSpot) return;
  const rate = currentZone === 'C' ? 3.0 : 2.5;
  const start = document.getElementById('time-start').value;
  const end   = document.getElementById('time-end').value;
  let hours = 2;
  if (start && end) {
    const [sh,sm] = start.split(':').map(Number);
    const [eh,em] = end.split(':').map(Number);
    const diff = (eh*60+em) - (sh*60+sm);
    if (diff > 0) hours = Math.round(diff/60*10)/10;
  }
  const subtotal = rate * hours;
  const total = subtotal + 0.5;
  document.getElementById('rate-display').textContent = `${rate.toFixed(2)} €/h`;
  document.getElementById('duration-display').textContent = `${hours}h`;
  document.getElementById('total-display').textContent = `${total.toFixed(2)} €`;
}

document.getElementById('time-start').addEventListener('change', updatePrice);
document.getElementById('time-end').addEventListener('change', updatePrice);

function List() {
  const list = document.getElementById('spots-list');
  list.innerHTML = '';
  spotsData.forEach(s => {
    const tagColors = { Libre:'green', PMR:'blue', 'Borne E':'yellow', 'Proche entrée':'green' };
    const tagsHtml = s.tags.map(t => `<span class="tag ${tagColors[t]||'green'}">${t}</span>`).join('');
    const div = document.createElement('div');
    div.className = 'spot-card';
    div.dataset.id = s.id;
    div.innerHTML = `
      <div class="spot-card-icon type-${s.type}">${s.icon}</div>
      <div class="spot-card-info">
        <div class="spot-card-name">Place ${s.id}</div>
        <div class="spot-card-tags">${tagsHtml}</div>
      </div>
      <div class="spot-card-price">${s.price.toFixed(2)} €<small>/ heure</small></div>`;
    div.addEventListener('click', () => {
      document.querySelectorAll('.spot-card.active-card').forEach(c=>c.classList.remove('active-card'));
      div.classList.add('active-card');
      selectedSpot = s.id;
      currentZone = s.zone;
      const display = document.getElementById('selected-display');
      display.innerHTML = `
        <div class="spot-icon-big">${s.icon}</div>
        <div class="spot-info-text">
          <div class="spot-name">Place ${s.id}</div>
          <div class="spot-desc">${s.desc}</div>
        </div>`;
      updatePrice();
      document.getElementById('btn-reserve').disabled = false;
      showToast('✅', `Place ${s.id} sélectionnée !`);
    });
    list.appendChild(div);
  });
}

function handleSearch() {
  showToast('🔍', 'Recherche en cours…');
  setTimeout(() => showToast('✅', '247 places trouvées !'), 1200);
}

async function openModal() {
  const plateInput = document.getElementById('plate').value;
  const timeStart = document.getElementById('time-start').value;
  const timeEnd = document.getElementById('time-end').value;
  const payment = document.getElementById('payment-method').value;
  const totalText = document.getElementById('total-display').textContent;

  if (!plateInput) {
    showToast('⚠️', 'Veuillez saisir votre plaque');
    return;
  }

  const reservationData = {
    spotId: selectedSpot,
    plate: plateInput,
    start: `2026-04-14 ${timeStart}:00`,
    end: `2026-04-14 ${timeEnd}:00`,
    payment: payment,
    total: parseFloat(totalText.replace(' €', ''))
  };

  try {
    const response = await fetch('/api/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });

    if (response.ok) {
      const result = await response.json();
      showToast('✅', 'Réservation enregistrée !');
      
      const plate = plateInput || 'Non renseignée';
      const ref = 'PKE-' + result.id;

      document.getElementById('modal-details').innerHTML = `
        <div class="modal-detail-row"><span class="key">Place</span><span class="val">${selectedSpot}</span></div>
        <div class="modal-detail-row"><span class="key">Plaque</span><span class="val">${plate}</span></div>
        <div class="modal-detail-row"><span class="key">Total</span><span class="val" style="color:var(--accent)">${totalText}</span></div>
        <div class="modal-detail-row"><span class="key">Référence</span><span class="val">${ref}</span></div>`;

      document.getElementById('modal').classList.add('open');
      fetchSpots(); 
    }
  } catch (error) {
    showToast('❌', 'Erreur lors de la réservation');
  }
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  clearSelection();
  renderGrid(currentZone);
  fetchSpots(); 
}

let toastTimer;
function showToast(icon, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

const now = new Date();
const fmt = d => d.toISOString().slice(0,16);
document.getElementById('arrival-input').value = fmt(now);
const later = new Date(now.getTime() + 2*3600*1000);
document.getElementById('departure-input').value = fmt(later);

renderGrid('A');
fetchSpots();