// ============================================
// User Frontend - Read + (Bewertung schreiben für User/Admin)
// ============================================

const API = {
    hotels:      'http://localhost:3002/api/hotels',
    fluege:      'http://localhost:3003/api/fluege',
    mietwagen:   'http://localhost:3004/api/mietwagen',
    bewertungen: 'http://localhost:3001/api/bewertungen'
};

const PLACEHOLDER = (text, farbe = '00b4a6') =>
    `https://placehold.co/400x200/${farbe}/white?text=${encodeURIComponent(text)}`;

const state = {
    hotels: [], fluege: [], mietwagen: [], bewertungen: [],
    nurFavoriten: false,
    nurMietwagenFavoriten: false
};

// ========== FAVORITEN (localStorage, pro Benutzer getrennt) ==========
function _favKey(basis) {
    const s = AUTH.getSession();
    return `${basis}_${s ? s.username : 'gast'}`;
}

const FAVORITEN = {
    get key()  { return _favKey('meinUrlaub_fav_hotels'); },
    get()      { return JSON.parse(localStorage.getItem(this.key) || '[]'); },
    hat(id)    { return this.get().includes(String(id)); },
    toggle(id) {
        const favs = this.get();
        const idx  = favs.indexOf(String(id));
        if (idx === -1) favs.push(String(id));
        else            favs.splice(idx, 1);
        localStorage.setItem(this.key, JSON.stringify(favs));
        return idx === -1;
    },
    anzahl()   { return this.get().length; }
};

const FAVORITEN_MIETWAGEN = {
    get key()  { return _favKey('meinUrlaub_fav_mietwagen'); },
    get()      { return JSON.parse(localStorage.getItem(this.key) || '[]'); },
    hat(id)    { return this.get().includes(String(id)); },
    toggle(id) {
        const favs = this.get();
        const idx  = favs.indexOf(String(id));
        if (idx === -1) favs.push(String(id));
        else            favs.splice(idx, 1);
        localStorage.setItem(this.key, JSON.stringify(favs));
        return idx === -1;
    },
    anzahl()   { return this.get().length; }
};

// ========== AUTH-HANDLING ==========
function userBarRender() {
    const bar     = document.getElementById('user-bar');
    const session = AUTH.getSession();
    const rolle   = AUTH.getRolle();

    let html = `
        <button id="theme-toggle-nav" class="btn btn-outline-light btn-sm" title="Design wechseln" style="border-radius:50px">
            <i class="bi bi-moon-stars"></i>
        </button>`;

    if (session) {
        html += `
            <button class="burger-btn" data-bs-toggle="offcanvas" data-bs-target="#user-menu-offcanvas"
                    title="Mein Bereich">
                <i class="bi bi-person-circle" style="font-size:1.1rem"></i>
                <span class="d-none d-sm-inline">${session.anzeigeName}</span>
                <i class="bi bi-list" style="font-size:1.1rem"></i>
            </button>`;
    } else {
        html += `
            <span class="user-info-badge">
                <i class="bi bi-person-walking"></i> Gast
            </span>
            <a href="../login.html" class="btn btn-light btn-sm" style="border-radius:50px">
                <i class="bi bi-box-arrow-in-right"></i> Anmelden
            </a>`;
    }
    bar.innerHTML = html;
    document.getElementById('theme-toggle-nav').addEventListener('click', toggleTheme);

    if (session) offcanvasInit(session, rolle);
}

function offcanvasInit(session, rolle) {
    // Rolle-Label
    const rolleLabel = document.getElementById('offcanvas-rolle-label');
    if (rolleLabel) rolleLabel.textContent = rolle === 'admin' ? 'Administrator' : 'Mitglied';

    // Avatar + Name
    const userInfo = document.getElementById('offcanvas-user-info');
    if (userInfo) {
        const rolleBadge = rolle === 'admin'
            ? '<span class="badge bg-danger" style="font-size:0.75rem">Admin</span>'
            : '<span class="badge bg-primary" style="font-size:0.75rem">User</span>';
        userInfo.innerHTML = `
            <div class="offcanvas-avatar"><i class="bi bi-person-fill"></i></div>
            <div>
                <div class="fw-semibold" style="font-size:1rem">${session.anzeigeName}</div>
                <div class="mt-1">${rolleBadge}</div>
            </div>`;
    }

    // Bewertung schreiben
    const bewBtn = document.getElementById('offcanvas-bewertung-btn');
    if (bewBtn && AUTH.darfBewertenSchreiben()) bewBtn.style.display = '';

    // Admin-Link
    const adminBtn = document.getElementById('offcanvas-admin-btn');
    if (adminBtn && rolle === 'admin') adminBtn.style.display = '';

    // Favoriten-Anzahl aktuell halten
    offcanvasFavUpdate();
    document.getElementById('user-menu-offcanvas')
        ?.addEventListener('show.bs.offcanvas', offcanvasFavUpdate);
}

