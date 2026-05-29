const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flugverbindungen';

const flugSchema = new mongoose.Schema({
    flugnummer: String,
    airline: String,
    abflughafen: String,
    zielflughafen: String,
    abflugzeit: Date,
    ankunftszeit: Date,
    preis: Number,
    klasse: String,
    freiePlaetze: Number
});

const Flug = mongoose.model('Flug', flugSchema);

const fluege = [
    {
        flugnummer: "LH1234",
        airline: "Lufthansa",
        abflughafen: "Frankfurt (FRA)",
        zielflughafen: "Palma de Mallorca (PMI)",
        abflugzeit: new Date("2026-07-15T08:30:00"),
        ankunftszeit: new Date("2026-07-15T11:00:00"),
        preis: 189.99,
        klasse: "Economy",
        freiePlaetze: 42
    },
    {
        flugnummer: "LH5678",
        airline: "Lufthansa",
        abflughafen: "München (MUC)",
        zielflughafen: "Heraklion (HER)",
        abflugzeit: new Date("2026-08-02T06:15:00"),
        ankunftszeit: new Date("2026-08-02T10:30:00"),
        preis: 219.50,
        klasse: "Economy",
        freiePlaetze: 28
    },
    {
        flugnummer: "EW9012",
        airline: "Eurowings",
        abflughafen: "Stuttgart (STR)",
        zielflughafen: "Berlin (BER)",
        abflugzeit: new Date("2026-06-10T14:00:00"),
        ankunftszeit: new Date("2026-06-10T15:20:00"),
        preis: 89.00,
        klasse: "Economy",
        freiePlaetze: 55
    },
    {
        flugnummer: "OS3456",
        airline: "Austrian Airlines",
        abflughafen: "Frankfurt (FRA)",
        zielflughafen: "Innsbruck (INN)",
        abflugzeit: new Date("2026-12-20T09:45:00"),
        ankunftszeit: new Date("2026-12-20T11:10:00"),
        preis: 149.90,
        klasse: "Economy",
        freiePlaetze: 18
    },
    {
        flugnummer: "LH7890",
        airline: "Lufthansa",
        abflughafen: "Hamburg (HAM)",
        zielflughafen: "München (MUC)",
        abflugzeit: new Date("2026-09-05T17:30:00"),
        ankunftszeit: new Date("2026-09-05T18:45:00"),
        preis: 129.00,
        klasse: "Business",
        freiePlaetze: 12
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB verbunden');
        await Flug.deleteMany({});
        const eingefuegt = await Flug.insertMany(fluege);
        console.log(`✅ ${eingefuegt.length} Flüge eingefügt`);
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Fehler:', error);
    }
}

seed();
