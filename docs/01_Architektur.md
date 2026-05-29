# Architektur — Mein Urlaub

**Modul:** Verteilte Systeme · DHBW Heilbronn · SoSe 2026

---

## 1. Systemübersicht

„Mein Urlaub" folgt einer **Microservice-Architektur**: Vier eigenständige Backend-Services kommunizieren über HTTP-REST-APIs mit einem gemeinsamen HTML/JS-Frontend. Jeder Service ist vollständig unabhängig deploybar und verwaltet seine eigene MongoDB-Datenbank.

```
┌─────────────────────────────────────────────────┐
│                   Browser (Client)               │
│                                                  │
│  ┌──────────────┐         ┌────────────────────┐ │
│  │ User-Frontend│         │   Admin-Panel      │ │
│  │ user/index   │         │   admin/index      │ │
│  └──────┬───────┘         └────────┬───────────┘ │
│         │                          │             │
│         └──────────┬───────────────┘             │
│                    │  fetch() / REST              │
└────────────────────┼─────────────────────────────┘
                     │
         ┌───────────┼───────────────────┐
         │           │                   │
         ▼           ▼                   ▼
┌─────────────┐ ┌────────────┐ ┌────────────────┐ ┌──────────────────┐
│ Bewertungs- │ │   Hotel-   │ │ Flugverbindung-│ │  Mietwagen-      │
│  Service    │ │  Service   │ │    Service     │ │  Service         │
│  Port 3001  │ │  Port 3002 │ │   Port 3003    │ │  Port 3004       │
└──────┬──────┘ └─────┬──────┘ └───────┬────────┘ └────────┬─────────┘
       │              │                │                    │
       ▼              ▼                ▼                    ▼
   MongoDB         MongoDB          MongoDB              MongoDB
  (bewertungen)   (hotels)         (fluege)           (mietwagen)
```

---

## 2. Microservices im Detail

### 2.1 Bewertungs-Service (Port 3001)

**Verantwortlichkeit:** Verwaltung von Hotelbewertungen

**Technologie:** Node.js, Express, Mongoose, MongoDB

**Datenschema (Mongoose):**
```javascript
{
  hotelId:   String,          // Referenz auf Hotel (als String, kein harter FK)
  hotelName: String,
  autor:     { type: String, required: true },
  sterne:    { type: Number, min: 1, max: 5, required: true },
  kommentar: { type: String, required: true },
  datum:     { type: Date, default: Date.now }
}
```

**Besondere Endpoints:**
```
GET /api/bewertungen/hotel/:hotelId   → Bewertungen für ein Hotel
```

---

### 2.2 Hotel-Service (Port 3002)

**Verantwortlichkeit:** Verwaltung von Hoteleinträgen

**Datenschema:**
```javascript
{
  name:          { type: String, required: true },
  stadt:         { type: String, required: true },
  land:          { type: String, required: true },
  sterne:        { type: Number, min: 1, max: 5 },
  preisProNacht: { type: Number, min: 0 },
  beschreibung:  String,
  ausstattung:   [String],   // z. B. ["WLAN", "Pool", "Spa"]
  bildUrl:       String,     // Hauptbild (auch komma-getrennte URLs möglich)
  bilder:        [String]    // Weitere Bilder für Karussell
}
```

---

### 2.3 Flugverbindung-Service (Port 3003)

**Verantwortlichkeit:** Verwaltung von Flugverbindungen

**Datenschema:**
```javascript
{
  flugnummer:   { type: String, required: true },
  airline:      { type: String, required: true },
  abflughafen:  { type: String, required: true },
  zielflughafen:{ type: String, required: true },
  abflugzeit:   Date,
  ankunftszeit: Date,
  preis:        { type: Number, min: 0 },
  klasse:       { type: String, enum: ['Economy', 'Business', 'First'] },
  freiePlaetze: Number
}
```

---

### 2.4 Mietwagen-Service (Port 3004)

**Verantwortlichkeit:** Verwaltung von Mietwageneinträgen

**Datenschema:**
```javascript
{
  marke:       { type: String, required: true },
  modell:      { type: String, required: true },
  kategorie:   { type: String, enum: ['Kleinwagen','Mittelklasse','Oberklasse','SUV','Van'] },
  standort:    { type: String, required: true },
  preisProTag: { type: Number, min: 0 },
  getriebe:    { type: String, enum: ['Manuell', 'Automatik'] },
  kraftstoff:  { type: String, enum: ['Benzin','Diesel','Elektro','Hybrid'] },
  sitzplaetze: Number,
  verfuegbar:  { type: Boolean, default: true },
  bildUrl:     String,
  bilder:      [String]
}
```

---

## 3. REST-API-Muster

Alle vier Services folgen demselben RESTful CRUD-Muster:

| Methode  | Endpoint                  | Aktion              |
|----------|---------------------------|---------------------|
| `GET`    | `/api/{ressource}`        | Alle laden          |
| `GET`    | `/api/{ressource}/:id`    | Einzelnen laden     |
| `POST`   | `/api/{ressource}`        | Neu erstellen       |
| `PUT`    | `/api/{ressource}/:id`    | Aktualisieren       |
| `DELETE` | `/api/{ressource}/:id`    | Löschen             |

