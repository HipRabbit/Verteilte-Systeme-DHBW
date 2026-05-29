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
    .then(() => console.log('✅ Flug-DB verbunden'))
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