function offcanvasFavUpdate() {
    const el = document.getElementById('offcanvas-fav-anzahl');
    if (el) {
        const n = FAVORITEN.anzahl();
        el.textContent = n === 0 ? 'Keine gespeichert' : `${n} gespeichert`;
    }
    const elMw = document.getElementById('offcanvas-mw-fav-anzahl');
    if (elMw) {
        const n = FAVORITEN_MIETWAGEN.anzahl();
        elMw.textContent = n === 0 ? 'Keine gespeichert' : `${n} gespeichert`;
    }
}

function offcanvasZuFavoriten() {
    bootstrap.Offcanvas.getInstance(document.getElementById('user-menu-offcanvas'))?.hide();
    const tab = document.querySelector('[data-bs-target="#hotels-tab"]');
    if (tab) bootstrap.Tab.getOrCreateInstance(tab).show();
    if (!state.nurFavoriten) nurFavoritenToggle();
}

function offcanvasZuMietwagenFavoriten() {
    bootstrap.Offcanvas.getInstance(document.getElementById('user-menu-offcanvas'))?.hide();
    const tab = document.querySelector('[data-bs-target="#mietwagen-tab"]');
    if (tab) bootstrap.Tab.getOrCreateInstance(tab).show();
    if (!state.nurMietwagenFavoriten) nurMietwagenFavoritenToggle();
}

function offcanvasBewertungSchreiben() {
    bootstrap.Offcanvas.getInstance(document.getElementById('user-menu-offcanvas'))?.hide();
    setTimeout(() => bewertungSchreibenOeffnen(), 300);
}

function abmelden() {
    if (confirm('Möchtest du dich wirklich abmelden?')) {
        AUTH.logout();
        window.location.href = '../login.html';
    }
}

function rechteAnwenden() {
    // Bewertungen-Tab wurde entfernt – Button existiert nicht mehr, kein Fehler
}

