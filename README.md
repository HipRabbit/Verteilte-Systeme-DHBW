# Mein Urlaub — Verteiltes System

Semesterprojekt DHBW Heilbronn · Modul: Verteilte Systeme

---

## Projektübersicht

**Mein Urlaub** ist eine vollständige Full-Stack-Demo-Applikation für Urlaubsbuchungen, bestehend aus vier unabhängigen Microservices (Node.js + Express + MongoDB) und einem gemeinsamen HTML/Bootstrap-Frontend.

```
mein-urlaub/
├── backend/
│   ├── bewertungs-server/   → Port 3001  (Bewertungen CRUD)
│   ├── hotel-server/        → Port 3002  (Hotels CRUD)
│   ├── flugverbindung-server/ → Port 3003 (Flüge CRUD)
│   └── mietwagen-server/    → Port 3004  (Mietwagen CRUD)
├── frontend/
│   ├── login.html           → Einstiegspunkt (Login + Registrierung)
│   ├── shared.css           → Gemeinsames Design-System „Riviera Luxe"
│   ├── auth.js              → localStorage-basierte Authentifizierung
│   ├── user/                → User-Ansicht
│   └── admin/               → Admin-Panel
├── docs/                    → Architektur- und Nutzerdokumentation
└── docker-compose.yml       → Optionaler Container-Start
```

---

## Voraussetzungen

- Node.js 18+ installiert
- MongoDB lokal (Port 27017) **oder** MongoDB Atlas **oder** Docker

---

## Starten

### Variante A: Alles mit einem Befehl (empfohlen)

```bash
npm run install:all    # einmalig: Dependencies aller Services installieren
npm run seed:all       # einmalig: Beispieldaten einfügen
npm start              # alle 4 Services parallel starten
```

Die Logs aller 4 Services werden farblich getrennt in einem Terminal ausgegeben.

### Variante B: Jeder Service einzeln

```bash
# Terminal 1
cd backend/bewertungs-server && npm install && node seed.js && npm start

# Terminal 2
cd backend/hotel-server && npm install && node seed.js && npm start

# Terminal 3
cd backend/flugverbindung-server && npm install && node seed.js && npm start

# Terminal 4
cd backend/mietwagen-server && npm install && node seed.js && npm start
```

> **PowerShell-Nutzer:** `;` statt `&&` verwenden.

### Variante C: Docker Compose

Startet automatisch auch MongoDB — kein lokales MongoDB nötig.

```bash
docker compose up --build
```

Zum Stoppen: `docker compose down`. Daten liegen im Volume `mongo-data` und bleiben erhalten.

---

## Frontend öffnen

**Einstiegspunkt: `frontend/login.html`**

Empfohlen: VS Code mit der **Live Server**-Extension → Rechtsklick auf `login.html` → „Open with Live Server".

### Authentifizierung

Das System verwendet eine localStorage-basierte Registrierung ohne Backend:

- **Registrieren**: Auf der Login-Seite „Registrieren" wählen → Name, Benutzername und Passwort eingeben
- **Erster Account**: Erhält automatisch **Admin-Rechte**
- **Weitere Accounts**: Erhalten die Rolle **User**
- **Als Gast fortfahren**: Keine Registrierung nötig — nur Lesezugriff, keine Bewertungen schreiben

> ⚠️ Hinweis: Passwörter werden im Klartext in `localStorage` gespeichert. Diese Implementierung ist ausschließlich für Demo-Zwecke geeignet. Für eine produktive Anwendung wäre ein Backend mit Passwort-Hashing (bcrypt) und JWT-Tokens erforderlich.

---

## Ports

| Service                  | Port |
|--------------------------|------|
| Bewertungs-Server        | 3001 |
| Hotel-Server             | 3002 |
| Flugverbindung-Server    | 3003 |
| Mietwagen-Server         | 3004 |
| Frontend (Live Server)   | 5500 |

---

## Features

### Frontend — User-Ansicht

| Feature | Beschreibung |
|---------|-------------|
| **Riviera Luxe Design** | Eigenes CSS-Design-System mit Luxury-Gradienten, Google Fonts, Dark Mode |
| **Dark / Light Mode** | Persistent via `localStorage`, Toggle in der Navbar |
| **Hero-Section** | Animierte SVG-Palme und -Sonne, organische SVG-Welle |
| **Hotels** | Karten mit Bewertungsdurchschnitt, Ausstattungs-Badges, Bildergalerie im Detail-Modal |
| **Flüge** | Tabellarische Ansicht mit Suche, Datumsfilter, Preissortierung |
| **Mietwagen** | Karten mit Kategorie, Verfügbarkeit, Bildergalerie im Detail-Modal |
| **Favoriten** | Herz-Button pro Hotel und Mietwagen; Filter „Nur Favoriten"; **pro Benutzer isoliert** |
| **Burger-Menü** | Offcanvas-Seitenleiste für eingeloggte User: Profil, Favoriten-Übersicht, Bewertung schreiben, Admin-Link |
| **Bewertung schreiben** | Per Offcanvas-Menü oder direkt aus dem Hotel-Detail-Modal (nur für eingeloggte Nutzer) |
| **Suchfelder & Filter** | Echtzeit-Filterung pro Tab |
| **Sortierung** | Nach Preis, Sterne, Name, Datum etc. |
| **Responsive** | Mobile-ready mit Bootstrap 5 Grid |
| **Impressum + Über uns** | In Footer-Buttons auf allen Seiten erreichbar |

