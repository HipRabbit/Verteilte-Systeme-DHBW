// ============================================
// User Frontend - Read + Detail-Modals
// ============================================

// 127.0.0.1 statt localhost (vermeidet Windows-DNS-Verzögerung)
const API = {
    hotels:      'http://127.0.0.1:3002/api/hotels',
    fluege:      'http://127.0.0.1:3003/api/fluege',
    mietwagen:   'http://127.0.0.1:3004/api/mietwagen',
    bewertungen: 'http://127.0.0.1:3001/api/bewertungen'
};

const PLACEHOLDER = (text, farbe = '00b4a6') =>
    `https://placehold.co/800x400/${farbe}/white?text=${encodeURIComponent(text)}`;

const state = {
    hotels: null,        // null = noch nicht geladen
    fluege: null,
    mietwagen: null,
    bewertungen: null,
    sterneFilter: 0,
    geladen: { hotels: false, fluege: false, mietwagen: false, bewertungen: false }
};

// ========== AUTH-HANDLING ==========
function userBarRender() {
    const bar = document.getElementById('user-bar');
    const session = AUTH.getSession();

    let html = `
        <button id="theme-toggle-nav" class="btn btn-outline-light btn-sm" title="Design wechseln">
            <i class="bi bi-moon-stars"></i>
        </button>`;

    if (session) {
        html += `
            <div class="user-info-badge">
                <i class="bi bi-person-circle"></i>
                <span>${session.anzeigeName}<span class="badge bg-light text-dark ms-1">User</span></span>
            </div>
            <button class="btn btn-outline-light btn-sm" onclick="abmelden()">
                <i class="bi bi-box-arrow-right"></i> Abmelden
            </button>`;
    } else {
        html += `
            <span class="user-info-badge">
                <i class="bi bi-person-walking"></i> Gast
            </span>
            <a href="../login.html" class="btn btn-light btn-sm">
                <i class="bi bi-box-arrow-in-right"></i> Anmelden
            </a>`;
    }
    bar.innerHTML = html;
    document.getElementById('theme-toggle-nav').addEventListener('click', toggleTheme);
}

function abmelden() {
    if (confirm('Möchtest du dich wirklich abmelden?')) {
        AUTH.logout();
        window.location.href = '../login.html';
    }
}

function rechteAnwenden() {
    const box = document.getElementById('bewertung-schreiben-box');
    if (AUTH.darfBewertenSchreiben()) box.classList.remove('d-none');
    else box.classList.add('d-none');
}

// ========== DARK MODE ==========
function themeInit() {
    const gespeichert = localStorage.getItem('theme') || 'light';
    setTheme(gespeichert);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}
function toggleTheme() {
    const aktuell = document.documentElement.getAttribute('data-bs-theme');
    setTheme(aktuell === 'light' ? 'dark' : 'light');
}
function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    const float = document.getElementById('theme-icon');
    if (float) float.className = theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun';
    const nav = document.querySelector('#theme-toggle-nav i');
    if (nav) nav.className = theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun';
}

function backToAdminInit() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'admin' || sessionStorage.getItem('cameFromAdmin') === 'true') {
        document.getElementById('back-to-admin').style.display = 'inline-block';
        sessionStorage.setItem('cameFromAdmin', 'true');
    }
}

// ========== HELPER ==========
function emptyState(text, icon = 'inbox') {
    return `<div class="col-12"><div class="empty-state">
        <i class="bi bi-${icon}"></i>
        <h5 class="mt-3">${text}</h5>
    </div></div>`;
}

function sterneAnzeige(sterne, max = 5) {
    const voll = Math.round(sterne);
    return '★'.repeat(voll) + '☆'.repeat(max - voll);
}

function avgBewertung(hotelId, hotelName) {
    if (!state.bewertungen) return null;
    const eigene = state.bewertungen.filter(b => b.hotelId === hotelId || b.hotelName === hotelName);
    if (eigene.length === 0) return null;
    return {
        avg: eigene.reduce((s, b) => s + b.sterne, 0) / eigene.length,
        anzahl: eigene.length
    };
}

