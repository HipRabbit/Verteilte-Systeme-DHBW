// ============================================
// Mietwagen-Server - Mein Urlaub
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mietwagen';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Mietwagen-DB verbunden'))
    .catch(err => console.error('❌ DB Verbindungsfehler:', err));

// Mietwagen Schema
const mietwagenSchema = new mongoose.Schema({
    marke: { type: String, required: true },
    modell: { type: String, required: true },
    kategorie: { type: String, enum: ['Kleinwagen', 'Mittelklasse', 'Oberklasse', 'SUV', 'Van'], required: true },
    standort: { type: String, required: true },
    preisProTag: { type: Number, required: true },
    getriebe: { type: String, enum: ['Manuell', 'Automatik'], default: 'Manuell' },
    kraftstoff: { type: String, enum: ['Benzin', 'Diesel', 'Elektro', 'Hybrid'], default: 'Benzin' },
    sitzplaetze: { type: Number, default: 5 },
    verfuegbar: { type: Boolean, default: true },
    bildUrl: { type: String, default: '' },
    bilder: { type: [String], default: [] },           // Neu: mehrere Bilder
    langBeschreibung: { type: String, default: '' },   // Neu
    kilometerProTag: { type: Number, default: 0 },     // Neu: freie Kilometer/Tag
    mindestalter: { type: Number, default: 21 },       // Neu
    kaution: { type: Number, default: 0 },             // Neu
    erstelltAm: { type: Date, default: Date.now }
});

const Mietwagen = mongoose.model('Mietwagen', mietwagenSchema);

// ============================================
// CRUD API Endpoints
// ============================================

app.get('/', (req, res) => {
    res.json({
        service: 'Mietwagen-Server',
        status: 'läuft',
        endpoints: [
            'GET    /api/mietwagen          - Alle Mietwagen',
            'GET    /api/mietwagen/:id      - Einzelner Mietwagen',
            'POST   /api/mietwagen          - Neuen Mietwagen erstellen',
            'PUT    /api/mietwagen/:id      - Mietwagen aktualisieren',
            'DELETE /api/mietwagen/:id      - Mietwagen löschen'
        ]
    });
});

app.get('/api/mietwagen', async (req, res) => {
    try {
        const mietwagen = await Mietwagen.find().sort({ preisProTag: 1 });
        res.json(mietwagen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/mietwagen/:id', async (req, res) => {
    try {
        const mietwagen = await Mietwagen.findById(req.params.id);
        if (!mietwagen) return res.status(404).json({ error: 'Mietwagen nicht gefunden' });
        res.json(mietwagen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/mietwagen', async (req, res) => {
    try {
        const neuerMietwagen = new Mietwagen(req.body);
        const gespeichert = await neuerMietwagen.save();
        res.status(201).json(gespeichert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/mietwagen/:id', async (req, res) => {
    try {
        const aktualisiert = await Mietwagen.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!aktualisiert) return res.status(404).json({ error: 'Mietwagen nicht gefunden' });
        res.json(aktualisiert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/mietwagen/:id', async (req, res) => {
    try {
        const geloescht = await Mietwagen.findByIdAndDelete(req.params.id);
        if (!geloescht) return res.status(404).json({ error: 'Mietwagen nicht gefunden' });
        res.json({ message: 'Mietwagen gelöscht', mietwagen: geloescht });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚗 Mietwagen-Server läuft auf Port ${PORT}`);
});
