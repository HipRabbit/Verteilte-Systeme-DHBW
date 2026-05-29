// ============================================
// Admin Frontend - Full CRUD + Dashboard + Status
// ============================================

// 127.0.0.1 statt localhost (vermeidet Windows-DNS-Verzögerung)
const API = {
    hotels:      'http://127.0.0.1:3002/api/hotels',
    fluege:      'http://127.0.0.1:3003/api/fluege',
    mietwagen:   'http://127.0.0.1:3004/api/mietwagen',
    bewertungen: 'http://127.0.0.1:3001/api/bewertungen'
};

const SERVICES = [
    { key: 'bewertungen', name: 'Bewertungs-Server', port: 3001, url: 'http://127.0.0.1:3001', apiUrl: API.bewertungen, icon: 'star-fill', ressource: 'Bewertungen' },
    { key: 'hotels',      name: 'Hotel-Server',      port: 3002, url: 'http://127.0.0.1:3002', apiUrl: API.hotels,      icon: 'building',  ressource: 'Hotels' },
    { key: 'fluege',      name: 'Flugverbindung-Server', port: 3003, url: 'http://127.0.0.1:3003', apiUrl: API.fluege,  icon: 'airplane',  ressource: 'Flüge' },
    { key: 'mietwagen',   name: 'Mietwagen-Server',  port: 3004, url: 'http://127.0.0.1:3004', apiUrl: API.mietwagen,   icon: 'car-front', ressource: 'Mietwagen' }
];

const state = {
    hotels: null, fluege: null, mietwagen: null, bewertungen: null,
    geladen: { hotels: false, fluege: false, mietwagen: false, bewertungen: false, dashboard: false },
    sort: {
        hotels: { feld: null, richtung: 'asc' },
        fluege: { feld: null, richtung: 'asc' },
        mietwagen: { feld: null, richtung: 'asc' },
        bewertungen: { feld: null, richtung: 'asc' }
    }
};

// ========== HELPER ==========
function toast(titel, text, typ = 'success') {
    const el = document.getElementById('toast');
    document.getElementById('toast-titel').textContent = titel;
    document.getElementById('toast-body').textContent = text;
    el.className = `toast text-white bg-${typ === 'error' ? 'danger' : 'success'}`;
    new bootstrap.Toast(el).show();
}

async function fetchMitTimeout(url, timeoutMs = 5000) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(timeout);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') throw new Error('Timeout - Server antwortet nicht');
        throw err;
    }
}

async function apiCall(url, method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Fehler');
    }
    return res.json();
}

function bestaetige(text, onOk) {
    document.getElementById('confirm-text').textContent = text;
    const modalEl = document.getElementById('modal-confirm');
    const modal = new bootstrap.Modal(modalEl);
    const btn = document.getElementById('confirm-ok-btn');
    const neuerBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(neuerBtn, btn);
    neuerBtn.addEventListener('click', () => { modal.hide(); onOk(); });
    modal.show();
}

function spinnerZeile(colspan, text = 'Lade Daten...') {
    return `<tr><td colspan="${colspan}" class="text-center py-4">
        <div class="spinner-border text-primary"></div>
        <div class="mt-2 text-muted">${text}</div></td></tr>`;
}

function emptyZeile(colspan, text, icon = 'inbox', btnText = null, btnAction = null) {
    const btn = btnText ? `<br><button class="btn btn-primary mt-3" onclick="${btnAction}"><i class="bi bi-plus-lg"></i> ${btnText}</button>` : '';
    return `<tr><td colspan="${colspan}">
        <div class="empty-state"><i class="bi bi-${icon}"></i>
        <h5 class="mt-3">${text}</h5>${btn}</div></td></tr>`;
}

function fehlerZeige(boxId, msg) {
    const box = document.getElementById(boxId);
    box.textContent = msg;
    box.classList.remove('d-none');
}
function fehlerVerstecke(boxId) {
    document.getElementById(boxId).classList.add('d-none');
}

// ========== DARK MODE ==========
function themeInit() {
    const gespeichert = localStorage.getItem('theme') || 'light';
    setTheme(gespeichert);
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const aktuell = document.documentElement.getAttribute('data-bs-theme');
        setTheme(aktuell === 'light' ? 'dark' : 'light');
    });
}
function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun';
}

