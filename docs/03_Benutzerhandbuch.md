# Benutzerhandbuch — Mein Urlaub

**Modul:** Verteilte Systeme · DHBW Heilbronn · SoSe 2026

---

## 1. Systemstart

Vor der Nutzung des Frontends müssen die Backend-Services gestartet werden.

### Schnellstart (empfohlen)
```bash
npm run install:all   # einmalig
npm run seed:all      # einmalig (Beispieldaten)
npm start             # alle 4 Services starten
```

Danach `frontend/login.html` im Browser öffnen (empfohlen: VS Code Live Server, Port 5500).

---

## 2. Login-Seite

### Registrierung
Beim ersten Aufruf ist noch kein Konto vorhanden. Die Seite öffnet automatisch den **Registrieren**-Tab.

1. **Anzeigename** eingeben (z. B. „Max Mustermann")
2. **Benutzername** eingeben (nur Kleinbuchstaben, Zahlen, Unterstrich)
3. **Passwort** eingeben (mind. 4 Zeichen) und wiederholen
4. Auf **„Konto erstellen"** klicken

> Das erste erstellte Konto erhält automatisch **Admin-Rechte** und wird zur Admin-Ansicht weitergeleitet.

### Anmelden
1. Tab **„Anmelden"** wählen
2. Benutzername und Passwort eingeben
3. Auf **„Anmelden"** klicken → Weiterleitung je nach Rolle (Admin-Panel oder User-Ansicht)

### Als Gast fortfahren
Klick auf **„Als Gast fortfahren"** → direkt zur User-Ansicht ohne Registrierung.

> Als Gast: keine Bewertungen schreiben, keine Favoriten speichern.

---

## 3. User-Ansicht

### 3.1 Navigation
Die User-Ansicht ist in drei Tabs gegliedert:

| Tab | Inhalt |
|-----|--------|
| **Hotels** | Hotelkarten mit Bewertung, Preis, Ausstattung |
| **Flüge** | Flugtabelle mit Airline, Route, Abflug, Preis |
| **Mietwagen** | Mietwagenkkarten mit Kategorie, Preis, Verfügbarkeit |

### 3.2 Hotels

**Suche & Filter:**
- Suchfeld: filtert nach Name, Stadt oder Land
- Mindest-Sterne: zeigt nur Hotels ab gewählter Sternebewertung
- Sortierung: nach Name, Preis aufsteigend/absteigend, Sterne

**Hotel-Karte:**
- Zeigt Hauptbild, Name, Ort, Sterne, Durchschnittsbewertung, Ausstattung und Preis
- Klick auf Karte oder **„Details"** öffnet das Detail-Modal

**Detail-Modal:**
- **Bildergalerie:** Mehrere Bilder durchblättern (Pfeile, Punkte-Indikatoren)
- Vollständige Beschreibung, Ausstattungsliste, Bewertungsdurchschnitt
- Preis-Info-Box (Preis pro Nacht, Sterne, Standort)
- Alle bisherigen **Gästebewertungen** mit Autor, Sterne und Datum
- **„Bewertung schreiben"**-Button (nur für eingeloggte Nutzer)

**Favoriten:**
- Herz-Symbol (oben rechts auf der Karte) zum Hinzufügen/Entfernen
- Herz-Button im Filter → zeigt nur Favoriten
- Favoriten sind pro Nutzer isoliert

### 3.3 Flüge

- Tabelle mit Flugnummer, Airline, Route (Von → Nach), Abflug, Ankunft, Dauer, Klasse, Preis
- Filter nach Abflugort, Zielort, Datum (von/bis), Preissortierung
- Button **„Filter zurücksetzen"**

### 3.4 Mietwagen

- Karten mit Fahrzeugbild, Marke/Modell, Kategorie, Standort, Preis/Tag
- Filter nach Suchbegriff (Marke, Modell, Standort), Kategorie, Sortierung
- Herz-Favoriten-System wie bei Hotels
- Klick auf Karte öffnet Detail-Modal mit Bildergalerie, Fahrzeugdaten und Preis

### 3.5 Burger-Menü (nur eingeloggte Nutzer)

Klick auf den Nutzername-Button (oben rechts) öffnet ein Seitenmenü mit:

- **Profil:** Name und Rolle (User/Admin)
- **Hotel-Favoriten:** Direkt zu den gespeicherten Hotel-Favoriten springen
- **Mietwagen-Favoriten:** Direkt zu den gespeicherten Mietwagen-Favoriten springen
- **Bewertung schreiben:** Öffnet das Bewertungsformular
- **Admin-Panel:** (nur für Admins sichtbar) Wechsel ins Admin-Panel
- **Abmelden**

### 3.6 Bewertung schreiben

Zwei Wege:
1. Über das **Burger-Menü** → „Bewertung schreiben"
2. Direkt aus dem **Hotel-Detail-Modal** → „Bewertung schreiben" (Hotel vorausgewählt)

Im Formular:
1. Hotel auswählen (falls nicht vorausgewählt)
2. Sternebewertung wählen (1–5)
3. Kommentar eingeben
4. „Bewertung absenden" klicken

### 3.7 Dark / Light Mode

Klick auf das Mond/Sonne-Symbol in der Navbar schaltet das Design um. Die Einstellung wird dauerhaft gespeichert.

---

## 4. Admin-Panel

Das Admin-Panel ist nur für Nutzer mit der Rolle **Admin** zugänglich.

### 4.1 Dashboard

Beim Öffnen wird das Dashboard automatisch geladen:

- **Statistik-Karten:** Anzahl Hotels, Flüge, Mietwagen; Durchschnittsbewertung aller Hotels
- **Top-Hotels nach Bewertung:** Die 5 am besten bewerteten Hotels
- **Neueste Bewertungen:** Die 5 zuletzt eingereichten Bewertungen

### 4.2 Server-Status

Klick auf den Tab **„Server-Status"** startet einen Live-Check aller 4 Microservices:

- **Online:** Grüner Punkt, Antwortzeit in ms, Anzahl der Einträge
- **Offline:** Roter Punkt, Fehlermeldung (z. B. Timeout oder HTTP-Fehler)
- **Gesamtstatus:** Grün (alle online), Gelb (teilweise), Rot (alle offline)
- **Auto-Refresh:** Countdown läuft von 60 auf 0, dann automatische Neuprüfung
- **Manuell aktualisieren:** Button „Aktualisieren" setzt Countdown zurück

### 4.3 Hotels verwalten

| Aktion | Beschreibung |
|--------|-------------|
| **Neues Hotel** | Button oben rechts → Modal mit Formular |
| **Bearbeiten** | Stift-Symbol in der Tabelle → Modal vorausgefüllt |
| **Löschen** | Mülleimer-Symbol → Bestätigungs-Dialog |

**Formularfelder:**
- Name, Stadt, Land (Pflicht)
- Sterne (1–5), Preis pro Nacht
- Beschreibung
- Ausstattung (komma-getrennt, z. B. „WLAN, Pool, Spa")
- Hauptbild-URL
- Weitere Bilder (komma-getrennte URLs für Bildergalerie)

**Sortierung:** Klick auf Spaltenköpfe sortiert die Tabelle auf-/absteigend.

### 4.4 Flüge verwalten

Gleiche Struktur wie Hotels. Formularfelder:
- Flugnummer, Airline (Pflicht)
- Abflughafen, Zielflughafen (Pflicht)
- Abflugzeit, Ankunftszeit (Datum + Uhrzeit)
- Preis, Klasse (Economy/Business/First), Freie Plätze

> Validierung: Ankunftszeit muss nach Abflugzeit liegen.

### 4.5 Mietwagen verwalten

Formularfelder:
- Marke, Modell, Standort (Pflicht)
- Kategorie (Kleinwagen/Mittelklasse/Oberklasse/SUV/Van)
- Preis pro Tag
- Getriebe (Manuell/Automatik), Kraftstoff (Benzin/Diesel/Elektro/Hybrid)
- Sitzplätze, Verfügbar (Ja/Nein)
- Hauptbild-URL, Weitere Bilder (komma-getrennt)

### 4.6 Bewertungen verwalten

> **Bewussste Design-Entscheidung:** Der Admin kann Bewertungen **nur löschen**, nicht erstellen oder bearbeiten.
> Dies ist eine bewusste Integritätsmaßnahme: Bewertungen dürfen ausschließlich von registrierten Nutzern
> verfasst werden. Würde der Admin Bewertungen erstellen oder verändern können, würde das die
> Authentizität und Vertrauenswürdigkeit der Nutzerbewertungen untergraben.

- Tabelle mit Hotel, Autor, Sterne, Kommentar (gekürzt), Datum
- Sortierung nach allen Spalten möglich
- Löschen per Mülleimer-Symbol + Bestätigungs-Dialog (z. B. bei unangemessenen Inhalten)

### 4.7 Weitere Funktionen

- **Dark / Light Mode:** Mond/Sonne-Button in der Admin-Navbar
- **User-Ansicht:** Button „User-Ansicht" öffnet das User-Frontend in derselben Session
- **Zurück zum Admin:** Beim Wechsel zur User-Ansicht erscheint ein Button unten links zum Zurückwechseln
- **Abmelden:** Beendet die Session und leitet zur Login-Seite weiter

---

## 5. Impressum & Über uns

Auf jeder Seite (Login, User-Ansicht, Admin-Panel) sind im Footer-Bereich zwei Buttons:

- **Impressum:** Hinweis auf Universitätsprojekt, keine gesetzliche Impressumspflicht
- **Über uns:** Projektbeschreibung, Technologien, Microservices, Hauptfunktionen, Entwicklerinformation
