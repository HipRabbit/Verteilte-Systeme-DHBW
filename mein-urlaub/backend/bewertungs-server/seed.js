// Seed-Script: Beispieldaten für Bewertungen einfügen
// Ausführen mit: node seed.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bewertungen';

const bewertungSchema = new mongoose.Schema({
    hotelId: String,
    hotelName: String,
    autor: String,
    sterne: Number,
    kommentar: String,
    datum: { type: Date, default: Date.now }
});

const Bewertung = mongoose.model('Bewertung', bewertungSchema);

const beispielBewertungen = [
    {
        hotelId: "hotel001",
        hotelName: "Hotel Alpenblick",
        autor: "Max Mustermann",
        sterne: 5,
        kommentar: "Traumhafter Ausblick auf die Alpen, sehr freundliches Personal und exzellentes Frühstück!"
    },
    {
        hotelId: "hotel001",
        hotelName: "Hotel Alpenblick",
        autor: "Julia Schmidt",
        sterne: 4,
        kommentar: "Schönes Hotel, nur die Zimmer sind etwas klein. Würde aber wiederkommen."
    },
    {
        hotelId: "hotel002",
        hotelName: "Strandhotel Sonnenschein",
        autor: "Peter Müller",
        sterne: 5,
        kommentar: "Direkt am Strand, perfekt für einen Familienurlaub. Sehr empfehlenswert!"
    },
    {
        hotelId: "hotel003",
        hotelName: "City Hotel Berlin",
        autor: "Anna Weber",
        sterne: 3,
        kommentar: "Zentrale Lage, aber etwas laut. Das Preis-Leistungs-Verhältnis stimmt."
    },
    {
        hotelId: "hotel002",
        hotelName: "Strandhotel Sonnenschein",
        autor: "Thomas Klein",
        sterne: 4,
        kommentar: "Tolles Essen und sauberer Pool. Das Personal war sehr zuvorkommend."
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB verbunden');

        await Bewertung.deleteMany({});
        console.log('🗑️  Alte Daten gelöscht');

        const eingefuegt = await Bewertung.insertMany(beispielBewertungen);
        console.log(`✅ ${eingefuegt.length} Bewertungen eingefügt`);

        await mongoose.disconnect();
        console.log('👋 Verbindung getrennt');
    } catch (error) {
        console.error('❌ Fehler:', error);
    }
}

seed();