// ========== SORTIERUNG ==========
function sortieren(liste, feld, richtung) {
    return [...liste].sort((a, b) => {
        let wertA = a[feld], wertB = b[feld];
        if (feld === 'abflugzeit' || feld === 'datum') {
            wertA = new Date(wertA).getTime();
            wertB = new Date(wertB).getTime();
        }
        if (typeof wertA === 'string') wertA = wertA.toLowerCase();
        if (typeof wertB === 'string') wertB = wertB.toLowerCase();
        if (wertA < wertB) return richtung === 'asc' ? -1 : 1;
        if (wertA > wertB) return richtung === 'asc' ? 1 : -1;
        return 0;
    });
}
function sortIndikatorUpdate(bereich, feld) {
    document.querySelectorAll(`[id^="sort-${bereich}-"]`).forEach(el => {
        el.textContent = '⇅'; el.classList.remove('sort-aktiv');
    });
    const aktiv = document.getElementById(`sort-${bereich}-${feld}`);
    if (aktiv) {
        aktiv.textContent = state.sort[bereich].richtung === 'asc' ? '▲' : '▼';
        aktiv.classList.add('sort-aktiv');
    }
}
function toggleSort(bereich, feld) {
    const s = state.sort[bereich];
    if (s.feld === feld) s.richtung = s.richtung === 'asc' ? 'desc' : 'asc';
    else { s.feld = feld; s.richtung = 'asc'; }
    sortIndikatorUpdate(bereich, feld);
}
function sortiereHotels(feld) { toggleSort('hotels', feld); hotelsRender(); }
function sortiereFluege(feld) { toggleSort('fluege', feld); fluegeRender(); }
function sortiereMietwagen(feld) { toggleSort('mietwagen', feld); mietwagenRender(); }
function sortiereBewertungen(feld) { toggleSort('bewertungen', feld); bewertungenRender(); }

// ========== DASHBOARD ==========
async function dashboardLaden() {
    if (state.geladen.dashboard) return;
    const cards = document.getElementById('dashboard-cards');
    cards.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>';

    try {
        const [hotels, fluege, mietwagen, bewertungen] = await Promise.all([
            fetchMitTimeout(API.hotels).catch(() => []),
            fetchMitTimeout(API.fluege).catch(() => []),
            fetchMitTimeout(API.mietwagen).catch(() => []),
            fetchMitTimeout(API.bewertungen).catch(() => [])
        ]);

        // Cache befüllen
        state.hotels = hotels; state.geladen.hotels = true;
        state.fluege = fluege; state.geladen.fluege = true;
        state.mietwagen = mietwagen; state.geladen.mietwagen = true;
        state.bewertungen = bewertungen; state.geladen.bewertungen = true;
        state.geladen.dashboard = true;

        const avgSterne = bewertungen.length > 0
            ? (bewertungen.reduce((s, b) => s + b.sterne, 0) / bewertungen.length).toFixed(1)
            : '—';

        cards.innerHTML = `
            <div class="col-md-3 col-sm-6">
                <div class="card stat-card stat-bg-hotels">
                    <div class="card-body text-center">
                        <i class="bi bi-building" style="font-size:2rem"></i>
                        <div class="stat-zahl">${hotels.length}</div>
                        <div>Hotels</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card stat-card stat-bg-fluege">
                    <div class="card-body text-center">
                        <i class="bi bi-airplane" style="font-size:2rem"></i>
                        <div class="stat-zahl">${fluege.length}</div>
                        <div>Flüge</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card stat-card stat-bg-mietwagen">
                    <div class="card-body text-center">
                        <i class="bi bi-car-front" style="font-size:2rem"></i>
                        <div class="stat-zahl">${mietwagen.length}</div>
                        <div>Mietwagen</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card stat-card stat-bg-bewertungen">
                    <div class="card-body text-center">
                        <i class="bi bi-star-fill" style="font-size:2rem"></i>
                        <div class="stat-zahl">${avgSterne}</div>
                        <div>Ø Bewertung (${bewertungen.length})</div>
                    </div>
                </div>
            </div>
        `;

        const hotelsMitAvg = hotels.map(h => {
            const eigene = bewertungen.filter(b => b.hotelId === h._id || b.hotelName === h.name);
            const avg = eigene.length > 0 ? eigene.reduce((s, b) => s + b.sterne, 0) / eigene.length : 0;
            return { ...h, avg, anzahl: eigene.length };
        }).filter(h => h.anzahl > 0).sort((a, b) => b.avg - a.avg).slice(0, 5);

        const topHotels = document.getElementById('top-hotels');
        if (hotelsMitAvg.length === 0) {
            topHotels.innerHTML = '<li class="list-group-item text-muted">Noch keine Bewertungen vorhanden</li>';
        } else {
            topHotels.innerHTML = hotelsMitAvg.map(h => `
                <li class="list-group-item">
                    <div class="top-hotel-item">
                        <div class="top-hotel-info">
                            <strong>${h.name}</strong>
                            <small class="text-muted">${h.stadt}, ${h.land}</small>
                        </div>
                        <span class="badge bg-warning text-dark fs-6 top-hotel-badge">★ ${h.avg.toFixed(1)} (${h.anzahl})</span>
                    </div>
                </li>
            `).join('');
        }

        const neueste = [...bewertungen].sort((a, b) => new Date(b.datum) - new Date(a.datum)).slice(0, 5);
        const neuesteEl = document.getElementById('neueste-bewertungen');
        if (neueste.length === 0) {
            neuesteEl.innerHTML = '<li class="list-group-item text-muted">Noch keine Bewertungen vorhanden</li>';
        } else {
            neuesteEl.innerHTML = neueste.map(b => `
                <li class="list-group-item">
                    <div class="d-flex justify-content-between">
                        <strong>${b.hotelName}</strong>
                        <span class="text-warning">${'★'.repeat(b.sterne)}</span>
                    </div>
                    <small class="text-muted">${b.autor} · ${new Date(b.datum).toLocaleDateString('de-DE')}</small>
                    <div class="small mt-1">${b.kommentar.substring(0, 80)}${b.kommentar.length > 80 ? '...' : ''}</div>
                </li>
            `).join('');
        }
    } catch (err) {
        cards.innerHTML = `<div class="col-12"><div class="alert alert-danger">Fehler: ${err.message}</div></div>`;
    }
}

