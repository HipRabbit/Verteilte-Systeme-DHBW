const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotels';

const hotelSchema = new mongoose.Schema({
    name: String,
    stadt: String,
    land: String,
    sterne: Number,
    preisProNacht: Number,
    beschreibung: String,
    ausstattung: [String],
    bildUrl: String,
    bilder: [String],
    langBeschreibung: String,
    highlights: [String],
    adresse: String,
    webseite: String,
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
        langBeschreibung: "Inmitten der atemberaubenden Bergwelt der Bayerischen Alpen erwartet Sie das Hotel Alpenblick. Seit über 40 Jahren wird das Haus liebevoll als Familienbetrieb geführt. Genießen Sie regionale Spezialitäten in unserem gemütlichen Restaurant, entspannen Sie im Wellnessbereich mit Sauna und Whirlpool oder starten Sie direkt vor der Haustür zu zahlreichen Wanderungen. Die Zimmer sind im alpinen Stil eingerichtet und bieten allen Komfort für einen erholsamen Aufenthalt.",
        ausstattung: ["WLAN", "Frühstück", "Wellnessbereich", "Parkplatz"],
        highlights: ["Direkter Bergblick", "Hauseigener Wellnessbereich", "Regionale Küche", "Familiengeführt seit 1985", "5 Min. zur Zugspitzbahn"],
        adresse: "Bergstraße 14, 82467 Garmisch-Partenkirchen",
        webseite: "https://www.hotel-alpenblick-beispiel.de",
        bildUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
            "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800"
        ]
    },
    {
        name: "Strandhotel Sonnenschein",
        stadt: "Palma de Mallorca",
        land: "Spanien",
        sterne: 5,
        preisProNacht: 249,
        beschreibung: "Luxuriöses Strandhotel direkt am Mittelmeer mit Pool, Spa und mehreren Restaurants.",
        langBeschreibung: "Erleben Sie unvergesslichen Urlaub im 5-Sterne-Strandhotel Sonnenschein. Direkt am goldenen Sandstrand der Bucht von Palma gelegen, bietet das Hotel einen 800 m² großen Außenpool, ein hochmodernes Spa mit 8 Behandlungsräumen sowie drei Restaurants mit internationaler und mediterraner Küche. Alle Zimmer verfügen über einen Balkon mit Meerblick. Genießen Sie die Annehmlichkeiten unseres All-Inclusive-Konzepts.",
        ausstattung: ["WLAN", "All-Inclusive", "Pool", "Spa", "Strandzugang"],
        highlights: ["Direkt am Sandstrand", "3 Restaurants", "800 m² Außenpool", "Spa mit 8 Behandlungsräumen", "Alle Zimmer mit Meerblick", "All-Inclusive verfügbar"],
        adresse: "Avinguda Joan Miró 305, 07181 Palma de Mallorca",
        webseite: "https://www.strandhotel-sonnenschein-beispiel.es",
        bildUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"
        ]
    },
    {
        name: "City Hotel Berlin",
        stadt: "Berlin",
        land: "Deutschland",
        sterne: 3,
        preisProNacht: 99,
        beschreibung: "Modernes City-Hotel in zentraler Lage, perfekt für Städtereisen und Geschäftsreisende.",
        langBeschreibung: "Mitten im Herzen Berlins, nur wenige Schritte vom Alexanderplatz entfernt, liegt das City Hotel Berlin. Modern, funktional und mit allem ausgestattet, was man als Städtereisender oder Geschäftsreisender braucht: schnelles WLAN, ein gut ausgestattetes Fitnessstudio (24/7 geöffnet), eine stylische Bar und ein reichhaltiges Frühstücksbüfett. Die Berliner U-Bahn-Linien 2, 5 und 8 sind in 5 Gehminuten erreichbar.",
        ausstattung: ["WLAN", "Frühstück", "Fitness", "Bar"],
        highlights: ["5 Min. zum Alexanderplatz", "24/7 Fitnessstudio", "Frühstücksbuffet", "Bar mit Snacks", "U-Bahn-Anschluss"],
        adresse: "Karl-Liebknecht-Straße 5, 10178 Berlin",
        webseite: "https://www.cityhotel-berlin-beispiel.de",
        bildUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
        ]
    },
    {
        name: "Bergresort Tirol",
        stadt: "Innsbruck",
        land: "Österreich",
        sterne: 4,
        preisProNacht: 189,
        beschreibung: "Gemütliches Bergresort mit direktem Zugang zu Ski- und Wanderpisten in den Tiroler Alpen.",
        langBeschreibung: "Das Bergresort Tirol ist ein Ganzjahresparadies: Im Winter geht es direkt aus dem Hotel auf die Piste (Ski-In/Ski-Out), im Sommer beginnen die Wanderwege wenige Schritte von der Tür. Das Haus verfügt über einen großzügigen Spa-Bereich mit Sauna, Dampfbad und Hallenbad. Halbpension mit regionaler Tiroler Küche ist im Preis inbegriffen. Skiverleih und -depot direkt im Haus.",
        ausstattung: ["WLAN", "Halbpension", "Sauna", "Skiverleih", "Parkplatz"],
        highlights: ["Ski-In/Ski-Out", "Hallenbad und Sauna", "Halbpension inklusive", "Skiverleih im Haus", "Wanderwege vor der Tür"],
        adresse: "Bergweg 22, 6020 Innsbruck",
        webseite: "https://www.bergresort-tirol-beispiel.at",
        bildUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
            "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800",
            "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"
        ]
    },
    {
        name: "Inselparadies Kreta",
        stadt: "Heraklion",
        land: "Griechenland",
        sterne: 5,
        preisProNacht: 279,
        beschreibung: "Exklusives Resort auf der Insel Kreta mit privatem Strand und mediterranem Flair.",
        langBeschreibung: "Das Inselparadies Kreta ist ein 5-Sterne-Resort der Extraklasse. Auf einem 3 Hektar großen Anwesen mit eigenem Privatstrand bieten wir Ihnen drei Pools (einen davon mit Meerwasser), einen mediterranen Garten, fünf Restaurants und einen umfassenden Spa-Komplex. Die Suiten sind im traditionell griechisch-modernen Stil gestaltet und bieten alle einen privaten Balkon. Ideal für Genießer, Sportler und Familien.",
        ausstattung: ["WLAN", "All-Inclusive", "Pool", "Strand", "Spa", "Tennis"],
        highlights: ["Privater Sandstrand", "3 Pools (1 mit Meerwasser)", "5 Restaurants", "Tennisplätze", "3 ha Gartenanlage", "Großer Spa-Bereich"],
        adresse: "Paralia 12, 71500 Heraklion, Kreta",
        webseite: "https://www.inselparadies-kreta-beispiel.gr",
        bildUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        bilder: [
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
            "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
        ]
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
