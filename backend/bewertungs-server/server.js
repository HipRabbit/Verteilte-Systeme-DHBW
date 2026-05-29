// ============================================
// Bewertungs-Server - Mein Urlaub
// Microservice für Hotelbewertungen
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Verbindung
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bewertungen';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Bewertungs-DB verbunden');
        await seedIfEmpty();
    })
    .catch(err => console.error('❌ DB Verbindungsfehler:', err));

// Mongoose Schema für Bewertungen
const bewertungSchema = new mongoose.Schema({
    hotelId: { type: String, required: true },
    hotelName: { type: String, required: true },
    autor: { type: String, required: true },
    sterne: { type: Number, required: true, min: 1, max: 5 },
    kommentar: { type: String, required: true },
    datum: { type: Date, default: Date.now }
});

const Bewertung = mongoose.model('Bewertung', bewertungSchema);

// ============================================
// Auto-Seed: Beispieldaten beim ersten Start
// ============================================
async function seedIfEmpty() {
    const count = await Bewertung.countDocuments();
    if (count > 0) return;
    await Bewertung.insertMany([
        { hotelId: "Hotel Alpenblick",      hotelName: "Hotel Alpenblick",      autor: "Max Mustermann", sterne: 5, kommentar: "Traumhafter Ausblick auf die Alpen, sehr freundliches Personal und exzellentes Frühstück!" },
        { hotelId: "Hotel Alpenblick",      hotelName: "Hotel Alpenblick",      autor: "Julia Schmidt",  sterne: 4, kommentar: "Schönes Hotel, nur die Zimmer sind etwas klein. Würde aber wiederkommen." },
        { hotelId: "Strandhotel Sonnenschein", hotelName: "Strandhotel Sonnenschein", autor: "Peter Müller", sterne: 5, kommentar: "Direkt am Strand, perfekt für einen Familienurlaub. Sehr empfehlenswert!" },
        { hotelId: "City Hotel Berlin",     hotelName: "City Hotel Berlin",     autor: "Anna Weber",    sterne: 3, kommentar: "Zentrale Lage, aber etwas laut. Das Preis-Leistungs-Verhältnis stimmt." },
        { hotelId: "Strandhotel Sonnenschein", hotelName: "Strandhotel Sonnenschein", autor: "Thomas Klein", sterne: 4, kommentar: "Tolles Essen und sauberer Pool. Das Personal war sehr zuvorkommend." }
    ]);
    console.log('✅ Bewertungs-Beispieldaten eingefügt');
}

// ============================================
// CRUD API Endpoints
// ============================================

// Health Check
app.get('/', (req, res) => {
    res.json({
        service: 'Bewertungs-Server',
        status: 'läuft',
        endpoints: [
            'GET    /api/bewertungen          - Alle Bewertungen',
            'GET    /api/bewertungen/:id      - Einzelne Bewertung',
            'GET    /api/bewertungen/hotel/:hotelId - Bewertungen pro Hotel',
            'POST   /api/bewertungen          - Neue Bewertung erstellen',
            'PUT    /api/bewertungen/:id      - Bewertung aktualisieren',
            'DELETE /api/bewertungen/:id      - Bewertung löschen'
        ]
    });
});

// READ - Alle Bewertungen lesen (User + Admin)
app.get('/api/bewertungen', async (req, res) => {
    try {
        const bewertungen = await Bewertung.find().sort({ datum: -1 });
        res.json(bewertungen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Einzelne Bewertung (User + Admin)
app.get('/api/bewertungen/:id', async (req, res) => {
    try {
        const bewertung = await Bewertung.findById(req.params.id);
        if (!bewertung) return res.status(404).json({ error: 'Bewertung nicht gefunden' });
        res.json(bewertung);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Bewertungen nach Hotel (sucht nach hotelId ODER hotelName)
app.get('/api/bewertungen/hotel/:hotelId', async (req, res) => {
    try {
        const bewertungen = await Bewertung.find({
            $or: [
                { hotelId:   req.params.hotelId },
                { hotelName: req.params.hotelId }
            ]
        });
        res.json(bewertungen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE - Neue Bewertung (nur Admin)
app.post('/api/bewertungen', async (req, res) => {
    try {
        const neueBewertung = new Bewertung(req.body);
        const gespeichert = await neueBewertung.save();
        res.status(201).json(gespeichert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE - Bewertung ändern (nur Admin)
app.put('/api/bewertungen/:id', async (req, res) => {
    try {
        const aktualisiert = await Bewertung.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!aktualisiert) return res.status(404).json({ error: 'Bewertung nicht gefunden' });
        res.json(aktualisiert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Bewertung löschen (nur Admin)
app.delete('/api/bewertungen/:id', async (req, res) => {
    try {
        const geloescht = await Bewertung.findByIdAndDelete(req.params.id);
        if (!geloescht) return res.status(404).json({ error: 'Bewertung nicht gefunden' });
        res.json({ message: 'Bewertung gelöscht', bewertung: geloescht });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🌟 Bewertungs-Server läuft auf Port ${PORT}`);
});