// ========== SERVER-STATUS ==========
async function serviceCheck(service) {
    const start = performance.now();
    try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(service.apiUrl, { signal: ctrl.signal });
        clearTimeout(timeout);
        const zeit = Math.round(performance.now() - start);
        if (!res.ok) return { online: false, fehler: `HTTP ${res.status}`, zeit };
        const daten = await res.json();
        return { online: true, zeit, anzahl: Array.isArray(daten) ? daten.length : 0 };
    } catch (err) {
        const zeit = Math.round(performance.now() - start);
        return { online: false, fehler: err.name === 'AbortError' ? 'Timeout (>5s)' : err.message, zeit };
    }
}

async function statusLaden() {
    const container = document.getElementById('status-cards');
    const gesamt = document.getElementById('status-gesamt');

    container.innerHTML = SERVICES.map(s => `
        <div class="col-md-6 col-lg-3">
            <div class="card h-100">
                <div class="card-body text-center">
                    <i class="bi bi-${s.icon}" style="font-size:2.5rem; color: var(--urlaub-primary)"></i>
                    <h5 class="mt-2">${s.name}</h5>
                    <p class="mb-2"><span class="status-punkt status-pruefen"></span>Prüfung läuft...</p>
                    <small class="text-muted">Port ${s.port}</small>
                </div>
            </div>
        </div>
    `).join('');
    gesamt.className = 'alert alert-secondary mb-0';
    gesamt.innerHTML = '<i class="bi bi-hourglass-split"></i> Prüfung läuft...';

    const ergebnisse = await Promise.all(SERVICES.map(s => serviceCheck(s)));

    container.innerHTML = SERVICES.map((s, i) => {
        const r = ergebnisse[i];
        const statusText = r.online
            ? `<span class="status-punkt status-online"></span><strong class="text-success">Online</strong>`
            : `<span class="status-punkt status-offline"></span><strong class="text-danger">Offline</strong>`;
        const details = r.online
            ? `<div class="mt-3">
                   <div class="d-flex justify-content-between mb-1">
                       <small class="text-muted">Antwortzeit:</small><strong>${r.zeit} ms</strong>
                   </div>
                   <div class="d-flex justify-content-between">
                       <small class="text-muted">${s.ressource}:</small><strong>${r.anzahl}</strong>
                   </div>
               </div>`
            : `<div class="mt-3">
                   <div class="alert alert-danger py-1 px-2 mb-0 small">
                       <i class="bi bi-exclamation-triangle"></i> ${r.fehler}
                   </div>
               </div>`;
        return `
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 ${r.online ? '' : 'border-danger'}">
                    <div class="card-body text-center">
                        <i class="bi bi-${s.icon}" style="font-size:2.5rem; color: var(--urlaub-primary)"></i>
                        <h5 class="mt-2">${s.name}</h5>
                        <p class="mb-2">${statusText}</p>
                        <small class="text-muted">Port ${s.port} · <code>${s.url}</code></small>
                        ${details}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const anzahlOnline = ergebnisse.filter(r => r.online).length;
    const gesamtZeit = ergebnisse.filter(r => r.online).reduce((s, r) => s + r.zeit, 0);
    const avgZeit = anzahlOnline > 0 ? Math.round(gesamtZeit / anzahlOnline) : 0;

    if (anzahlOnline === SERVICES.length) {
        gesamt.className = 'alert alert-success mb-0';
        gesamt.innerHTML = `<i class="bi bi-check-circle-fill"></i> <strong>Alle Services verfügbar.</strong> Durchschnittliche Antwortzeit: ${avgZeit} ms.`;
    } else if (anzahlOnline === 0) {
        gesamt.className = 'alert alert-danger mb-0';
        gesamt.innerHTML = `<i class="bi bi-x-circle-fill"></i> <strong>Alle Services offline!</strong>`;
    } else {
        gesamt.className = 'alert alert-warning mb-0';
        gesamt.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> <strong>${anzahlOnline} von ${SERVICES.length} Services online.</strong>`;
    }
}

// ========== HOTELS - CRUD ==========
async function hotelsLaden() {
    const tbody = document.getElementById('hotels-tbody');
    if (state.geladen.hotels) { hotelsRender(); return; }
    tbody.innerHTML = spinnerZeile(6, 'Lade Hotels...');
    try {
        state.hotels = await fetchMitTimeout(API.hotels);
        state.geladen.hotels = true;
        hotelsRender();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert-danger mb-0">Fehler: ${err.message}</div></td></tr>`;
    }
}

function hotelsRender() {
    const tbody = document.getElementById('hotels-tbody');
    let liste = state.hotels;
    if (state.sort.hotels.feld) liste = sortieren(liste, state.sort.hotels.feld, state.sort.hotels.richtung);
    if (liste.length === 0) {
        tbody.innerHTML = emptyZeile(6, 'Noch keine Hotels vorhanden', 'building', 'Erstes Hotel anlegen', 'hotelNeu()');
        return;
    }
    tbody.innerHTML = liste.map(h => `
        <tr>
            <td><strong>${h.name}</strong></td>
            <td>${h.stadt}</td>
            <td>${h.land}</td>
            <td class="sterne">${'★'.repeat(h.sterne)}</td>
            <td>${h.preisProNacht} €</td>
            <td>
                <button class="btn btn-warning btn-aktion" onclick='hotelBearbeiten(${JSON.stringify(h)})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger btn-aktion" onclick="hotelLoeschen('${h._id}', '${h.name.replace(/'/g, "\\'")}')"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function hotelNeu() {
    document.getElementById('hotel-modal-titel').textContent = 'Neues Hotel';
    document.getElementById('hotel-id').value = '';
    ['hotel-name','hotel-stadt','hotel-land','hotel-sterne','hotel-preis','hotel-beschreibung','hotel-ausstattung','hotel-bildUrl','hotel-langBeschreibung','hotel-adresse','hotel-webseite','hotel-bilder','hotel-highlights'].forEach(id => document.getElementById(id).value = '');
    fehlerVerstecke('hotel-fehler');
    new bootstrap.Modal(document.getElementById('modal-hotel')).show();
}

function hotelBearbeiten(h) {
    document.getElementById('hotel-modal-titel').textContent = 'Hotel bearbeiten';
    document.getElementById('hotel-id').value = h._id;
    document.getElementById('hotel-name').value = h.name;
    document.getElementById('hotel-stadt').value = h.stadt;
    document.getElementById('hotel-land').value = h.land;
    document.getElementById('hotel-sterne').value = h.sterne;
    document.getElementById('hotel-preis').value = h.preisProNacht;
    document.getElementById('hotel-beschreibung').value = h.beschreibung;
    document.getElementById('hotel-ausstattung').value = (h.ausstattung || []).join(', ');
    document.getElementById('hotel-bildUrl').value = h.bildUrl || '';
    document.getElementById('hotel-langBeschreibung').value = h.langBeschreibung || '';
    document.getElementById('hotel-adresse').value = h.adresse || '';
    document.getElementById('hotel-webseite').value = h.webseite || '';
    document.getElementById('hotel-bilder').value = (h.bilder || []).join('\n');
    document.getElementById('hotel-highlights').value = (h.highlights || []).join('\n');
    fehlerVerstecke('hotel-fehler');
    new bootstrap.Modal(document.getElementById('modal-hotel')).show();
}

async function hotelSpeichern() {
    fehlerVerstecke('hotel-fehler');
    const id = document.getElementById('hotel-id').value;
    const daten = {
        name: document.getElementById('hotel-name').value.trim(),
        stadt: document.getElementById('hotel-stadt').value.trim(),
        land: document.getElementById('hotel-land').value.trim(),
        sterne: Number(document.getElementById('hotel-sterne').value),
        preisProNacht: Number(document.getElementById('hotel-preis').value),
        beschreibung: document.getElementById('hotel-beschreibung').value.trim(),
        ausstattung: document.getElementById('hotel-ausstattung').value.split(',').map(s => s.trim()).filter(Boolean),
        bildUrl: document.getElementById('hotel-bildUrl').value.trim(),
        langBeschreibung: document.getElementById('hotel-langBeschreibung').value.trim(),
        adresse: document.getElementById('hotel-adresse').value.trim(),
        webseite: document.getElementById('hotel-webseite').value.trim(),
        bilder: document.getElementById('hotel-bilder').value.split('\n').map(s => s.trim()).filter(Boolean),
        highlights: document.getElementById('hotel-highlights').value.split('\n').map(s => s.trim()).filter(Boolean)
    };
    if (!daten.name || !daten.stadt || !daten.land || !daten.beschreibung)
        return fehlerZeige('hotel-fehler', 'Bitte alle Pflichtfelder ausfüllen.');
    if (daten.sterne < 1 || daten.sterne > 5)
        return fehlerZeige('hotel-fehler', 'Sterne müssen zwischen 1 und 5 liegen.');
    if (daten.preisProNacht < 0)
        return fehlerZeige('hotel-fehler', 'Preis darf nicht negativ sein.');

    try {
        if (id) await apiCall(`${API.hotels}/${id}`, 'PUT', daten);
        else await apiCall(API.hotels, 'POST', daten);
        toast('Erfolg', id ? 'Hotel aktualisiert' : 'Hotel erstellt');
        bootstrap.Modal.getInstance(document.getElementById('modal-hotel')).hide();
        state.geladen.hotels = false;
        state.geladen.dashboard = false;
        hotelsLaden();
    } catch (err) {
        fehlerZeige('hotel-fehler', err.message);
    }
}

function hotelLoeschen(id, name) {
    bestaetige(`Hotel "${name}" wirklich löschen?`, async () => {
        try {
            await apiCall(`${API.hotels}/${id}`, 'DELETE');
            toast('Erfolg', 'Hotel gelöscht');
            state.geladen.hotels = false;
            state.geladen.dashboard = false;
            hotelsLaden();
        } catch (err) { toast('Fehler', err.message, 'error'); }
    });
}

// ========== FLÜGE - CRUD ==========
async function fluegeLaden() {
    const tbody = document.getElementById('fluege-tbody');
    if (state.geladen.fluege) { fluegeRender(); return; }
    tbody.innerHTML = spinnerZeile(7, 'Lade Flüge...');
    try {
        state.fluege = await fetchMitTimeout(API.fluege);
        state.geladen.fluege = true;
        fluegeRender();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="alert alert-danger mb-0">Fehler: ${err.message}</div></td></tr>`;
    }
}

function fluegeRender() {
    const tbody = document.getElementById('fluege-tbody');
    let liste = state.fluege;
    if (state.sort.fluege.feld) liste = sortieren(liste, state.sort.fluege.feld, state.sort.fluege.richtung);
    if (liste.length === 0) {
        tbody.innerHTML = emptyZeile(7, 'Noch keine Flüge vorhanden', 'airplane', 'Ersten Flug anlegen', 'flugNeu()');
        return;
    }
    tbody.innerHTML = liste.map(f => `
        <tr>
            <td><strong>${f.flugnummer}</strong></td>
            <td>${f.airline}</td>
            <td>${f.abflughafen}</td>
            <td>${f.zielflughafen}</td>
            <td>${new Date(f.abflugzeit).toLocaleString('de-DE')}</td>
            <td>${f.preis.toFixed(2)} €</td>
            <td>
                <button class="btn btn-warning btn-aktion" onclick='flugBearbeiten(${JSON.stringify(f)})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger btn-aktion" onclick="flugLoeschen('${f._id}', '${f.flugnummer}')"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function flugNeu() {
    document.getElementById('flug-modal-titel').textContent = 'Neuer Flug';
    document.getElementById('flug-id').value = '';
    ['flug-nummer','flug-airline','flug-abflug','flug-ziel','flug-abflugzeit','flug-ankunft','flug-preis','flug-plaetze'].forEach(id => document.getElementById(id).value = '');
    fehlerVerstecke('flug-fehler');
    new bootstrap.Modal(document.getElementById('modal-flug')).show();
}

function flugBearbeiten(f) {
    document.getElementById('flug-modal-titel').textContent = 'Flug bearbeiten';
    document.getElementById('flug-id').value = f._id;
    document.getElementById('flug-nummer').value = f.flugnummer;
    document.getElementById('flug-airline').value = f.airline;
    document.getElementById('flug-abflug').value = f.abflughafen;
    document.getElementById('flug-ziel').value = f.zielflughafen;
    document.getElementById('flug-abflugzeit').value = new Date(f.abflugzeit).toISOString().slice(0, 16);
    document.getElementById('flug-ankunft').value = new Date(f.ankunftszeit).toISOString().slice(0, 16);
    document.getElementById('flug-preis').value = f.preis;
    document.getElementById('flug-klasse').value = f.klasse;
    document.getElementById('flug-plaetze').value = f.freiePlaetze || 0;
    fehlerVerstecke('flug-fehler');
    new bootstrap.Modal(document.getElementById('modal-flug')).show();
}

async function flugSpeichern() {
    fehlerVerstecke('flug-fehler');
    const id = document.getElementById('flug-id').value;
    const daten = {
        flugnummer: document.getElementById('flug-nummer').value.trim(),
        airline: document.getElementById('flug-airline').value.trim(),
        abflughafen: document.getElementById('flug-abflug').value.trim(),
        zielflughafen: document.getElementById('flug-ziel').value.trim(),
        abflugzeit: document.getElementById('flug-abflugzeit').value,
        ankunftszeit: document.getElementById('flug-ankunft').value,
        preis: Number(document.getElementById('flug-preis').value),
        klasse: document.getElementById('flug-klasse').value,
        freiePlaetze: Number(document.getElementById('flug-plaetze').value) || 0
    };
    if (!daten.flugnummer || !daten.airline || !daten.abflughafen || !daten.zielflughafen)
        return fehlerZeige('flug-fehler', 'Bitte alle Pflichtfelder ausfüllen.');
    if (new Date(daten.ankunftszeit) <= new Date(daten.abflugzeit))
        return fehlerZeige('flug-fehler', 'Ankunftszeit muss nach der Abflugzeit liegen.');

    try {
        if (id) await apiCall(`${API.fluege}/${id}`, 'PUT', daten);
        else await apiCall(API.fluege, 'POST', daten);
        toast('Erfolg', id ? 'Flug aktualisiert' : 'Flug erstellt');
        bootstrap.Modal.getInstance(document.getElementById('modal-flug')).hide();
        state.geladen.fluege = false;
        state.geladen.dashboard = false;
        fluegeLaden();
    } catch (err) { fehlerZeige('flug-fehler', err.message); }
}

function flugLoeschen(id, nummer) {
    bestaetige(`Flug "${nummer}" wirklich löschen?`, async () => {
        try {
            await apiCall(`${API.fluege}/${id}`, 'DELETE');
            toast('Erfolg', 'Flug gelöscht');
            state.geladen.fluege = false;
            state.geladen.dashboard = false;
            fluegeLaden();
        } catch (err) { toast('Fehler', err.message, 'error'); }
    });
}

// ========== MIETWAGEN - CRUD ==========
async function mietwagenLaden() {
    const tbody = document.getElementById('mietwagen-tbody');
    if (state.geladen.mietwagen) { mietwagenRender(); return; }
    tbody.innerHTML = spinnerZeile(6, 'Lade Mietwagen...');
    try {
        state.mietwagen = await fetchMitTimeout(API.mietwagen);
        state.geladen.mietwagen = true;
        mietwagenRender();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert-danger mb-0">Fehler: ${err.message}</div></td></tr>`;
    }
}

function mietwagenRender() {
    const tbody = document.getElementById('mietwagen-tbody');
    let liste = state.mietwagen;
    if (state.sort.mietwagen.feld) liste = sortieren(liste, state.sort.mietwagen.feld, state.sort.mietwagen.richtung);
    if (liste.length === 0) {
        tbody.innerHTML = emptyZeile(6, 'Noch keine Mietwagen vorhanden', 'car-front', 'Ersten Mietwagen anlegen', 'mietwagenNeu()');
        return;
    }
    tbody.innerHTML = liste.map(w => `
        <tr>
            <td><strong>${w.marke}</strong></td>
            <td>${w.modell}</td>
            <td><span class="badge bg-primary">${w.kategorie}</span></td>
            <td>${w.standort}</td>
            <td>${w.preisProTag.toFixed(2)} €</td>
            <td>
                <button class="btn btn-warning btn-aktion" onclick='mietwagenBearbeiten(${JSON.stringify(w)})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger btn-aktion" onclick="mietwagenLoeschen('${w._id}', '${(w.marke + ' ' + w.modell).replace(/'/g, "\\'")}')"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function mietwagenNeu() {
    document.getElementById('mietwagen-modal-titel').textContent = 'Neuer Mietwagen';
    document.getElementById('mietwagen-id').value = '';
    ['mw-marke','mw-modell','mw-standort','mw-preis','mw-bildUrl','mw-langBeschreibung','mw-bilder'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('mw-sitze').value = 5;
    document.getElementById('mw-kilometerProTag').value = '';
    document.getElementById('mw-mindestalter').value = 21;
    document.getElementById('mw-kaution').value = '';
    fehlerVerstecke('mietwagen-fehler');
    new bootstrap.Modal(document.getElementById('modal-mietwagen')).show();
}

function mietwagenBearbeiten(w) {
    document.getElementById('mietwagen-modal-titel').textContent = 'Mietwagen bearbeiten';
    document.getElementById('mietwagen-id').value = w._id;
    document.getElementById('mw-marke').value = w.marke;
    document.getElementById('mw-modell').value = w.modell;
    document.getElementById('mw-kategorie').value = w.kategorie;
    document.getElementById('mw-standort').value = w.standort;
    document.getElementById('mw-preis').value = w.preisProTag;
    document.getElementById('mw-getriebe').value = w.getriebe;
    document.getElementById('mw-kraftstoff').value = w.kraftstoff;
    document.getElementById('mw-sitze').value = w.sitzplaetze;
    document.getElementById('mw-verfuegbar').value = w.verfuegbar.toString();
    document.getElementById('mw-bildUrl').value = w.bildUrl || '';
    document.getElementById('mw-langBeschreibung').value = w.langBeschreibung || '';
    document.getElementById('mw-bilder').value = (w.bilder || []).join('\n');
    document.getElementById('mw-kilometerProTag').value = w.kilometerProTag || '';
    document.getElementById('mw-mindestalter').value = w.mindestalter || 21;
    document.getElementById('mw-kaution').value = w.kaution || '';
    fehlerVerstecke('mietwagen-fehler');
    new bootstrap.Modal(document.getElementById('modal-mietwagen')).show();
}

async function mietwagenSpeichern() {
    fehlerVerstecke('mietwagen-fehler');
    const id = document.getElementById('mietwagen-id').value;
    const daten = {
        marke: document.getElementById('mw-marke').value.trim(),
        modell: document.getElementById('mw-modell').value.trim(),
        kategorie: document.getElementById('mw-kategorie').value,
        standort: document.getElementById('mw-standort').value.trim(),
        preisProTag: Number(document.getElementById('mw-preis').value),
        getriebe: document.getElementById('mw-getriebe').value,
        kraftstoff: document.getElementById('mw-kraftstoff').value,
        sitzplaetze: Number(document.getElementById('mw-sitze').value),
        verfuegbar: document.getElementById('mw-verfuegbar').value === 'true',
        bildUrl: document.getElementById('mw-bildUrl').value.trim(),
        langBeschreibung: document.getElementById('mw-langBeschreibung').value.trim(),
        bilder: document.getElementById('mw-bilder').value.split('\n').map(s => s.trim()).filter(Boolean),
        kilometerProTag: Number(document.getElementById('mw-kilometerProTag').value) || 0,
        mindestalter: Number(document.getElementById('mw-mindestalter').value) || 21,
        kaution: Number(document.getElementById('mw-kaution').value) || 0
    };
    if (!daten.marke || !daten.modell || !daten.standort)
        return fehlerZeige('mietwagen-fehler', 'Bitte alle Pflichtfelder ausfüllen.');

    try {
        if (id) await apiCall(`${API.mietwagen}/${id}`, 'PUT', daten);
        else await apiCall(API.mietwagen, 'POST', daten);
        toast('Erfolg', id ? 'Mietwagen aktualisiert' : 'Mietwagen erstellt');
        bootstrap.Modal.getInstance(document.getElementById('modal-mietwagen')).hide();
        state.geladen.mietwagen = false;
        state.geladen.dashboard = false;
        mietwagenLaden();
    } catch (err) { fehlerZeige('mietwagen-fehler', err.message); }
}

function mietwagenLoeschen(id, name) {
    bestaetige(`Mietwagen "${name}" wirklich löschen?`, async () => {
        try {
            await apiCall(`${API.mietwagen}/${id}`, 'DELETE');
            toast('Erfolg', 'Mietwagen gelöscht');
            state.geladen.mietwagen = false;
            state.geladen.dashboard = false;
            mietwagenLaden();
        } catch (err) { toast('Fehler', err.message, 'error'); }
    });
}

// ========== BEWERTUNGEN - CRUD ==========
async function bewertungenLaden() {
    const tbody = document.getElementById('bewertungen-tbody');
    if (state.geladen.bewertungen) { bewertungenRender(); return; }
    tbody.innerHTML = spinnerZeile(6, 'Lade Bewertungen...');
    try {
        state.bewertungen = await fetchMitTimeout(API.bewertungen);
        state.geladen.bewertungen = true;
        bewertungenRender();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert-danger mb-0">Fehler: ${err.message}</div></td></tr>`;
    }
}

function bewertungenRender() {
    const tbody = document.getElementById('bewertungen-tbody');
    let liste = state.bewertungen;
    if (state.sort.bewertungen.feld) liste = sortieren(liste, state.sort.bewertungen.feld, state.sort.bewertungen.richtung);
    if (liste.length === 0) {
        tbody.innerHTML = emptyZeile(6, 'Noch keine Bewertungen vorhanden', 'star', 'Erste Bewertung anlegen', 'bewertungNeu()');
        return;
    }
    tbody.innerHTML = liste.map(b => `
        <tr>
            <td><strong>${b.hotelName}</strong></td>
            <td>${b.autor}</td>
            <td class="sterne">${'★'.repeat(b.sterne)}</td>
            <td>${b.kommentar.substring(0, 60)}${b.kommentar.length > 60 ? '...' : ''}</td>
            <td>${new Date(b.datum).toLocaleDateString('de-DE')}</td>
            <td>
                <button class="btn btn-warning btn-aktion" onclick='bewertungBearbeiten(${JSON.stringify(b)})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger btn-aktion" onclick="bewertungLoeschen('${b._id}')"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function hotelDropdownFuellen(selectedId = '') {
    const sel = document.getElementById('b-hotel-select');
    sel.innerHTML = '<option value="">-- Lade Hotels... --</option>';
    try {
        if (!state.hotels) {
            state.hotels = await fetchMitTimeout(API.hotels);
            state.geladen.hotels = true;
        }
        sel.innerHTML = '<option value="">-- Bitte Hotel wählen --</option>' +
            state.hotels.map(h =>
                `<option value="${h._id}" data-name="${h.name}" ${h._id === selectedId ? 'selected' : ''}>${h.name} (${h.stadt})</option>`
            ).join('');
    } catch (err) {
        sel.innerHTML = `<option value="">Fehler: ${err.message}</option>`;
    }
}

async function bewertungNeu() {
    document.getElementById('bewertung-modal-titel').textContent = 'Neue Bewertung';
    document.getElementById('bewertung-id').value = '';
    ['b-autor','b-sterne','b-kommentar'].forEach(id => document.getElementById(id).value = '');
    fehlerVerstecke('bewertung-fehler');
    await hotelDropdownFuellen();
    new bootstrap.Modal(document.getElementById('modal-bewertung')).show();
}

async function bewertungBearbeiten(b) {
    document.getElementById('bewertung-modal-titel').textContent = 'Bewertung bearbeiten';
    document.getElementById('bewertung-id').value = b._id;
    document.getElementById('b-autor').value = b.autor;
    document.getElementById('b-sterne').value = b.sterne;
    document.getElementById('b-kommentar').value = b.kommentar;
    fehlerVerstecke('bewertung-fehler');
    await hotelDropdownFuellen(b.hotelId);
    new bootstrap.Modal(document.getElementById('modal-bewertung')).show();
}

async function bewertungSpeichern() {
    fehlerVerstecke('bewertung-fehler');
    const id = document.getElementById('bewertung-id').value;
    const sel = document.getElementById('b-hotel-select');
    const hotelId = sel.value;
    const hotelName = sel.selectedOptions[0]?.getAttribute('data-name') || '';

    if (!hotelId) return fehlerZeige('bewertung-fehler', 'Bitte ein Hotel auswählen.');

    const daten = {
        hotelId, hotelName,
        autor: document.getElementById('b-autor').value.trim(),
        sterne: Number(document.getElementById('b-sterne').value),
        kommentar: document.getElementById('b-kommentar').value.trim()
    };
    if (!daten.autor || !daten.kommentar)
        return fehlerZeige('bewertung-fehler', 'Autor und Kommentar dürfen nicht leer sein.');
    if (daten.sterne < 1 || daten.sterne > 5)
        return fehlerZeige('bewertung-fehler', 'Sterne müssen zwischen 1 und 5 liegen.');

    try {
        if (id) await apiCall(`${API.bewertungen}/${id}`, 'PUT', daten);
        else await apiCall(API.bewertungen, 'POST', daten);
        toast('Erfolg', id ? 'Bewertung aktualisiert' : 'Bewertung erstellt');
        bootstrap.Modal.getInstance(document.getElementById('modal-bewertung')).hide();
        state.geladen.bewertungen = false;
        state.geladen.dashboard = false;
        bewertungenLaden();
    } catch (err) { fehlerZeige('bewertung-fehler', err.message); }
}

function bewertungLoeschen(id) {
    bestaetige('Bewertung wirklich löschen?', async () => {
        try {
            await apiCall(`${API.bewertungen}/${id}`, 'DELETE');
            toast('Erfolg', 'Bewertung gelöscht');
            state.geladen.bewertungen = false;
            state.geladen.dashboard = false;
            bewertungenLaden();
        } catch (err) { toast('Fehler', err.message, 'error'); }
    });
}

// ========== INIT mit LAZY LOADING ==========
document.addEventListener('DOMContentLoaded', () => {
    themeInit();
    // Dashboard ist initial aktiv → direkt laden
    dashboardLaden();
    // Andere Tabs werden über onclick="..." Lazy geladen (siehe HTML)
});
