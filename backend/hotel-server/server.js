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
    .then(async () => {
        console.log('✅ Hotel-DB verbunden');
        await seedIfEmpty();
    })
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
    bildUrl: { type: String, default: '' },
    erstelltAm: { type: Date, default: Date.now }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// ============================================
// Auto-Seed: Beispieldaten beim ersten Start
// ============================================
async function seedIfEmpty() {
    const count = await Hotel.countDocuments();
    if (count > 0) return;
    await Hotel.insertMany([
        {
            name: "Hotel Alpenblick",
            stadt: "Garmisch-Partenkirchen",
            land: "Deutschland",
            sterne: 4,
            preisProNacht: 159,
            beschreibung: "Familiengeführtes Hotel mit traumhaftem Ausblick auf die bayerischen Alpen und regionaler Küche.",
            ausstattung: ["WLAN", "Frühstück", "Wellnessbereich", "Parkplatz"],
            bildUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
        },
        {
            name: "Strandhotel Sonnenschein",
            stadt: "Palma de Mallorca",
            land: "Spanien",
            sterne: 5,
            preisProNacht: 249,
            beschreibung: "Luxuriöses Strandhotel direkt am Mittelmeer mit Pool, Spa und mehreren Restaurants.",
            ausstattung: ["WLAN", "All-Inclusive", "Pool", "Spa", "Strandzugang"],
            bildUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"
        },
        {
            name: "City Hotel Berlin",
            stadt: "Berlin",
            land: "Deutschland",
            sterne: 3,
            preisProNacht: 99,
            beschreibung: "Modernes City-Hotel in zentraler Lage, perfekt für Städtereisen und Geschäftsreisende.",
            ausstattung: ["WLAN", "Frühstück", "Fitness", "Bar"],
            bildUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791"
        },
        {
            name: "Bergresort Tirol",
            stadt: "Innsbruck",
            land: "Österreich",
            sterne: 4,
            preisProNacht: 189,
            beschreibung: "Gemütliches Bergresort mit direktem Zugang zu Ski- und Wanderpisten in den Tiroler Alpen.",
            ausstattung: ["WLAN", "Halbpension", "Sauna", "Skiverleih", "Parkplatz"],
            bildUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"
        },
        {
            name: "Inselparadies Kreta",
            stadt: "Heraklion",
            land: "Griechenland",
            sterne: 5,
            preisProNacht: 279,
            beschreibung: "Exklusives Resort auf der Insel Kreta mit privatem Strand und mediterranem Flair.",
            ausstattung: ["WLAN", "All-Inclusive", "Pool", "Strand", "Spa", "Tennis"],
            bildUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d"
        }
    ]);
    console.log('✅ Hotel-Beispieldaten eingefügt');
}

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
