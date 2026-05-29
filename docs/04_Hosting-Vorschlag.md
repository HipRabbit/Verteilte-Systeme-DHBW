# Hosting-Vorschlag — Mein Urlaub

**Modul:** Verteilte Systeme · DHBW Heilbronn · SoSe 2026

---

## 1. Überblick

Das Projekt besteht aus zwei unabhängig deployten Teilen:

| Teil | Empfehlung | Kosten |
|------|-----------|--------|
| **Frontend** (statisch) | GitHub Pages | kostenlos |
| **Backend** (4 Services) | Railway / Render / Heroku | kostenlos (Free Tier) |
| **Datenbank** | MongoDB Atlas | kostenlos (512 MB) |

---

## 2. Frontend — GitHub Pages

Da das Frontend aus reinen HTML/CSS/JS-Dateien besteht (kein Build-Step), kann es direkt auf GitHub Pages gehostet werden.

### Schritte

1. **Repository anlegen** (öffentlich oder privat mit Pages-Aktivierung)

2. **Code pushen:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/DEIN_USERNAME/mein-urlaub.git
   git push -u origin main
   ```

3. **GitHub Pages aktivieren:**
   - Repository → Settings → Pages
   - Source: Branch `main`, Ordner `/ (root)` oder `/frontend`
   - Speichern → URL wird angezeigt (z. B. `https://username.github.io/mein-urlaub`)

4. **API-URLs anpassen** — in `frontend/user/app.js` und `frontend/admin/app.js`:
   ```javascript
   const API = {
       bewertungen: 'https://mein-urlaub-bewertungen.railway.app/api/bewertungen',
       hotels:      'https://mein-urlaub-hotels.railway.app/api/hotels',
       fluege:      'https://mein-urlaub-fluege.railway.app/api/fluege',
       mietwagen:   'https://mein-urlaub-mietwagen.railway.app/api/mietwagen'
   };
   ```

> ⚠️ Das Frontend muss über **HTTPS** ausgeliefert werden (GitHub Pages macht das automatisch). Die Backend-URLs müssen ebenfalls HTTPS sein — sonst blockiert der Browser Mixed-Content-Fehler.

---

## 3. Datenbank — MongoDB Atlas

Alle 4 Backend-Services benötigen eine MongoDB-Verbindung. Für Cloud-Hosting empfiehlt sich **MongoDB Atlas** (kostenloser M0-Cluster, 512 MB).

### Einrichtung

1. Account anlegen unter [mongodb.com/atlas](https://mongodb.com/atlas)
2. Neues **kostenfreies Cluster** (M0) erstellen, Region wählen
3. Datenbankbenutzer anlegen (Benutzername + Passwort notieren)
4. **Network Access** → `0.0.0.0/0` erlauben (für Cloud-Deployment)
5. Connection String kopieren:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
   ```

> Für jeden Service eine eigene Datenbank verwenden (z. B. `meinurlaub_hotels`, `meinurlaub_bewertungen`).

---

## 4. Backend — Railway (empfohlen)

**Railway** bietet einfaches Node.js-Deployment ohne Konfigurationsaufwand und einen großzügigen Free Tier.

### Deployment eines Services (Beispiel: Hotel-Service)

1. Account anlegen unter [railway.app](https://railway.app)

2. **New Project** → „Deploy from GitHub repo"

3. Repo auswählen → im Deployment-Dialog den **Root Directory** auf `backend/hotel-server` setzen

4. **Environment Variables** setzen:
   ```
   MONGODB_URI = mongodb+srv://user:pass@cluster0.xxx.mongodb.net/meinurlaub_hotels
   PORT        = 3002
   ```

5. Deployment starten → Railway liefert eine URL (`https://hotel-service-xxx.railway.app`)

6. Gleichen Ablauf für die anderen 3 Services wiederholen.

### Seed-Daten einfügen (nach Deployment)

Im Railway-Dashboard unter dem jeweiligen Service:
- „Railway Shell" öffnen → `node seed.js` ausführen

---

## 5. Backend — Heroku (Alternative)

Falls Railway nicht verfügbar ist, kann Heroku genutzt werden.

### Voraussetzungen
- Heroku CLI installiert
- Git installiert

### Deployment (Beispiel: Hotel-Service)
```bash
cd backend/hotel-server

# Heroku-App erstellen
heroku create mein-urlaub-hotels

# MongoDB Atlas URI setzen
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster/hotels"

# Deployen
git init
git add .
git commit -m "Deploy hotel service"
git push heroku main
```

Gleichen Ablauf für die anderen 3 Services wiederholen:
- `mein-urlaub-bewertungen`
- `mein-urlaub-hotels`
- `mein-urlaub-fluege`
- `mein-urlaub-mietwagen`

---

## 6. Backend — Render (Alternative)

[Render.com](https://render.com) bietet ebenfalls kostenlosen Node.js-Hosting.

1. Neuen **Web Service** erstellen
2. GitHub-Repo verbinden
3. Root Directory: `backend/hotel-server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variable `MONGODB_URI` setzen
7. Deploy

---

## 7. Lokales Deployment mit Docker

Für lokales Testen aller Services inklusive MongoDB in einem Befehl:

```bash
docker compose up --build
```

**docker-compose.yml** startet:
- 4 Node.js-Services (Ports 3001–3004)
- MongoDB (Port 27017)
- Alle Services verbinden sich automatisch mit der lokalen MongoDB

Stoppen: `docker compose down`  
Stoppen + Daten löschen: `docker compose down -v`

---

## 8. Umgebungsvariablen

Jeder Backend-Service benötigt folgende Umgebungsvariablen:

| Variable | Beschreibung | Beispiel |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB-Verbindungsstring | `mongodb+srv://...` |
| `PORT` | Port des Services | `3002` |

Lokal werden diese in einer `.env`-Datei im jeweiligen Service-Verzeichnis gesetzt (nicht ins Git-Repository einchecken!).

Beispiel `backend/hotel-server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/meinurlaub_hotels
PORT=3002
```

---

## 9. Deployment-Checkliste

- [ ] MongoDB Atlas Cluster eingerichtet + Connection Strings notiert
- [ ] Alle 4 Backend-Services auf Railway/Heroku/Render deployed
- [ ] HTTPS-URLs der Services notiert
- [ ] `API`-Objekt in `frontend/user/app.js` auf Cloud-URLs aktualisiert
- [ ] `API`-Objekt in `frontend/admin/app.js` auf Cloud-URLs aktualisiert
- [ ] Frontend auf GitHub Pages veröffentlicht
- [ ] Seed-Daten in Produktionsdatenbank eingespielt
- [ ] Funktionstest: Login, Hotelliste laden, Bewertung schreiben, Admin-CRUD

---

## 10. CORS-Hinweis

Alle Backend-Services haben CORS für alle Origins (`*`) aktiviert. Das ist für Demo-Zwecke ausreichend. Für eine produktive Anwendung sollte CORS auf die tatsächliche Frontend-Domain eingeschränkt werden:

```javascript
// In server.js des jeweiligen Services:
app.use(cors({
    origin: 'https://username.github.io'
}));
```
