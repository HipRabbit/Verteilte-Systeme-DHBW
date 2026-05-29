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
    .then(async () => {
        console.log('✅ Mietwagen-DB verbunden');
        await seedIfEmpty();
    })
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
    erstelltAm: { type: Date, default: Date.now }
});

const Mietwagen = mongoose.model('Mietwagen', mietwagenSchema);

// ============================================
// Auto-Seed: Beispieldaten beim ersten Start
// ============================================
async function seedIfEmpty() {
    const count = await Mietwagen.countDocuments();
    if (count > 0) return;
    await Mietwagen.insertMany([
        { marke: "VW", modell: "Polo", kategorie: "Kleinwagen", standort: "Flughafen Palma de Mallorca", preisProTag: 29.99, getriebe: "Manuell", kraftstoff: "Benzin", sitzplaetze: 5, verfuegbar: true, bildUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2" },
        { marke: "BMW", modell: "3er Touring", kategorie: "Mittelklasse", standort: "Flughafen München", preisProTag: 79.00, getriebe: "Automatik", kraftstoff: "Diesel", sitzplaetze: 5, verfuegbar: true, bildUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e" },
        { marke: "Tesla", modell: "Model 3", kategorie: "Oberklasse", standort: "Flughafen Berlin (BER)", preisProTag: 119.00, getriebe: "Automatik", kraftstoff: "Elektro", sitzplaetze: 5, verfuegbar: true, bildUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89" },
        { marke: "Jeep", modell: "Wrangler", kategorie: "SUV", standort: "Flughafen Heraklion", preisProTag: 95.50, getriebe: "Automatik", kraftstoff: "Benzin", sitzplaetze: 5, verfuegbar: true, bildUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf" },
        { marke: "VW", modell: "T6 Multivan", kategorie: "Van", standort: "Flughafen Innsbruck", preisProTag: 109.00, getriebe: "Manuell", kraftstoff: "Diesel", sitzplaetze: 7, verfuegbar: true, bildUrl: "https://images.unsplash.com/photo-1570733117311-d990c3816c47" },
        { marke: "Toyota", modell: "Yaris Hybrid", kategorie: "Kleinwagen", standort: "Flughafen Frankfurt", preisProTag: 39.90, getriebe: "Automatik", kraftstoff: "Hybrid", sitzplaetze: 5, verfuegbar: true, bildUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588" }
    ]);
    console.log('✅ Mietwagen-Beispieldaten eingefügt');
}

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
