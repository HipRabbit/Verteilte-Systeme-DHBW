# Mein Urlaub - Verteiltes System

Gruppenarbeit DHBW Heilbronn - Verteilte Systeme

## Projektstruktur

```
mein-urlaub/
├── backend/
│   ├── bewertungs-server/        Port 3001
│   ├── hotel-server/             Port 3002
│   ├── flugverbindung-server/    Port 3003
│   └── mietwagen-server/         Port 3004
├── frontend/
│   ├── login.html                Einstiegsseite mit Login + Gast-Modus
│   ├── auth.js                   Auth-Modul (Demo-Konten)
│   ├── shared.css                Gemeinsames Farbschema
│   ├── admin/                    Admin-Panel (offen erreichbar)
│   └── user/                     User-Ansicht
├── docs/                         Dokumentation
├── docker-compose.yml            Container-Setup
└── package.json                  Root-Skripte (concurrently)
```

## Voraussetzungen

- Node.js 18+
- MongoDB lokal (Port 27017) oder MongoDB Atlas oder Docker

## Startmöglichkeiten

### Variante A: Alles mit einem Befehl

```bash
npm run install:all    # Dependencies aller Services
npm run seed:all       # Beispieldaten einfügen (einmalig)
npm start              # alle 4 Services parallel
```

### Variante B: Jeder Service einzeln

```bash
# In je einem Terminal (PowerShell-Nutzer: ; statt &&):
cd backend/bewertungs-server; npm install; node seed.js; npm start
cd backend/hotel-server; npm install; node seed.js; npm start
cd backend/flugverbindung-server; npm install; node seed.js; npm start
cd backend/mietwagen-server; npm install; node seed.js; npm start
```

### Variante C: Docker Compose

```bash
docker compose up --build
```

## Frontend öffnen

**Einstieg: `frontend/login.html`** mit der "Live Server"-Extension in VS Code öffnen.

- **Als Gast fortfahren** → User-Ansicht (Read-Only, keine Bewertungen schreiben)
- **Anmelden als User** → User-Ansicht mit "Bewertung schreiben"-Funktion
- **Admin-Bereich** ist über den Link oben rechts auf der Login-Seite erreichbar oder direkt unter `frontend/admin/index.html`

### Demo-User-Konten (für Bewertungs-Schreibrecht)

| Benutzer | Passwort   |
|----------|------------|
| `maria`  | `maria123` |
| `thomas` | `thomas123`|

Auf der Login-Seite kann man auf die Konten klicken, um sie ins Formular zu übernehmen.

## Wichtige Hinweise

- **127.0.0.1 statt localhost:** Im Frontend-Code wird `127.0.0.1` verwendet, das vermeidet Windows-DNS-Lookup-Verzögerungen
- **Lazy Loading:** Tabs in beiden Frontends laden Daten erst beim ersten Öffnen
- **Cache:** Daten werden zwischengespeichert und nach Änderungen im Admin invalidiert
- **Persistenz:** Daten bleiben in MongoDB erhalten. `node seed.js` löscht und ersetzt sie aber

## Features

### User-Frontend
- Hero mit Urlaubs-Farbschema (Türkis/Koralle/Sand)
- Suche, Filter, Sortierung pro Tab
- **Detail-Modal** für Hotels und Mietwagen mit Bilder-Galerie (Carousel), langer Beschreibung, Highlights, Bewertungen
- Sterne-Filter im Bewertungs-Tab
- Datum-Filter und automatische Flugdauer-Berechnung
- Login/Gast-Modus, "Bewertung schreiben" für eingeloggte User
- Dark Mode (persistent)
- Back-to-Admin-Button wenn aus Admin-Panel gekommen

### Admin-Frontend
- Dashboard mit Statistiken (Top-Hotels, neueste Bewertungen)
- Server-Status-Tab mit Live-Healthcheck
- Sortierbare Tabellen
- Erweiterte Modals mit Tabs (Basis / Details / Bilder & Highlights)
- Hotel-Dropdown bei Bewertungen (cross-service)
- Bestätigungs-Modal statt Browser-Confirm

### Backend
- 4 unabhängige Microservices, einheitliches REST/CRUD-Muster
- Erweiterte Schemas für Hotels (Adresse, Webseite, Bilder-Array, Highlights, lange Beschreibung)
- Erweiterte Schemas für Mietwagen (Bilder-Array, lange Beschreibung, Konditionen)
- Rückwärtskompatibel zur alten Datenstruktur
- CORS aktiviert, Heroku-ready, Docker-ready

## API-Endpoints (identisch pro Service)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET     | `/api/{ressource}`      | Alle lesen |
| GET     | `/api/{ressource}/:id`  | Einzeln lesen |
| POST    | `/api/{ressource}`      | Neu erstellen |
| PUT     | `/api/{ressource}/:id`  | Aktualisieren |
| DELETE  | `/api/{ressource}/:id`  | Löschen |

Zusatz: `GET /api/bewertungen/hotel/:hotelId`

## Bekannte Stolperfallen

- **PowerShell `&&`-Fehler:** Nutze `;` statt `&&` (PowerShell 5.x unterstützt `&&` nicht)
- **PowerShell-Skripte blockiert:** `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
- **CORS-Fehler im Browser:** HTML-Datei nicht per Doppelklick (`file://`) öffnen, sondern mit Live Server (`http://`)
- **Schleppendes Laden:** Wenn ein Backend-Server hängt (z.B. MongoDB-Verbindung weg), siehst du das im Browser-Network-Tab oder im Server-Status-Tab des Admin-Panels

## Deployment auf Heroku

Siehe `docs/04_Hosting-Vorschlag.docx`. Kurzfassung pro Service:

```bash
cd backend/hotel-server
heroku login
git init; git add .; git commit -m "Initial"
heroku create mein-urlaub-hotels
heroku config:set MONGODB_URI="mongodb+srv://..."
git push heroku main
```

Nach dem Deployment in `frontend/user/app.js` und `frontend/admin/app.js` die `API`-URLs auf die Heroku-Domains umstellen.
