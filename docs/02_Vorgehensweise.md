# Vorgehensweise — Mein Urlaub

**Modul:** Verteilte Systeme · DHBW Heilbronn · SoSe 2026

---

## 1. Projektplanung

### Aufgabenstellung
Ziel war die Entwicklung einer Webanwendung nach dem **Microservice-Prinzip**: Mehrere unabhängige Backend-Services sollen von einem gemeinsamen Frontend konsumiert werden. Die Anwendung soll CRUD-Operationen, eine sinnvolle Nutzertrennung (Admin/User/Gast) sowie ein ansprechendes UI aufweisen.

### Gewähltes Thema: Urlaubsbuchungsplattform
Das Thema „Mein Urlaub" wurde gewählt, weil es natürlich mehrere unabhängige Domänen hat (Hotels, Flüge, Mietwagen, Bewertungen), die sich als eigenständige Microservices umsetzen lassen, ohne dass zwischen ihnen eine harte Abhängigkeit im Backend entsteht.

---

## 2. Entwicklungsphasen

### Phase 1 — Backend-Grundgerüst
**Ziel:** Alle vier Services laufen lokal und liefern valide REST-Antworten.

- Express-Projekte pro Service angelegt (`npm init`)
- Mongoose-Schemas definiert (Validierung, Typen, Defaults)
- CRUD-Router implementiert (einheitliches Muster für alle Services)
- CORS aktiviert für Frontend-Zugriff
- Seed-Skripte geschrieben (`seed.js`) mit realistischen Beispieldaten
- `npm start` pro Service konfiguriert

### Phase 2 — Frontend-Grundstruktur
**Ziel:** Daten der Services werden im Browser dargestellt.

- Bootstrap 5 als CSS-Framework gewählt (responsive, komponentenreich)
- `shared.css` für gemeinsames Design angelegt
- Login-Seite mit einfachem Authentifizierungskonzept (`auth.js`)
- User-Frontend: Tab-Navigation (Hotels / Flüge / Mietwagen)
- Admin-Panel: Tab-Navigation mit CRUD-Tabellen

### Phase 3 — CRUD & Admin-Panel
**Ziel:** Admin kann alle Ressourcen verwalten.

- Modal-basierte Formulare für Erstellen/Bearbeiten
- Inline-Validierung auf Frontend-Seite
- Bestätigungs-Modal statt Browser-`confirm()` für Löschvorgänge
- Toast-Benachrichtigungen bei Erfolg/Fehler
- Sortierbare Tabellen (Klick auf Spaltenköpfe)
- Dashboard mit Statistik-Karten und Top-Hotel-Liste

### Phase 4 — UX & Design-Verbesserungen
**Ziel:** Ansprechendes, konsistentes Design; bessere Nutzererfahrung.

- Design-System „Riviera Luxe" entwickelt (CSS Custom Properties, Google Fonts)
- Hero-Section mit animierter SVG-Palme und -Sonne
- Dark / Light Mode (localStorage-persistent)
- Offcanvas-Burger-Menü für eingeloggte User
- Favoritensystem für Hotels und Mietwagen (pro Nutzer isoliert)
- Karussell-Galerie für mehrere Bilder pro Hotel/Mietwagen
- Flug-Tabelle mit `white-space: nowrap` für korrektes Layout

### Phase 5 — Erweiterte Funktionen
**Ziel:** Vollständiges Feature-Set für Abgabe.

- Registrierungssystem (`localStorage`-basiert, kein Backend nötig)
- Demo-Konten entfernt (Credentials nicht mehr im Quellcode)
- Server-Status-Dashboard mit Live-Checks und Auto-Refresh (60 s)
- „Bewertung schreiben" direkt aus Hotel-Detail-Modal heraus
- Bewertungen im Admin: bewusst auf **Löschen** beschränkt — Admin darf keine Bewertungen erstellen oder manipulieren (Integrität der Nutzerbewertungen)
- Impressum & Über uns auf allen drei Seiten (Footer + Modals)

### Phase 6 — Dokumentation & Deployment
**Ziel:** Vollständige Dokumentation; GitHub-Hosting vorbereitet.

- `README.md` mit vollständiger Feature-Liste, Startanleitung, API-Übersicht
- Architektur-, Benutzerhandbuch-, Vorgehensweise- und Hosting-Dokumentation
- `docker-compose.yml` für lokalen Container-Start aller Services
- GitHub Pages Deployment des Frontends vorbereitet

---

## 3. Technische Entscheidungen

### Warum vier separate Services?
Jeder Service hat eine eigene MongoDB-Datenbank und läuft auf einem eigenen Port. Das entspricht dem Microservice-Prinzip: **lose Kopplung, hohe Kohäsion**. Ein Service-Ausfall beeinträchtigt die anderen nicht direkt.

### Warum keine Service-zu-Service-Kommunikation im Backend?
Die Bewertungen referenzieren Hotels nur per `hotelId` (als String, kein MongoDB-`$lookup`). Die Aggregation (z. B. Durchschnittsbewertung pro Hotel) übernimmt das **Frontend** durch parallele API-Aufrufe mit `Promise.all()`. Das vereinfacht das Backend erheblich.

### Warum Vanilla JS statt React/Vue?
- Keine Build-Pipeline erforderlich → direktes Öffnen im Browser / Live Server
- Keine Node-Abhängigkeit im Frontend → einfacher GitHub Pages Deployment
- Ausreichend für die Projektanforderungen

### Warum localStorage-Authentifizierung?
Da das Frontend auf GitHub Pages (statisch) gehostet wird, ist kein Backend für Auth verfügbar. Die Implementierung demonstriert das Konzept von Rollen, Sessions und Registrierung — mit explizitem Hinweis, dass sie nicht produktionsreif ist.

### Warum Bootstrap 5?
- Responsive Grid ohne eigenes CSS-Framework-Schreiben
- Vorgefertigte Komponenten: Modal, Toast, Offcanvas, Carousel, Tabs
- Bootstrap Icons als konsistentes Icon-Set
- Dark Mode über `data-bs-theme`-Attribut unterstützt

---

## 4. Herausforderungen & Lösungen

| Herausforderung | Lösung |
|-----------------|--------|
| Flug-Tabelle: Zellen umbrechen | `white-space: nowrap` in `.table-clean` |
| Dark Mode überschreibt Gradient-Karten | `!important` auf `background` in `.stat-bg-*` |
| `rechteAnwenden()` crasht nach Entfernen des Bewertungs-Tabs | Funktion auf leeren Stub reduziert |
| Favoriten über Accounts geteilt | localStorage-Key mit `_${username}` suffixed |
| Emojis wirken unelegant im Hero | SVG-basierte animierte Palme und Sonne erstellt |
| Admin kann Bewertungen manipulieren | Edit/Create-Buttons entfernt, nur Löschen übrig |

---

## 5. Projektstruktur (Endstand)

```
mein-urlaub/
├── README.md
├── package.json              ← Root: concurrently für parallelen Start
├── docker-compose.yml
├── docs/
│   ├── 01_Architektur.md
│   ├── 02_Vorgehensweise.md
│   ├── 03_Benutzerhandbuch.md
│   └── 04_Hosting-Vorschlag.md
├── frontend/
│   ├── login.html
│   ├── shared.css
│   ├── auth.js
│   ├── user/
│   │   ├── index.html
│   │   └── app.js
│   └── admin/
│       ├── index.html
│       └── app.js
└── backend/
    ├── bewertungs-server/    ← Port 3001
    ├── hotel-server/         ← Port 3002
    ├── flugverbindung-server/← Port 3003
    └── mietwagen-server/     ← Port 3004
```