### Frontend — Admin-Panel

| Feature | Beschreibung |
|---------|-------------|
| **Dashboard** | Statistik-Karten (Anzahl Hotels/Flüge/Mietwagen/Ø-Bewertung), Top-Hotels, neueste Bewertungen |
| **Server-Status** | Live-Check aller 4 Microservices mit Antwortzeit, Online/Offline-Indikator, Auto-Refresh alle 60 Sekunden |
| **Hotels CRUD** | Erstellen, Bearbeiten, Löschen inkl. Hauptbild + Bildergalerie (komma-getrennte URLs) |
| **Flüge CRUD** | Vollständiges CRUD mit Datum/Zeit-Feldern, Klasse, freien Plätzen |
| **Mietwagen CRUD** | Vollständiges CRUD inkl. Getriebe, Kraftstoff, Bildergalerie |
| **Bewertungen** | Nur Löschen — **bewusste Entscheidung**: Admin darf Nutzerbewertungen nicht erstellen/manipulieren (Integrität) |
| **Sortierbare Tabellen** | Klick auf Spaltenköpfe sortiert auf- und absteigend |
| **Dark / Light Mode** | Toggle in der Admin-Navbar |
| **Toast-Benachrichtigungen** | Erfolgsmeldungen bei CRUD-Aktionen |
| **Lösch-Bestätigung** | Bootstrap-Modal statt Browser-`confirm()` |
| **Impressum + Über uns** | Im Footer-Bereich erreichbar |

### Backend — Microservices

| Feature | Beschreibung |
|---------|-------------|
| **4 unabhängige Services** | Jeder Service eigenständig deploybar |
| **RESTful CRUD** | Einheitliches `GET / POST / PUT / DELETE`-Muster |
| **Mongoose-Schemas** | Validierung und Typsicherheit auf Datenbankebene |
| **CORS aktiviert** | Cross-Origin-Anfragen vom Frontend erlaubt |
| **Seed-Skripte** | Beispieldaten pro Service (`node seed.js`) |
| **Docker-ready** | `Dockerfile` pro Service |
| **Heroku-ready** | `Procfile` + `engines`-Feld in `package.json` |

---

## API-Endpoints

Alle Services folgen demselben Muster (`{ressource}` = `hotels`, `fluege`, `mietwagen`, `bewertungen`):

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| `GET`   | `/api/{ressource}`      | Alle Einträge laden |
| `GET`   | `/api/{ressource}/:id`  | Einzelnen Eintrag laden |
| `POST`  | `/api/{ressource}`      | Neuen Eintrag erstellen |
| `PUT`   | `/api/{ressource}/:id`  | Eintrag aktualisieren |
| `DELETE`| `/api/{ressource}/:id`  | Eintrag löschen |

**Zusatz-Endpoint (Bewertungs-Service):**
```
GET /api/bewertungen/hotel/:hotelId   → Alle Bewertungen für ein bestimmtes Hotel
```

---

## Deployment auf GitHub Pages (Frontend)

Da das Frontend rein statisch ist (HTML + CSS + JS), kann es direkt auf GitHub Pages gehostet werden.

1. Repository auf GitHub pushen
2. In den Repository-Einstellungen unter **Pages** → Branch `main`, Ordner `/frontend` (oder `/` mit korrekten Pfaden) wählen
3. Die Backend-URLs in `frontend/user/app.js` und `frontend/admin/app.js` auf die echten Server-Adressen anpassen:

```javascript
const API = {
    hotels:      'https://dein-hotel-server.example.com/api/hotels',
    fluege:      'https://dein-flug-server.example.com/api/fluege',
    mietwagen:   'https://dein-mietwagen-server.example.com/api/mietwagen',
    bewertungen: 'https://dein-bewertungs-server.example.com/api/bewertungen'
};
```

> ⚠️ Die Backends müssen HTTPS unterstützen (Mixed-Content-Blocker), wenn das Frontend über HTTPS ausgeliefert wird.

## Deployment Backend auf Heroku

Details in `docs/04_Hosting-Vorschlag.docx`. Kurzfassung:

```bash
cd backend/hotel-server
heroku login
git init && git add . && git commit -m "Initial"
heroku create mein-urlaub-hotels
heroku config:set MONGODB_URI="mongodb+srv://..."
git push heroku main
```

Gleichen Ablauf für die anderen 3 Services wiederholen.

---

## Technologie-Stack

| Bereich | Technologie |
|---------|------------|
| Frontend | HTML5, Bootstrap 5.3.2, Bootstrap Icons 1.11.1, Vanilla JavaScript |
| Fonts | Google Fonts: Cormorant Garamond + DM Sans |
| Backend | Node.js, Express.js |
| Datenbank | MongoDB + Mongoose |
| Authentifizierung | localStorage (Demo) |
| Containerisierung | Docker, Docker Compose |

---

*DHBW Heilbronn · Verteilte Systeme · 2026*
