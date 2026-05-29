// ============================================
// Hotel-Server - Mein Urlaub
// Microservice für Hotels
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotels';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Hotel-DB verbunden'))
    .catch(err => console.error('❌ DB Verbindungsfehler:', err));

// Hotel Schema
const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    stadt: { type: String, required: true },
    land: { type: String, required: true },
    sterne: { type: Number, required: true, min: 1, max: 5 },
    preisProNacht: { type: Number, required: true },
    beschreibung: { type: String, required: true },
    ausstattung: [String],
    bildUrl: { type: String, default: '' },        // Beibehalten für Rückwärtskompatibilität
    bilder: { type: [String], default: [] },       // Neu: mehrere Bilder
    langBeschreibung: { type: String, default: '' }, // Neu: ausführliche Beschreibung
    highlights: { type: [String], default: [] },   // Neu: Highlights
    adresse: { type: String, default: '' },        // Neu: Adresse
    webseite: { type: String, default: '' },       // Neu: Webseite
    erstelltAm: { type: Date, default: Date.now }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// ============================================
// CRUD API Endpoints
// ============================================

app.get('/', (req, res) => {
    res.json({
        service: 'Hotel-Server',
        status: 'läuft',
        endpoints: [
            'GET    /api/hotels          - Alle Hotels',
            'GET    /api/hotels/:id      - Einzelnes Hotel',
            'POST   /api/hotels          - Neues Hotel erstellen',
            'PUT    /api/hotels/:id      - Hotel aktualisieren',
            'DELETE /api/hotels/:id      - Hotel löschen'
        ]
    });
});

// READ - Alle Hotels
app.get('/api/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find().sort({ name: 1 });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Einzelnes Hotel
app.get('/api/hotels/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ error: 'Hotel nicht gefunden' });
        res.json(hotel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE - Neues Hotel (nur Admin)
app.post('/api/hotels', async (req, res) => {
    try {
        const neuesHotel = new Hotel(req.body);
        const gespeichert = await neuesHotel.save();
        res.status(201).json(gespeichert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE - Hotel ändern (nur Admin)
app.put('/api/hotels/:id', async (req, res) => {
    try {
        const aktualisiert = await Hotel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!aktualisiert) return res.status(404).json({ error: 'Hotel nicht gefunden' });
        res.json(aktualisiert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Hotel löschen (nur Admin)
app.delete('/api/hotels/:id', async (req, res) => {
    try {
        const geloescht = await Hotel.findByIdAndDelete(req.params.id);
        if (!geloescht) return res.status(404).json({ error: 'Hotel nicht gefunden' });
        res.json({ message: 'Hotel gelöscht', hotel: geloescht });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🏨 Hotel-Server läuft auf Port ${PORT}`);
});
