const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mietwagen';

const mietwagenSchema = new mongoose.Schema({
    marke: String,
    modell: String,
    kategorie: String,
    standort: String,
    preisProTag: Number,
    getriebe: String,
    kraftstoff: String,
    sitzplaetze: Number,
    verfuegbar: Boolean,
    bildUrl: String
});

const Mietwagen = mongoose.model('Mietwagen', mietwagenSchema);

const mietwagen = [
    {
        marke: "VW",
        modell: "Polo",
        kategorie: "Kleinwagen",
        standort: "Flughafen Palma de Mallorca",
        preisProTag: 29.99,
        getriebe: "Manuell",
        kraftstoff: "Benzin",
        sitzplaetze: 5,
        verfuegbar: true,
        bildUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2"
    },
    {
        marke: "BMW",
        modell: "3er Touring",
        kategorie: "Mittelklasse",
        standort: "Flughafen München",
        preisProTag: 79.00,
        getriebe: "Automatik",
        kraftstoff: "Diesel",
        sitzplaetze: 5,
        verfuegbar: true,
        bildUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e"
    },
    {
        marke: "Tesla",
        modell: "Model 3",
        kategorie: "Oberklasse",
        standort: "Flughafen Berlin (BER)",
        preisProTag: 119.00,
        getriebe: "Automatik",
        kraftstoff: "Elektro",
        sitzplaetze: 5,
        verfuegbar: true,
        bildUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89"
    },
    {
        marke: "Jeep",
        modell: "Wrangler",
        kategorie: "SUV",
        standort: "Flughafen Heraklion",
        preisProTag: 95.50,
        getriebe: "Automatik",
        kraftstoff: "Benzin",
        sitzplaetze: 5,
        verfuegbar: true,
        bildUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf"
    },
    {
        marke: "VW",
        modell: "T6 Multivan",
        kategorie: "Van",
        standort: "Flughafen Innsbruck",
        preisProTag: 109.00,
        getriebe: "Manuell",
        kraftstoff: "Diesel",
        sitzplaetze: 7,
        verfuegbar: true,
        bildUrl: "https://images.unsplash.com/photo-1570733117311-d990c3816c47"
    },
    {
        marke: "Toyota",
        modell: "Yaris Hybrid",
        kategorie: "Kleinwagen",
        standort: "Flughafen Frankfurt",
        preisProTag: 39.90,
        getriebe: "Automatik",
        kraftstoff: "Hybrid",
        sitzplaetze: 5,
        verfuegbar: true,
        bildUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588"
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB verbunden');
        await Mietwagen.deleteMany({});
        const eingefuegt = await Mietwagen.insertMany(mietwagen);
        console.log(`✅ ${eingefuegt.length} Mietwagen eingefügt`);
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Fehler:', error);
    }
}

seed();
