// ============================================
// Flugverbindung-Server - Mein Urlaub
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flugverbindungen';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Flug-DB verbunden');
        await seedIfEmpty();
    })
    .catch(err => console.error('❌ DB Verbindungsfehler:', err));

// Flugverbindung Schema
const flugSchema = new mongoose.Schema({
    flugnummer: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    abflughafen: { type: String, required: true },
    zielflughafen: { type: String, required: true },
    abflugzeit: { type: Date, required: true },
    ankunftszeit: { type: Date, required: true },
    preis: { type: Number, required: true },
    klasse: { type: String, enum: ['Economy', 'Business', 'First'], default: 'Economy' },
    freiePlaetze: { type: Number, default: 0 },
    erstelltAm: { type: Date, default: Date.now }
});

const Flug = mongoose.model('Flug', flugSchema);

// ============================================
// Auto-Seed: Beispieldaten beim ersten Start
// ============================================
async function seedIfEmpty() {
    const count = await Flug.countDocuments();
    if (count > 0) return;
    await Flug.insertMany([
        { flugnummer: "LH1234", airline: "Lufthansa", abflughafen: "Frankfurt (FRA)", zielflughafen: "Palma de Mallorca (PMI)", abflugzeit: new Date("2026-07-15T08:30:00"), ankunftszeit: new Date("2026-07-15T11:00:00"), preis: 189.99, klasse: "Economy", freiePlaetze: 42 },
        { flugnummer: "LH5678", airline: "Lufthansa", abflughafen: "München (MUC)", zielflughafen: "Heraklion (HER)", abflugzeit: new Date("2026-08-02T06:15:00"), ankunftszeit: new Date("2026-08-02T10:30:00"), preis: 219.50, klasse: "Economy", freiePlaetze: 28 },
        { flugnummer: "EW9012", airline: "Eurowings", abflughafen: "Stuttgart (STR)", zielflughafen: "Berlin (BER)", abflugzeit: new Date("2026-06-10T14:00:00"), ankunftszeit: new Date("2026-06-10T15:20:00"), preis: 89.00, klasse: "Economy", freiePlaetze: 55 },
        { flugnummer: "OS3456", airline: "Austrian Airlines", abflughafen: "Frankfurt (FRA)", zielflughafen: "Innsbruck (INN)", abflugzeit: new Date("2026-12-20T09:45:00"), ankunftszeit: new Date("2026-12-20T11:10:00"), preis: 149.90, klasse: "Economy", freiePlaetze: 18 },
        { flugnummer: "LH7890", airline: "Lufthansa", abflughafen: "Hamburg (HAM)", zielflughafen: "München (MUC)", abflugzeit: new Date("2026-09-05T17:30:00"), ankunftszeit: new Date("2026-09-05T18:45:00"), preis: 129.00, klasse: "Business", freiePlaetze: 12 }
    ]);
    console.log('✅ Flug-Beispieldaten eingefügt');
}

// ============================================
// CRUD API Endpoints
// ============================================

app.get('/', (req, res) => {
    res.json({
        service: 'Flugverbindung-Server',
        status: 'läuft',
        endpoints: [
            'GET    /api/fluege          - Alle Flüge',
            'GET    /api/fluege/:id      - Einzelner Flug',
            'POST   /api/fluege          - Neuen Flug erstellen',
            'PUT    /api/fluege/:id      - Flug aktualisieren',
            'DELETE /api/fluege/:id      - Flug löschen'
        ]
    });
});

app.get('/api/fluege', async (req, res) => {
    try {
        const fluege = await Flug.find().sort({ abflugzeit: 1 });
        res.json(fluege);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/fluege/:id', async (req, res) => {
    try {
        const flug = await Flug.findById(req.params.id);
        if (!flug) return res.status(404).json({ error: 'Flug nicht gefunden' });
        res.json(flug);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/fluege', async (req, res) => {
    try {
        const neuerFlug = new Flug(req.body);
        const gespeichert = await neuerFlug.save();
        res.status(201).json(gespeichert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/fluege/:id', async (req, res) => {
    try {
        const aktualisiert = await Flug.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!aktualisiert) return res.status(404).json({ error: 'Flug nicht gefunden' });
        res.json(aktualisiert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/fluege/:id', async (req, res) => {
    try {
        const geloescht = await Flug.findByIdAndDelete(req.params.id);
        if (!geloescht) return res.status(404).json({ error: 'Flug nicht gefunden' });
        res.json({ message: 'Flug gelöscht', flug: geloescht });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✈️  Flugverbindung-Server läuft auf Port ${PORT}`);
});