function flugdauer(abflug, ankunft) {
    const diff = new Date(ankunft) - new Date(abflug);
    if (isNaN(diff) || diff <= 0) return '—';
    const stunden = Math.floor(diff / (1000 * 60 * 60));
    const minuten = Math.floor((diff / (1000 * 60)) % 60);
    if (stunden === 0) return `${minuten}m`;
    if (minuten === 0) return `${stunden}h`;
    return `${stunden}h ${minuten}m`;
}

// fetch mit Timeout
async function fetchMitTimeout(url, timeoutMs = 5000) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') throw new Error('Timeout - Server antwortet nicht');
        throw err;
    }
}

// ========== HOTELS ==========
async function ladeHotels() {
    if (state.geladen.hotels) {
        renderHotels();
        return;
    }
    try {
        // Hotels und Bewertungen parallel laden
        const [hotels, bewertungen] = await Promise.all([
            fetchMitTimeout(API.hotels),
            fetchMitTimeout(API.bewertungen).catch(() => [])
        ]);
        state.hotels = hotels;
        state.bewertungen = bewertungen;
        state.geladen.hotels = true;
        state.geladen.bewertungen = true;
        renderHotels();
    } catch (err) {
        document.getElementById('hotels-liste').innerHTML =
            `<div class="col-12"><div class="alert alert-danger">
                <strong>Fehler beim Laden:</strong> ${err.message}<br>
                <small>Prüfe, ob der Hotel-Server (Port 3002) läuft.</small>
            </div></div>`;
    }
}

