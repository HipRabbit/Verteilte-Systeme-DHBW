const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mietwagen';

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
    bildUrl: String,
    bilder: [String],
    langBeschreibung: String,
    kilometerProTag: Number,
    mindestalter: Number,
    kaution: Number
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
        kilometerProTag: 200,
        mindestalter: 21,
        kaution: 250,
        langBeschreibung: "Der VW Polo ist der ideale Stadtflitzer für Ihren Mallorca-Urlaub. Sparsamer Verbrauch, gute Manövrierfähigkeit und ausreichend Platz für vier Personen plus Gepäck. Perfekt für Erkundungstouren entlang der Küste oder Stadtbummel in Palma.",
        bildUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
            "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800"
        ]
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
        kilometerProTag: 250,
        mindestalter: 23,
        kaution: 500,
        langBeschreibung: "Der BMW 3er Touring vereint sportlichen Fahrspaß mit hohem Komfort und großzügigem Kofferraum. Premium-Soundsystem, Navigationssystem, Klimaautomatik und elektrische Sitzverstellung sind serienmäßig. Ideal für Geschäftsreisen oder Familienurlaube mit Stil.",
        bildUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
            "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800",
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
            "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800"
        ]
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
        kilometerProTag: 300,
        mindestalter: 25,
        kaution: 800,
        langBeschreibung: "Erleben Sie elektrisches Fahren der Zukunft mit dem Tesla Model 3. Reichweite bis zu 600 km, Beschleunigung von 0-100 km/h in unter 6 Sekunden, Autopilot-Funktion und Zugang zum Tesla-Supercharger-Netzwerk inklusive. Großer 15-Zoll-Touchscreen und Premium-Audio.",
        bildUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
            "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=800",
            "https://images.unsplash.com/photo-1617704548623-340376564e68?w=800"
        ]
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
        kilometerProTag: 250,
        mindestalter: 25,
        kaution: 700,
        langBeschreibung: "Der Jeep Wrangler ist DAS Off-Road-Fahrzeug für Abenteurer. Allradantrieb, hohe Bodenfreiheit und das ikonische Design machen ihn zum perfekten Begleiter für Erkundungstouren auf Kreta - sei es entlang der Küste oder ins bergige Hinterland. Abnehmbares Verdeck für offenes Fahrgefühl.",
        bildUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
            "https://images.unsplash.com/photo-1601772230213-89a4eb02bb39?w=800",
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"
        ]
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
        kilometerProTag: 250,
        mindestalter: 23,
        kaution: 600,
        langBeschreibung: "Der VW T6 Multivan ist die ideale Wahl für Großfamilien oder Sportbegeisterte mit viel Gepäck. Bis zu 7 Sitzplätze, flexibler Innenraum mit verschiebbaren Sitzen, ausreichend Platz für Skiausrüstung oder Mountainbikes. Klimaautomatik im Fond und Standheizung serienmäßig.",
        bildUrl: "https://images.unsplash.com/photo-1570733117311-d990c3816c47?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1570733117311-d990c3816c47?w=800",
            "https://images.unsplash.com/photo-1633545495735-25df17fb9f31?w=800",
            "https://images.unsplash.com/photo-1597007030739-6d2e7172ee2e?w=800"
        ]
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
        kilometerProTag: 200,
        mindestalter: 21,
        kaution: 300,
        langBeschreibung: "Der Toyota Yaris Hybrid kombiniert die Wendigkeit eines Kleinwagens mit der Effizienz eines Hybrid-Antriebs. Verbrauch von nur 3,8 Liter auf 100 km, automatischer Wechsel zwischen Verbrenner und Elektromotor. Perfekt für Stadt- und Überlandfahrten, sehr komfortabel und leise.",
        bildUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
            "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
            "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800"
        ]
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