// ========== DARK MODE ==========
function themeInit() {
    setTheme(localStorage.getItem('theme') || 'light');
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

// ========== BACK-TO-ADMIN ==========
function backToAdminInit() {
    // Wird angezeigt wenn der User aus dem Admin-Panel kommt UND eingeloggt als Admin ist
    if (AUTH.istAdmin()) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('from') === 'admin' || sessionStorage.getItem('cameFromAdmin') === 'true') {
            document.getElementById('back-to-admin').style.display = 'inline-block';
            sessionStorage.setItem('cameFromAdmin', 'true');
        }
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

// ========== HOTELS ==========
async function ladeHotels() {
    const container = document.getElementById('hotels-liste');
    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Lade Hotels...</p></div>';
    try {
        const [hotels, bewertungen] = await Promise.all([
            fetch(API.hotels).then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status} – Server antwortet mit Fehler`);
                return r.json();
            }),
            fetch(API.bewertungen).then(r => r.json()).catch(() => [])
        ]);
        state.hotels = Array.isArray(hotels) ? hotels : [];
        state.bewertungen = Array.isArray(bewertungen) ? bewertungen : [];
        renderHotels();
    } catch (err) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Hotel-Server nicht erreichbar</strong><br>
                    <span class="small">${err.message}</span><br>
                    <span class="small text-muted">Stelle sicher, dass der Hotel-Server auf Port 3002 läuft.</span>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-danger" onclick="ladeHotels()">
                            <i class="bi bi-arrow-clockwise"></i> Erneut versuchen
                        </button>
                    </div>
                </div>
            </div>`;
    }
}

function favoritenAnzahlUpdate() {
    const n = FAVORITEN.anzahl();
    const el = document.getElementById('fav-anzahl');
    if (el) el.textContent = n;
    const hinweis = document.getElementById('fav-filter-hinweis');
    if (hinweis) hinweis.classList.toggle('d-none', n === 0 && !state.nurFavoriten);
}

function nurFavoritenToggle() {
    state.nurFavoriten = !state.nurFavoriten;
    const btn  = document.getElementById('fav-filter-btn');
    const icon = document.getElementById('fav-filter-icon');
    if (btn)  btn.classList.toggle('aktiv-fav', state.nurFavoriten);
    if (icon) icon.className = state.nurFavoriten ? 'bi bi-heart-fill' : 'bi bi-heart';
    if (btn) {
        btn.style.color       = state.nurFavoriten ? 'var(--urlaub-accent)' : '';
        btn.style.borderColor = state.nurFavoriten ? 'var(--urlaub-accent)' : '';
    }
    const hinweis = document.getElementById('fav-filter-hinweis');
    if (hinweis) hinweis.classList.toggle('d-none', FAVORITEN.anzahl() === 0 && !state.nurFavoriten);
    renderHotels();
}

function favoritenToggle(id, btn) {
    const hinzugefuegt = FAVORITEN.toggle(id);
    btn.classList.toggle('aktiv', hinzugefuegt);
    btn.querySelector('i').className = hinzugefuegt ? 'bi bi-heart-fill' : 'bi bi-heart';
    btn.title = hinzugefuegt ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen';
    favoritenAnzahlUpdate();
    offcanvasFavUpdate();
    if (state.nurFavoriten) renderHotels();
}

function renderHotels() {
    const container = document.getElementById('hotels-liste');
    const suche     = document.getElementById('hotel-suche').value.toLowerCase();
    const minSterne = Number(document.getElementById('hotel-sterne-filter').value);
    const sortOpt   = document.getElementById('hotel-sort').value;

    let liste = state.hotels.filter(h => {
        const treffer = !suche ||
            h.name.toLowerCase().includes(suche) ||
            h.stadt.toLowerCase().includes(suche) ||
            h.land.toLowerCase().includes(suche);
        return treffer && h.sterne >= minSterne;
    });

    if (state.nurFavoriten) {
        const favs = FAVORITEN.get();
        liste = liste.filter(h => favs.includes(String(h._id)));
    }

    if (sortOpt === 'name')        liste.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOpt === 'preis-asc')   liste.sort((a, b) => a.preisProNacht - b.preisProNacht);
    if (sortOpt === 'preis-desc')  liste.sort((a, b) => b.preisProNacht - a.preisProNacht);
    if (sortOpt === 'sterne-desc') liste.sort((a, b) => b.sterne - a.sterne);

    if (liste.length === 0) {
        const msg = state.nurFavoriten
            ? 'Noch keine Favoriten gespeichert'
            : 'Keine Hotels gefunden';
        const icon = state.nurFavoriten ? 'heart' : 'search';
        container.innerHTML = emptyState(msg, icon);
        return;
    }

    container.innerHTML = liste.map(h => {
        const avg    = avgBewertung(h._id, h.name);
        const avgBadge = avg
            ? `<span class="badge bg-warning text-white">★ ${avg.avg.toFixed(1)} (${avg.anzahl})</span>`
            : '<span class="badge bg-secondary">Neu</span>';
        const imgSrc = h.bildUrl || PLACEHOLDER(h.name);
        const ausstattungPreview = (h.ausstattung || []).slice(0, 3);
        const ausstattungRest    = (h.ausstattung || []).length - ausstattungPreview.length;
        const isFav = FAVORITEN.hat(h._id);
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 detail-karte" onclick="zeigeHotelDetail('${h._id}')">
                    <div class="detail-karte-overlay"><i class="bi bi-zoom-in"></i> Details anzeigen</div>
                    <button class="fav-btn ${isFav ? 'aktiv' : ''}"
                            onclick="event.stopPropagation(); favoritenToggle('${h._id}', this)"
                            title="${isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}">
                        <i class="bi bi-heart${isFav ? '-fill' : ''}"></i>
                    </button>
                    <img src="${imgSrc}" class="card-img-top" style="height:200px;object-fit:cover"
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
                            ${ausstattungPreview.map(a => `<span class="badge bg-secondary me-1">${a}</span>`).join('')}
                            ${ausstattungRest > 0 ? `<span class="badge bg-light text-dark border">+${ausstattungRest}</span>` : ''}
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="preis">${h.preisProNacht} € <small class="text-muted fs-6">/ Nacht</small></span>
                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); zeigeHotelDetail('${h._id}')">
                                <i class="bi bi-info-circle"></i> Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function buildCarousel(bilder, id, altText, maxHeight = '380px') {
    if (bilder.length <= 1) {
        return `<img src="${bilder[0]}" class="w-100" style="max-height:${maxHeight};object-fit:cover" alt="${altText}"
                     onerror="this.onerror=null; this.src='${bilder[0]}'">`;
    }
    const indicators = bilder.map((_, i) =>
        `<button type="button" data-bs-target="#${id}" data-bs-slide-to="${i}"
                 ${i === 0 ? 'class="active" aria-current="true"' : ''}></button>`
    ).join('');
    const items = bilder.map((url, i) =>
        `<div class="carousel-item ${i === 0 ? 'active' : ''}">
            <img src="${url}" class="d-block w-100" style="max-height:${maxHeight};object-fit:cover" alt="${altText}">
         </div>`
    ).join('');
    return `
        <div id="${id}" class="carousel slide" data-bs-ride="false">
            <div class="carousel-indicators">${indicators}</div>
            <div class="carousel-inner">${items}</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
            </button>
        </div>`;
}

async function zeigeHotelDetail(hotelId) {
    const hotel = state.hotels.find(h => h._id === hotelId);
    if (!hotel) return;

    document.getElementById('detail-hotel-name').textContent = hotel.name;
    const body = document.getElementById('modal-hotel-detail-body');
    const avg = avgBewertung(hotel._id, hotel.name);

    const hotelBilder = [];
    if (hotel.bildUrl) hotelBilder.push(...hotel.bildUrl.split(',').map(u => u.trim()).filter(Boolean));
    if (Array.isArray(hotel.bilder)) hotelBilder.push(...hotel.bilder.filter(Boolean));
    if (hotelBilder.length === 0) hotelBilder.push(PLACEHOLDER(hotel.name));

    // Review-Button im Footer zeigen/verstecken
    const reviewBtn = document.getElementById('detail-review-btn');
    if (reviewBtn) {
        if (AUTH.darfBewertenSchreiben()) {
            reviewBtn.classList.remove('d-none');
            reviewBtn.onclick = () => bewertungVonDetailOeffnen(hotel._id, hotel.name);
        } else {
            reviewBtn.classList.add('d-none');
        }
    }

    body.innerHTML = `
        ${buildCarousel(hotelBilder, 'carousel-hotel-' + hotel._id, hotel.name)}
        <div class="p-4">
            <div class="row g-4">
                <div class="col-md-8">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span class="sterne fs-4">${sterneAnzeige(hotel.sterne)}</span>
                        ${avg
                            ? `<span class="badge bg-warning text-white fs-6">★ ${avg.avg.toFixed(1)} (${avg.anzahl} ${avg.anzahl === 1 ? 'Bewertung' : 'Bewertungen'})</span>`
                            : '<span class="badge bg-secondary">Noch keine Bewertungen</span>'}
                    </div>
                    <p class="mb-3"><i class="bi bi-geo-alt-fill text-danger"></i> <strong>${hotel.stadt}</strong>, ${hotel.land}</p>
                    <h6 class="fw-bold border-bottom pb-2">Beschreibung</h6>
                    <p class="mb-4">${hotel.beschreibung}</p>
                    ${(hotel.ausstattung || []).length > 0 ? `
                        <h6 class="fw-bold border-bottom pb-2">Ausstattung</h6>
                        <div class="mb-2">
                            ${hotel.ausstattung.map(a => `<span class="badge bg-secondary me-1 mb-1 p-2"><i class="bi bi-check2"></i> ${a}</span>`).join('')}
                        </div>` : ''}
                </div>
                <div class="col-md-4">
                    <div class="card border-primary shadow-sm">
                        <div class="card-body text-center p-4">
                            <p class="text-muted mb-1 small">Preis ab</p>
                            <h2 class="text-primary mb-0">${hotel.preisProNacht} €</h2>
                            <p class="text-muted small mb-3">pro Nacht</p>
                            <hr>
                            <div class="text-start small">
                                <p class="mb-1"><i class="bi bi-building"></i> ${hotel.sterne}-Sterne-Hotel</p>
                                <p class="mb-0"><i class="bi bi-geo-alt"></i> ${hotel.stadt}, ${hotel.land}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr class="my-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-chat-left-quote"></i> Gästebewertungen</h6>
            <div id="detail-hotel-bewertungen">
                <div class="text-center py-2">
                    <div class="spinner-border spinner-border-sm text-primary"></div>
                    <span class="ms-2 text-muted">Lade Bewertungen...</span>
                </div>
            </div>
        </div>
    `;

    new bootstrap.Modal(document.getElementById('modal-hotel-detail')).show();

    try {
        const res = await fetch(`${API.bewertungen}/hotel/${hotelId}`);
        let bews = res.ok ? await res.json() : [];
        if (!Array.isArray(bews) || bews.length === 0) {
            bews = state.bewertungen.filter(b =>
                String(b.hotelId) === String(hotelId) || b.hotelName === hotel.name
            );
        }
        const listeEl = document.getElementById('detail-hotel-bewertungen');
        if (!listeEl) return;
        if (bews.length === 0) {
            listeEl.innerHTML = '<p class="text-muted">Noch keine Bewertungen für dieses Hotel.</p>';
            return;
        }
        listeEl.innerHTML = bews.map(b => `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong><i class="bi bi-person-circle"></i> ${b.autor}</strong>
                        <span class="sterne">${sterneAnzeige(b.sterne)}</span>
                    </div>
                    <p class="mt-2 mb-1">"${b.kommentar}"</p>
                    <small class="text-muted"><i class="bi bi-calendar3"></i> ${new Date(b.datum).toLocaleDateString('de-DE')}</small>
                </div>
            </div>
        `).join('');
    } catch (err) {
        const listeEl = document.getElementById('detail-hotel-bewertungen');
        if (listeEl) listeEl.innerHTML = '<div class="alert alert-warning small">Bewertungen konnten nicht geladen werden.</div>';
    }
}

function zeigeMietwagenDetail(wagenId) {
    const wagen = state.mietwagen.find(w => w._id === wagenId);
    if (!wagen) return;

    document.getElementById('detail-mietwagen-name').textContent = `${wagen.marke} ${wagen.modell}`;
    const body = document.getElementById('modal-mietwagen-detail-body');
    const wagenBilder = [];
    if (wagen.bildUrl) wagenBilder.push(...wagen.bildUrl.split(',').map(u => u.trim()).filter(Boolean));
    if (Array.isArray(wagen.bilder)) wagenBilder.push(...wagen.bilder.filter(Boolean));
    if (wagenBilder.length === 0) wagenBilder.push(PLACEHOLDER(`${wagen.marke} ${wagen.modell}`, 'ff7e5f'));
    const verfuegbar = wagen.verfuegbar !== false;
    const verfuegbarBadge = verfuegbar
        ? '<span class="badge bg-success fs-6"><i class="bi bi-check-circle"></i> Verfügbar</span>'
        : '<span class="badge bg-danger fs-6"><i class="bi bi-x-circle"></i> Ausgebucht</span>';

    body.innerHTML = `
        ${buildCarousel(wagenBilder, 'carousel-mw-' + wagen._id, wagen.marke + ' ' + wagen.modell, '320px')}
        <div class="p-4">
            <div class="row g-4">
                <div class="col-md-7">
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        <span class="badge bg-primary fs-6">${wagen.kategorie}</span>
                        ${verfuegbarBadge}
                    </div>
                    <p class="mb-3"><i class="bi bi-geo-alt-fill text-danger"></i> <strong>${wagen.standort}</strong></p>
                    <h6 class="fw-bold border-bottom pb-2">Fahrzeugdetails</h6>
                    <table class="table table-sm table-borderless">
                        <tbody>
                            <tr>
                                <th class="text-muted" style="width:45%"><i class="bi bi-gear"></i> Getriebe</th>
                                <td>${wagen.getriebe}</td>
                            </tr>
                            <tr>
                                <th class="text-muted"><i class="bi bi-fuel-pump"></i> Kraftstoff</th>
                                <td>${wagen.kraftstoff}</td>
                            </tr>
                            <tr>
                                <th class="text-muted"><i class="bi bi-people"></i> Sitzplätze</th>
                                <td>${wagen.sitzplaetze}</td>
                            </tr>
                            <tr>
                                <th class="text-muted"><i class="bi bi-tag"></i> Kategorie</th>
                                <td>${wagen.kategorie}</td>
                            </tr>
                            <tr>
                                <th class="text-muted"><i class="bi bi-geo-alt"></i> Abholort</th>
                                <td>${wagen.standort}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-md-5">
                    <div class="card shadow-sm" style="border-color:#ff7e5f">
                        <div class="card-body text-center p-4">
                            <p class="text-muted mb-1 small">Preis ab</p>
                            <h2 style="color:#ff7e5f" class="mb-0">${wagen.preisProTag.toFixed(2)} €</h2>
                            <p class="text-muted small mb-3">pro Tag</p>
                            <hr>
                            <div class="mb-2">${verfuegbarBadge}</div>
                            <p class="small text-muted mt-2 mb-0">${wagen.marke} ${wagen.modell}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    new bootstrap.Modal(document.getElementById('modal-mietwagen-detail')).show();
}

async function zeigeHotelBewertungen(hotelId, hotelName) {
    document.getElementById('modal-hotel-name').textContent = hotelName;
    const body = document.getElementById('modal-bewertungen-body');
    body.innerHTML = '<div class="text-center"><div class="spinner-border text-primary"></div></div>';
    new bootstrap.Modal(document.getElementById('modal-hotel-bewertungen')).show();

    try {
        const res = await fetch(`${API.bewertungen}/hotel/${hotelId}`);
        let bewertungen = res.ok ? await res.json() : [];
        if (bewertungen.length === 0) {
            bewertungen = state.bewertungen.filter(b => b.hotelName === hotelName);
        }
        if (bewertungen.length === 0) {
            body.innerHTML = '<p class="text-center text-muted">Noch keine Bewertungen für dieses Hotel.</p>';
            return;
        }
        body.innerHTML = bewertungen.map(b => `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <strong>${b.autor}</strong>
                        <span class="sterne">${sterneAnzeige(b.sterne)}</span>
                    </div>
                    <p class="mt-2 mb-1">"${b.kommentar}"</p>
                    <small class="text-muted">${new Date(b.datum).toLocaleDateString('de-DE')}</small>
                </div>
            </div>
        `).join('');
    } catch (err) {
        body.innerHTML = `<div class="alert alert-danger">Fehler: ${err.message}</div>`;
    }
}

// ========== FLÜGE ==========
async function ladeFluege() {
    try {
        state.fluege = await fetch(API.fluege).then(r => r.json());
        renderFluege();
    } catch (err) {
        document.getElementById('fluege-liste').innerHTML =
            `<tr><td colspan="8"><div class="alert alert-danger mb-0">Fehler: ${err.message}</div></td></tr>`;
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
            <td><strong>${f.flugnummer}</strong></td>
            <td>${f.airline}</td>
            <td class="flug-route">${f.abflughafen} <span class="flug-route-pfeil">→</span> ${f.zielflughafen}</td>
            <td>${new Date(f.abflugzeit).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td>${new Date(f.ankunftszeit).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td><span class="flug-dauer-badge"><i class="bi bi-clock"></i> ${flugdauer(f.abflugzeit, f.ankunftszeit)}</span></td>
            <td><span class="badge bg-info">${f.klasse}</span></td>
            <td class="preis">${f.preis.toFixed(2)} €</td>
        </tr>
    `).join('');
}

// ========== MIETWAGEN ==========
async function ladeMietwagen() {
    const container = document.getElementById('mietwagen-liste');
    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Lade Mietwagen...</p></div>';
    try {
        const res = await fetch(API.mietwagen);
        if (!res.ok) throw new Error(`HTTP ${res.status} – Server antwortet mit Fehler`);
        state.mietwagen = await res.json();
        renderMietwagen();
    } catch (err) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Mietwagen-Server nicht erreichbar</strong><br>
                    <span class="small">${err.message}</span><br>
                    <span class="small text-muted">Stelle sicher, dass der Mietwagen-Server auf Port 3004 läuft.</span>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-danger" onclick="ladeMietwagen()">
                            <i class="bi bi-arrow-clockwise"></i> Erneut versuchen
                        </button>
                    </div>
                </div>
            </div>`;
    }
}

function mietwagenFavAnzahlUpdate() {
    const n = FAVORITEN_MIETWAGEN.anzahl();
    const el = document.getElementById('mw-fav-anzahl');
    if (el) el.textContent = n;
    const hinweis = document.getElementById('mw-fav-filter-hinweis');
    if (hinweis) hinweis.classList.toggle('d-none', n === 0 && !state.nurMietwagenFavoriten);
}

function nurMietwagenFavoritenToggle() {
    state.nurMietwagenFavoriten = !state.nurMietwagenFavoriten;
    const btn  = document.getElementById('mw-fav-filter-btn');
    const icon = document.getElementById('mw-fav-filter-icon');
    if (btn)  btn.classList.toggle('aktiv-fav', state.nurMietwagenFavoriten);
    if (icon) icon.className = state.nurMietwagenFavoriten ? 'bi bi-heart-fill' : 'bi bi-heart';
    if (btn) {
        btn.style.color       = state.nurMietwagenFavoriten ? 'var(--urlaub-accent)' : '';
        btn.style.borderColor = state.nurMietwagenFavoriten ? 'var(--urlaub-accent)' : '';
    }
    const hinweis = document.getElementById('mw-fav-filter-hinweis');
    if (hinweis) hinweis.classList.toggle('d-none', FAVORITEN_MIETWAGEN.anzahl() === 0 && !state.nurMietwagenFavoriten);
    renderMietwagen();
}

function mietwagenFavoritenToggle(id, btn) {
    const hinzugefuegt = FAVORITEN_MIETWAGEN.toggle(id);
    btn.classList.toggle('aktiv', hinzugefuegt);
    btn.querySelector('i').className = hinzugefuegt ? 'bi bi-heart-fill' : 'bi bi-heart';
    btn.title = hinzugefuegt ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen';
    mietwagenFavAnzahlUpdate();
    offcanvasFavUpdate();
    if (state.nurMietwagenFavoriten) renderMietwagen();
}

function renderMietwagen() {
    const container = document.getElementById('mietwagen-liste');
    const suche     = document.getElementById('mietwagen-suche').value.toLowerCase();
    const kat       = document.getElementById('mietwagen-kategorie-filter').value;
    const sortOpt   = document.getElementById('mietwagen-sort').value;

    let liste = state.mietwagen.filter(w => {
        const treffer = !suche ||
            w.marke.toLowerCase().includes(suche) ||
            w.modell.toLowerCase().includes(suche) ||
            w.standort.toLowerCase().includes(suche);
        const katTreffer = !kat || w.kategorie === kat;
        return treffer && katTreffer;
    });

    if (state.nurMietwagenFavoriten) {
        const favs = FAVORITEN_MIETWAGEN.get();
        liste = liste.filter(w => favs.includes(String(w._id)));
    }

    if (sortOpt === 'preis-asc')  liste.sort((a, b) => a.preisProTag - b.preisProTag);
    if (sortOpt === 'preis-desc') liste.sort((a, b) => b.preisProTag - a.preisProTag);
    if (sortOpt === 'marke')      liste.sort((a, b) => a.marke.localeCompare(b.marke));

    if (liste.length === 0) {
        const msg  = state.nurMietwagenFavoriten ? 'Noch keine Mietwagen-Favoriten' : 'Keine Mietwagen gefunden';
        const icon = state.nurMietwagenFavoriten ? 'heart' : 'car-front';
        container.innerHTML = emptyState(msg, icon);
        return;
    }

    container.innerHTML = liste.map(w => {
        const imgSrc    = w.bildUrl || PLACEHOLDER(`${w.marke} ${w.modell}`, 'D97B5E');
        const verfuegbar = w.verfuegbar !== false;
        const isFav     = FAVORITEN_MIETWAGEN.hat(w._id);
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 detail-karte" onclick="zeigeMietwagenDetail('${w._id}')">
                    <div class="detail-karte-overlay"><i class="bi bi-zoom-in"></i> Details anzeigen</div>
                    <button class="fav-btn ${isFav ? 'aktiv' : ''}"
                            onclick="event.stopPropagation(); mietwagenFavoritenToggle('${w._id}', this)"
                            title="${isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}">
                        <i class="bi bi-heart${isFav ? '-fill' : ''}"></i>
                    </button>
                    <img src="${imgSrc}" class="card-img-top" style="height:200px;object-fit:cover"
                         alt="${w.marke} ${w.modell}"
                         onerror="this.onerror=null; this.src='${PLACEHOLDER(w.marke + ' ' + w.modell, 'D97B5E')}'">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <h5 class="card-title mb-0">${w.marke} ${w.modell}</h5>
                            ${verfuegbar ? '<span class="badge bg-success">Verfügbar</span>' : '<span class="badge bg-danger">Ausgebucht</span>'}
                        </div>
                        <span class="badge bg-primary mb-2 align-self-start">${w.kategorie}</span>
                        <p class="text-muted small mb-1"><i class="bi bi-geo-alt"></i> ${w.standort}</p>
                        <ul class="list-unstyled small mb-2 flex-grow-1">
                            <li><i class="bi bi-gear"></i> ${w.getriebe}</li>
                            <li><i class="bi bi-fuel-pump"></i> ${w.kraftstoff}</li>
                            <li><i class="bi bi-people"></i> ${w.sitzplaetze} Sitzplätze</li>
                        </ul>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="preis">${w.preisProTag.toFixed(2)} € <small class="text-muted fs-6">/ Tag</small></span>
                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); zeigeMietwagenDetail('${w._id}')">
                                <i class="bi bi-info-circle"></i> Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// nach dem Absenden Bewertungen im State aktualisieren (für Hotel-Durchschnitte)
async function aktualisiereBewertungenState() {
    try {
        const res = await fetch(API.bewertungen);
        if (res.ok) state.bewertungen = await res.json();
    } catch (_) {}
    renderHotels();
}

// ========== BEWERTUNG SCHREIBEN (für eingeloggte User/Admin) ==========
function bewertungVonDetailOeffnen(hotelId, hotelName) {
    bootstrap.Modal.getInstance(document.getElementById('modal-hotel-detail'))?.hide();
    setTimeout(() => {
        bewertungSchreibenOeffnen();
        setTimeout(() => {
            const sel = document.getElementById('schreib-hotel-select');
            if (sel && hotelId) {
                const opt = sel.querySelector(`option[value="${hotelId}"]`);
                if (opt) sel.value = hotelId;
            }
        }, 60);
    }, 350);
}

function bewertungSchreibenOeffnen() {
    if (!AUTH.darfBewertenSchreiben()) {
        alert('Du musst eingeloggt sein, um Bewertungen schreiben zu können.');
        window.location.href = '../login.html';
        return;
    }

    // Hotel-Dropdown füllen
    const sel = document.getElementById('schreib-hotel-select');
    sel.innerHTML = '<option value="">-- Hotel auswählen --</option>' +
        state.hotels.map(h =>
            `<option value="${h._id}" data-name="${h.name}">${h.name} (${h.stadt})</option>`
        ).join('');

    // Felder zurücksetzen
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

    if (!hotelId) {
        fehlerBox.textContent = 'Bitte wähle ein Hotel aus.';
        fehlerBox.classList.remove('d-none');
        return;
    }
    if (!kommentar) {
        fehlerBox.textContent = 'Bitte schreibe einen Kommentar.';
        fehlerBox.classList.remove('d-none');
        return;
    }

    const session = AUTH.getSession();
    const daten = {
        hotelId,
        hotelName,
        autor: session.anzeigeName,
        sterne,
        kommentar
    };

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
        state.bewertungen = [];
        aktualisiereBewertungenState();
    } catch (err) {
        fehlerBox.textContent = 'Fehler: ' + err.message;
        fehlerBox.classList.remove('d-none');
    }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    themeInit();
    userBarRender();
    rechteAnwenden();
    backToAdminInit();

    favoritenAnzahlUpdate();
    mietwagenFavAnzahlUpdate();

    ladeHotels();
    ladeFluege();
    ladeMietwagen();

    ['hotel-suche', 'hotel-sterne-filter', 'hotel-sort'].forEach(id =>
        document.getElementById(id).addEventListener('input', renderHotels));
    ['flug-suche', 'flug-datum-von', 'flug-datum-bis', 'flug-sort'].forEach(id =>
        document.getElementById(id).addEventListener('input', renderFluege));
    ['mietwagen-suche', 'mietwagen-kategorie-filter', 'mietwagen-sort'].forEach(id =>
        document.getElementById(id).addEventListener('input', renderMietwagen));
});