function renderHotels() {
    if (!state.hotels) return;
    const container = document.getElementById('hotels-liste');
    const suche = document.getElementById('hotel-suche').value.toLowerCase();
    const minSterne = Number(document.getElementById('hotel-sterne-filter').value);
    const sortOpt = document.getElementById('hotel-sort').value;

    let liste = state.hotels.filter(h => {
        const treffer = !suche ||
            h.name.toLowerCase().includes(suche) ||
            h.stadt.toLowerCase().includes(suche) ||
            h.land.toLowerCase().includes(suche);
        return treffer && h.sterne >= minSterne;
    });

    if (sortOpt === 'name') liste.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOpt === 'preis-asc') liste.sort((a, b) => a.preisProNacht - b.preisProNacht);
    if (sortOpt === 'preis-desc') liste.sort((a, b) => b.preisProNacht - a.preisProNacht);
    if (sortOpt === 'sterne-desc') liste.sort((a, b) => b.sterne - a.sterne);

    if (liste.length === 0) {
        container.innerHTML = emptyState('Keine Hotels gefunden', 'search');
        return;
    }

    container.innerHTML = liste.map(h => {
        const avg = avgBewertung(h._id, h.name);
        const avgBadge = avg
            ? `<span class="badge bg-warning text-dark">★ ${avg.avg.toFixed(1)} (${avg.anzahl})</span>`
            : '<span class="badge bg-secondary">Neu</span>';
        const erstesBild = (h.bilder && h.bilder.length > 0) ? h.bilder[0] : (h.bildUrl || PLACEHOLDER(h.name));
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 karte-klickbar" onclick="hotelDetailZeigen('${h._id}')">
                    <img src="${erstesBild}" class="card-img-top" style="height:200px;object-fit:cover"
                         alt="${h.name}"
                         onerror="this.onerror=null; this.src='${PLACEHOLDER(h.name)}'">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2 gap-2">
                            <h5 class="card-title mb-0">${h.name}</h5>
                            ${avgBadge}
                        </div>
                        <p class="text-muted small mb-1"><i class="bi bi-geo-alt"></i> ${h.stadt}, ${h.land}</p>
                        <p class="sterne mb-2">${sterneAnzeige(h.sterne)}</p>
                        <p class="card-text small flex-grow-1">${h.beschreibung}</p>
                        <div class="mb-2">
                            ${(h.ausstattung || []).map(a => `<span class="badge bg-secondary me-1">${a}</span>`).join('')}
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="preis">${h.preisProNacht} € <small class="text-muted fs-6">/ Nacht</small></span>
                            <span class="text-primary small"><i class="bi bi-arrow-right-circle"></i> Details</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== HOTEL-DETAIL MODAL ==========
async function hotelDetailZeigen(hotelId) {
    const body = document.getElementById('hotel-detail-body');
    body.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
    new bootstrap.Modal(document.getElementById('modal-hotel-detail')).show();

    try {
        // Hotel und seine Bewertungen parallel
        const [hotel, bewertungen] = await Promise.all([
            fetchMitTimeout(`${API.hotels}/${hotelId}`),
            fetchMitTimeout(`${API.bewertungen}/hotel/${hotelId}`).catch(() => [])
        ]);

        const avg = bewertungen.length > 0
            ? (bewertungen.reduce((s, b) => s + b.sterne, 0) / bewertungen.length).toFixed(1)
            : null;

        // Bilder bestimmen
        const bilder = (hotel.bilder && hotel.bilder.length > 0)
            ? hotel.bilder
            : (hotel.bildUrl ? [hotel.bildUrl] : [PLACEHOLDER(hotel.name)]);

        // Galerie HTML
        const galerieHtml = `
            <div id="hotel-carousel" class="carousel slide detail-galerie" data-bs-ride="carousel">
                ${bilder.length > 1 ? `
                <div class="carousel-indicators">
                    ${bilder.map((_, i) => `<button type="button" data-bs-target="#hotel-carousel" data-bs-slide-to="${i}" ${i === 0 ? 'class="active"' : ''}></button>`).join('')}
                </div>` : ''}
                <div class="carousel-inner">
                    ${bilder.map((b, i) => `
                        <div class="carousel-item ${i === 0 ? 'active' : ''}">
                            <img src="${b}" alt="${hotel.name}" onerror="this.onerror=null; this.src='${PLACEHOLDER(hotel.name)}'">
                        </div>
                    `).join('')}
                </div>
                ${bilder.length > 1 ? `
                <button class="carousel-control-prev" type="button" data-bs-target="#hotel-carousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#hotel-carousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon"></span>
                </button>` : ''}
            </div>
        `;

        // Highlights
        const highlightsHtml = (hotel.highlights && hotel.highlights.length > 0) ? `
            <div class="detail-section">
                <h5><i class="bi bi-stars"></i> Highlights</h5>
                <div>
                    ${hotel.highlights.map(h => `
                        <div class="detail-highlight-item">
                            <i class="bi bi-check-circle-fill"></i>
                            <span>${h}</span>
                        </div>
                    `).join('')}
                </div>
            </div>` : '';

        // Bewertungen
        const bewertungenHtml = bewertungen.length > 0 ? `
            <div class="detail-section">
                <h5><i class="bi bi-chat-left-text"></i> Bewertungen (${bewertungen.length})</h5>
                ${avg ? `<p><strong>Durchschnitt:</strong> <span class="sterne">${sterneAnzeige(parseFloat(avg))}</span> ${avg} / 5</p>` : ''}
                ${bewertungen.slice(0, 5).map(b => `
                    <div class="card mb-2">
                        <div class="card-body py-2">
                            <div class="d-flex justify-content-between">
                                <strong>${b.autor}</strong>
                                <span class="sterne">${sterneAnzeige(b.sterne)}</span>
                            </div>
                            <p class="mb-1 small">"${b.kommentar}"</p>
                            <small class="text-muted">${new Date(b.datum).toLocaleDateString('de-DE')}</small>
                        </div>
                    </div>
                `).join('')}
                ${bewertungen.length > 5 ? `<small class="text-muted">und ${bewertungen.length - 5} weitere Bewertungen...</small>` : ''}
            </div>` : '';

        body.innerHTML = `
            ${galerieHtml}
            <div class="detail-content">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                    <div>
                        <h2 class="detail-titel mb-1">${hotel.name}</h2>
                        <p class="text-muted mb-1"><i class="bi bi-geo-alt"></i> ${hotel.adresse || (hotel.stadt + ', ' + hotel.land)}</p>
                        <p class="sterne mb-0 fs-5">${sterneAnzeige(hotel.sterne)}</p>
                    </div>
                    ${avg ? `<span class="badge bg-warning text-dark fs-5 px-3 py-2">★ ${avg} (${bewertungen.length})</span>` : ''}
                </div>

                <p class="lead">${hotel.beschreibung}</p>
                ${hotel.langBeschreibung ? `<p>${hotel.langBeschreibung}</p>` : ''}

                ${highlightsHtml}

                ${(hotel.ausstattung && hotel.ausstattung.length > 0) ? `
                <div class="detail-section">
                    <h5><i class="bi bi-list-check"></i> Ausstattung</h5>
                    <div>
                        ${hotel.ausstattung.map(a => `<span class="badge bg-secondary me-2 mb-2 fs-6">${a}</span>`).join('')}
                    </div>
                </div>` : ''}

                <div class="detail-section">
                    <h5><i class="bi bi-info-circle"></i> Informationen</h5>
                    <div class="detail-info-grid">
                        ${hotel.adresse ? `
                        <div class="detail-info-item">
                            <span class="detail-info-label">Adresse</span>
                            <span class="detail-info-wert">${hotel.adresse}</span>
                        </div>` : ''}
                        ${hotel.webseite ? `
                        <div class="detail-info-item">
                            <span class="detail-info-label">Webseite</span>
                            <span class="detail-info-wert"><a href="${hotel.webseite}" target="_blank" rel="noopener">${hotel.webseite}</a></span>
                        </div>` : ''}
                    </div>
                </div>

                ${bewertungenHtml}

                <div class="detail-preis-box">
                    <div class="detail-info-label" style="color:rgba(255,255,255,0.8)">Preis pro Nacht</div>
                    <div class="detail-preis-zahl">${hotel.preisProNacht} €</div>
                </div>
            </div>
        `;
    } catch (err) {
        body.innerHTML = `<div class="alert alert-danger m-4">Fehler: ${err.message}</div>`;
    }
}

// ========== FLÜGE ==========
async function ladeFluege() {
    if (state.geladen.fluege) {
        renderFluege();
        return;
    }
    try {
        state.fluege = await fetchMitTimeout(API.fluege);
        state.geladen.fluege = true;
        renderFluege();
    } catch (err) {
        document.getElementById('fluege-liste').innerHTML =
            `<tr><td colspan="8"><div class="alert alert-danger mb-0">
                <strong>Fehler:</strong> ${err.message}<br>
                <small>Prüfe, ob der Flug-Server (Port 3003) läuft.</small>
            </div></td></tr>`;
    }
}

function fluegeFilterReset() {
    document.getElementById('flug-suche').value = '';
    document.getElementById('flug-datum-von').value = '';
    document.getElementById('flug-datum-bis').value = '';
    document.getElementById('flug-sort').value = 'preis-asc';
    renderFluege();
}

function renderFluege() {
    if (!state.fluege) return;
    const tbody = document.getElementById('fluege-liste');
    const suche = document.getElementById('flug-suche').value.toLowerCase();
    const datumVon = document.getElementById('flug-datum-von').value;
    const datumBis = document.getElementById('flug-datum-bis').value;
    const sortOpt = document.getElementById('flug-sort').value;

    let liste = state.fluege.filter(f => {
        const sucheTreffer = !suche ||
            f.flugnummer.toLowerCase().includes(suche) ||
            f.airline.toLowerCase().includes(suche) ||
            f.abflughafen.toLowerCase().includes(suche) ||
            f.zielflughafen.toLowerCase().includes(suche);
        const abflug = new Date(f.abflugzeit);
        const ankunft = new Date(f.ankunftszeit);
        const vonTreffer = !datumVon || abflug >= new Date(datumVon + 'T00:00');
        const bisTreffer = !datumBis || ankunft <= new Date(datumBis + 'T23:59');
        return sucheTreffer && vonTreffer && bisTreffer;
    });

    if (sortOpt === 'preis-asc') liste.sort((a, b) => a.preis - b.preis);
    if (sortOpt === 'preis-desc') liste.sort((a, b) => b.preis - a.preis);

    if (liste.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="bi bi-airplane"></i><h5 class="mt-3">Keine Flüge gefunden</h5><p class="text-muted">Versuche es mit anderen Filtern.</p></div></td></tr>`;
        return;
    }

    tbody.innerHTML = liste.map(f => `
        <tr>
            <td class="px-3"><strong>${f.flugnummer}</strong></td>
            <td>${f.airline}</td>
            <td class="flug-route">${f.abflughafen} <span class="flug-route-pfeil">→</span> ${f.zielflughafen}</td>
            <td>${new Date(f.abflugzeit).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td>${new Date(f.ankunftszeit).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td><span class="flug-dauer-badge"><i class="bi bi-clock"></i> ${flugdauer(f.abflugzeit, f.ankunftszeit)}</span></td>
            <td><span class="badge bg-info">${f.klasse}</span></td>
            <td class="preis pe-3">${f.preis.toFixed(2)} €</td>
        </tr>
    `).join('');
}

// ========== MIETWAGEN ==========
async function ladeMietwagen() {
    if (state.geladen.mietwagen) {
        renderMietwagen();
        return;
    }
    try {
        state.mietwagen = await fetchMitTimeout(API.mietwagen);
        state.geladen.mietwagen = true;
        renderMietwagen();
    } catch (err) {
        document.getElementById('mietwagen-liste').innerHTML =
            `<div class="col-12"><div class="alert alert-danger">
                <strong>Fehler:</strong> ${err.message}<br>
                <small>Prüfe, ob der Mietwagen-Server (Port 3004) läuft.</small>
            </div></div>`;
    }
}

function renderMietwagen() {
    if (!state.mietwagen) return;
    const container = document.getElementById('mietwagen-liste');
    const suche = document.getElementById('mietwagen-suche').value.toLowerCase();
    const kat = document.getElementById('mietwagen-kategorie-filter').value;
    const sortOpt = document.getElementById('mietwagen-sort').value;

    let liste = state.mietwagen.filter(w => {
        const treffer = !suche ||
            w.marke.toLowerCase().includes(suche) ||
            w.modell.toLowerCase().includes(suche) ||
            w.standort.toLowerCase().includes(suche);
        const katTreffer = !kat || w.kategorie === kat;
        return treffer && katTreffer;
    });

    if (sortOpt === 'preis-asc') liste.sort((a, b) => a.preisProTag - b.preisProTag);
    if (sortOpt === 'preis-desc') liste.sort((a, b) => b.preisProTag - a.preisProTag);
    if (sortOpt === 'marke') liste.sort((a, b) => a.marke.localeCompare(b.marke));

    if (liste.length === 0) {
        container.innerHTML = emptyState('Keine Mietwagen gefunden', 'car-front');
        return;
    }

    container.innerHTML = liste.map(w => {
        const erstesBild = (w.bilder && w.bilder.length > 0)
            ? w.bilder[0]
            : (w.bildUrl || PLACEHOLDER(w.marke + ' ' + w.modell, 'ff7e5f'));
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 karte-klickbar" onclick="mietwagenDetailZeigen('${w._id}')">
                    <img src="${erstesBild}" class="card-img-top" style="height:200px;object-fit:cover"
                         alt="${w.marke} ${w.modell}"
                         onerror="this.onerror=null; this.src='${PLACEHOLDER(w.marke + ' ' + w.modell, 'ff7e5f')}'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${w.marke} ${w.modell}</h5>
                        <span class="badge bg-primary mb-2 align-self-start">${w.kategorie}</span>
                        <p class="text-muted small mb-1"><i class="bi bi-geo-alt"></i> ${w.standort}</p>
                        <ul class="list-unstyled small mb-2 flex-grow-1">
                            <li><i class="bi bi-gear"></i> ${w.getriebe}</li>
                            <li><i class="bi bi-fuel-pump"></i> ${w.kraftstoff}</li>
                            <li><i class="bi bi-people"></i> ${w.sitzplaetze} Sitzplätze</li>
                        </ul>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="preis">${w.preisProTag.toFixed(2)} € <small class="text-muted fs-6">/ Tag</small></span>
                            <span class="text-primary small"><i class="bi bi-arrow-right-circle"></i> Details</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== MIETWAGEN-DETAIL MODAL ==========
async function mietwagenDetailZeigen(id) {
    const body = document.getElementById('mietwagen-detail-body');
    body.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
    new bootstrap.Modal(document.getElementById('modal-mietwagen-detail')).show();

    try {
        const w = await fetchMitTimeout(`${API.mietwagen}/${id}`);

        const bilder = (w.bilder && w.bilder.length > 0)
            ? w.bilder
            : (w.bildUrl ? [w.bildUrl] : [PLACEHOLDER(w.marke + ' ' + w.modell, 'ff7e5f')]);

        const galerieHtml = `
            <div id="mietwagen-carousel" class="carousel slide detail-galerie" data-bs-ride="carousel">
                ${bilder.length > 1 ? `
                <div class="carousel-indicators">
                    ${bilder.map((_, i) => `<button type="button" data-bs-target="#mietwagen-carousel" data-bs-slide-to="${i}" ${i === 0 ? 'class="active"' : ''}></button>`).join('')}
                </div>` : ''}
                <div class="carousel-inner">
                    ${bilder.map((b, i) => `
                        <div class="carousel-item ${i === 0 ? 'active' : ''}">
                            <img src="${b}" alt="${w.marke} ${w.modell}" onerror="this.onerror=null; this.src='${PLACEHOLDER(w.marke + ' ' + w.modell, 'ff7e5f')}'">
                        </div>
                    `).join('')}
                </div>
                ${bilder.length > 1 ? `
                <button class="carousel-control-prev" type="button" data-bs-target="#mietwagen-carousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#mietwagen-carousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon"></span>
                </button>` : ''}
            </div>
        `;

        body.innerHTML = `
            ${galerieHtml}
            <div class="detail-content">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                    <div>
                        <h2 class="detail-titel mb-1">${w.marke} ${w.modell}</h2>
                        <p class="text-muted mb-1"><i class="bi bi-geo-alt"></i> ${w.standort}</p>
                        <span class="badge bg-primary fs-6">${w.kategorie}</span>
                        ${w.verfuegbar
                            ? '<span class="badge bg-success fs-6 ms-2">Verfügbar</span>'
                            : '<span class="badge bg-danger fs-6 ms-2">Nicht verfügbar</span>'}
                    </div>
                </div>

                ${w.langBeschreibung ? `<p class="lead">${w.langBeschreibung}</p>` : ''}

                <div class="detail-section">
                    <h5><i class="bi bi-gear"></i> Technische Daten</h5>
                    <div class="detail-info-grid">
                        <div class="detail-info-item">
                            <span class="detail-info-label">Getriebe</span>
                            <span class="detail-info-wert"><i class="bi bi-gear"></i> ${w.getriebe}</span>
                        </div>
                        <div class="detail-info-item">
                            <span class="detail-info-label">Kraftstoff</span>
                            <span class="detail-info-wert"><i class="bi bi-fuel-pump"></i> ${w.kraftstoff}</span>
                        </div>
                        <div class="detail-info-item">
                            <span class="detail-info-label">Sitzplätze</span>
                            <span class="detail-info-wert"><i class="bi bi-people"></i> ${w.sitzplaetze}</span>
                        </div>
                        <div class="detail-info-item">
                            <span class="detail-info-label">Kategorie</span>
                            <span class="detail-info-wert">${w.kategorie}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h5><i class="bi bi-file-text"></i> Mietkonditionen</h5>
                    <div class="detail-info-grid">
                        ${w.kilometerProTag ? `
                        <div class="detail-info-item">
                            <span class="detail-info-label">Freie Kilometer/Tag</span>
                            <span class="detail-info-wert">${w.kilometerProTag} km</span>
                        </div>` : ''}
                        ${w.mindestalter ? `
                        <div class="detail-info-item">
                            <span class="detail-info-label">Mindestalter</span>
                            <span class="detail-info-wert">${w.mindestalter} Jahre</span>
                        </div>` : ''}
                        ${w.kaution ? `
                        <div class="detail-info-item">
                            <span class="detail-info-label">Kaution</span>
                            <span class="detail-info-wert">${w.kaution} €</span>
                        </div>` : ''}
                        <div class="detail-info-item">
                            <span class="detail-info-label">Standort</span>
                            <span class="detail-info-wert">${w.standort}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-preis-box">
                    <div class="detail-info-label" style="color:rgba(255,255,255,0.8)">Preis pro Tag</div>
                    <div class="detail-preis-zahl">${w.preisProTag.toFixed(2)} €</div>
                </div>
            </div>
        `;
    } catch (err) {
        body.innerHTML = `<div class="alert alert-danger m-4">Fehler: ${err.message}</div>`;
    }
}

// ========== BEWERTUNGEN ==========
async function ladeBewertungen() {
    if (state.geladen.bewertungen) {
        renderBewertungen();
        return;
    }
    try {
        state.bewertungen = await fetchMitTimeout(API.bewertungen);
        state.geladen.bewertungen = true;
        renderBewertungen();
    } catch (err) {
        document.getElementById('bewertungen-liste').innerHTML =
            `<div class="col-12"><div class="alert alert-danger">
                <strong>Fehler:</strong> ${err.message}<br>
                <small>Prüfe, ob der Bewertungs-Server (Port 3001) läuft.</small>
            </div></div>`;
    }
}

function renderBewertungen() {
    if (!state.bewertungen) return;
    const container = document.getElementById('bewertungen-liste');
    const suche = document.getElementById('bewertung-suche').value.toLowerCase();

    let liste = state.bewertungen.filter(b => {
        const sucheTreffer = !suche ||
            b.hotelName.toLowerCase().includes(suche) ||
            b.autor.toLowerCase().includes(suche) ||
            b.kommentar.toLowerCase().includes(suche);
        const sterneTreffer = state.sterneFilter === 0 || b.sterne === state.sterneFilter;
        return sucheTreffer && sterneTreffer;
    });

    liste.sort((a, b) => new Date(b.datum) - new Date(a.datum));

    if (liste.length === 0) {
        const text = state.sterneFilter > 0
            ? `Keine ${state.sterneFilter}-Sterne-Bewertungen gefunden`
            : 'Keine Bewertungen gefunden';
        container.innerHTML = emptyState(text, 'star');
        return;
    }

    container.innerHTML = liste.map(b => `
        <div class="col-md-6">
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <h5 class="card-title mb-0">${b.hotelName}</h5>
                        <span class="sterne">${sterneAnzeige(b.sterne)}</span>
                    </div>
                    <p class="card-text">"${b.kommentar}"</p>
                    <small class="text-muted">
                        <i class="bi bi-person"></i> ${b.autor} &middot;
                        <i class="bi bi-calendar"></i> ${new Date(b.datum).toLocaleDateString('de-DE')}
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

function sterneFilterInit() {
    const buttons = document.querySelectorAll('.sterne-filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('aktiv'));
            btn.classList.add('aktiv');
            state.sterneFilter = Number(btn.dataset.sterne);
            renderBewertungen();
        });
    });
}

// ========== BEWERTUNG SCHREIBEN ==========
async function bewertungSchreibenOeffnen() {
    if (!AUTH.darfBewertenSchreiben()) {
        alert('Du musst eingeloggt sein, um Bewertungen schreiben zu können.');
        window.location.href = '../login.html';
        return;
    }

    // Hotels laden falls nötig
    if (!state.hotels) {
        try {
            state.hotels = await fetchMitTimeout(API.hotels);
            state.geladen.hotels = true;
        } catch (err) {
            alert('Hotels konnten nicht geladen werden: ' + err.message);
            return;
        }
    }

    const sel = document.getElementById('schreib-hotel-select');
    sel.innerHTML = '<option value="">-- Hotel auswählen --</option>' +
        state.hotels.map(h =>
            `<option value="${h._id}" data-name="${h.name}">${h.name} (${h.stadt})</option>`
        ).join('');

    document.getElementById('schreib-sterne').value = '5';
    document.getElementById('schreib-kommentar').value = '';
    document.getElementById('schreib-fehler').classList.add('d-none');

    new bootstrap.Modal(document.getElementById('modal-bewertung-schreiben')).show();
}

async function bewertungAbsenden() {
    const fehlerBox = document.getElementById('schreib-fehler');
    fehlerBox.classList.add('d-none');

    const sel = document.getElementById('schreib-hotel-select');
    const hotelId = sel.value;
    const hotelName = sel.selectedOptions[0]?.getAttribute('data-name') || '';
    const sterne = Number(document.getElementById('schreib-sterne').value);
    const kommentar = document.getElementById('schreib-kommentar').value.trim();

    if (!hotelId) { fehlerBox.textContent = 'Bitte wähle ein Hotel aus.'; fehlerBox.classList.remove('d-none'); return; }
    if (!kommentar) { fehlerBox.textContent = 'Bitte schreibe einen Kommentar.'; fehlerBox.classList.remove('d-none'); return; }

    const session = AUTH.getSession();
    const daten = { hotelId, hotelName, autor: session.anzeigeName, sterne, kommentar };

    try {
        const res = await fetch(API.bewertungen, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(daten)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Fehler' }));
            throw new Error(err.error || 'Fehler beim Speichern');
        }
        bootstrap.Modal.getInstance(document.getElementById('modal-bewertung-schreiben')).hide();
        alert('Vielen Dank! Deine Bewertung wurde gespeichert.');
        // Cache invalidieren und neu laden
        state.geladen.bewertungen = false;
        ladeBewertungen();
    } catch (err) {
        fehlerBox.textContent = 'Fehler: ' + err.message;
        fehlerBox.classList.remove('d-none');
    }
}

// ========== INIT mit LAZY LOADING ==========
document.addEventListener('DOMContentLoaded', () => {
    themeInit();
    userBarRender();
    rechteAnwenden();
    backToAdminInit();
    sterneFilterInit();

    // Hotels-Tab ist initial aktiv → direkt laden
    ladeHotels();

    // Andere Tabs erst beim Klick laden (Lazy Loading)
    document.querySelector('[data-bs-target="#fluege-tab"]').addEventListener('click', ladeFluege);
    document.querySelector('[data-bs-target="#mietwagen-tab"]').addEventListener('click', ladeMietwagen);
    document.querySelector('[data-bs-target="#bewertungen-tab"]').addEventListener('click', ladeBewertungen);

    // Filter
    ['hotel-suche', 'hotel-sterne-filter', 'hotel-sort'].forEach(id =>
        document.getElementById(id).addEventListener('input', renderHotels));
    ['flug-suche', 'flug-datum-von', 'flug-datum-bis', 'flug-sort'].forEach(id =>
        document.getElementById(id).addEventListener('input', renderFluege));
    ['mietwagen-suche', 'mietwagen-kategorie-filter', 'mietwagen-sort'].forEach(id =>
        document.getElementById(id).addEventListener('input', renderMietwagen));
    document.getElementById('bewertung-suche').addEventListener('input', renderBewertungen);
});