**Fehlerbehandlung:** Alle Endpoints geben bei Fehler `{ error: "Nachricht" }` mit passendem HTTP-Statuscode zurück.

**CORS:** Alle Services haben CORS für `*` aktiviert (Demo-Konfiguration).

---

## 4. Frontend-Architektur

### 4.1 Dateistruktur
```
frontend/
├── login.html          → Einstiegsseite (Login + Registrierung)
├── shared.css          → Gemeinsames Design-System „Riviera Luxe"
├── auth.js             → Authentifizierungsmodul (IIFE-Pattern)
├── user/
│   ├── index.html      → User-Ansicht (Hotels, Flüge, Mietwagen)
│   └── app.js          → User-Logik (State, Render, Filter, Favoriten)
└── admin/
    ├── index.html      → Admin-Panel (Dashboard, CRUD, Server-Status)
    └── app.js          → Admin-Logik (CRUD, Dashboard, Status-Check)
```

### 4.2 State-Management (User-Frontend)
Das User-Frontend nutzt ein einfaches zentrales State-Objekt:
```javascript
const state = {
    hotels:                [],
    fluege:                [],
    mietwagen:             [],
    bewertungen:           [],
    nurFavoriten:          false,    // Filter-Flag Hotels
    nurMietwagenFavoriten: false     // Filter-Flag Mietwagen
};
```
Daten werden bei Seitenaufruf einmalig geladen (`Promise.all`) und bei Filteränderungen aus dem State re-gerendert (kein erneuter API-Call).

### 4.3 Design-System „Riviera Luxe"
`shared.css` definiert ein eigenes Design-System mit CSS Custom Properties:

| Variable | Wert | Verwendung |
|----------|------|-----------|
| `--urlaub-primary` | `#1B6B7B` | Hauptfarbe (Teal) |
| `--urlaub-gold` | `#BF9B5C` | Akzentfarbe |
| `--urlaub-accent` | `#D97B5E` | Coral-Akzent |
| `--urlaub-sand` | `#FDFAF5` | Hintergrundfarbe |
| `--gradient-luxury` | `135deg, #1A3D45 → #1B6B7B → #BF9B5C` | Haupt-Gradient |

---

## 5. Authentifizierung

### Konzept
Da das Projekt auf GitHub Pages gehostet wird (rein statisches Frontend), ist keine serverseitige Authentifizierung möglich. Die Implementierung nutzt `localStorage` für die Nutzerdatenbank und `sessionStorage` für die aktive Session.

```
┌─────────────────────────────┐
│        auth.js (IIFE)       │
│                             │
│  localStorage               │
│  ├── meinUrlaub_users []    │  ← Nutzerdatenbank
│  ├── meinUrlaub_fav_hotels_ │  ← Favoriten pro Nutzer
│  └── meinUrlaub_fav_mw_*   │
│                             │
│  sessionStorage             │
│  └── mein-urlaub-auth {}    │  ← Aktive Session
└─────────────────────────────┘
```

### Rollen
| Rolle  | Beschreibung |
|--------|-------------|
| `admin` | Erster registrierter Nutzer; Zugriff auf Admin-Panel + alle CRUD-Operationen |
| `user`  | Alle weiteren registrierten Nutzer; kann Bewertungen schreiben, Favoriten setzen |
| `gast`  | Nicht eingeloggt; nur Lesezugriff, keine Bewertungen, keine Favoriten |

### Einschränkung
> ⚠️ Passwörter werden im Klartext in `localStorage` gespeichert. Diese Implementierung ist **ausschließlich für Demo-Zwecke** geeignet. Für produktiven Einsatz wäre ein Backend mit bcrypt-Hashing und JWT-Tokens erforderlich.

---

## 6. Cross-Service-Kommunikation

Das Frontend ist der einzige Konsument aller Services. Es gibt keine direkte Service-zu-Service-Kommunikation im Backend. Alle Anfragen gehen vom Browser aus:

- **Hotel-Detail-Modal:** Lädt Bewertungen vom Bewertungs-Service via `GET /api/bewertungen/hotel/:id`
- **Admin-Dashboard:** Aggregiert Daten aller vier Services parallel via `Promise.all()`
- **Server-Status-Tab:** Pingt alle vier Services und misst Antwortzeit

---

## 7. Favoriten-Architektur

Favoriten werden pro Nutzer isoliert in `localStorage` gespeichert:

```
Key-Schema: meinUrlaub_fav_{typ}_{username}

Beispiele:
  meinUrlaub_fav_hotels_maria     → ["id1", "id2"]
  meinUrlaub_fav_mietwagen_thomas → ["id3"]
  meinUrlaub_fav_hotels_gast      → []
```

Gäste teilen eine gemeinsame Favoritenliste unter dem Schlüssel `_gast`.
