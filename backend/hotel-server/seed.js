const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotels';

const hotelSchema = new mongoose.Schema({
    name: String,
    stadt: String,
    land: String,
    sterne: Number,
    preisProNacht: Number,
    beschreibung: String,
    ausstattung: [String],
    bildUrl: String,
    erstelltAm: { type: Date, default: Date.now }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

const hotels = [
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
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB verbunden');
        await Hotel.deleteMany({});
        const eingefuegt = await Hotel.insertMany(hotels);
        console.log(`✅ ${eingefuegt.length} Hotels eingefügt`);
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Fehler:', error);
    }
}

seed();
