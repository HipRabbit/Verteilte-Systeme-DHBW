// ============================================
// Authentifizierung - Frontend (Demo)
// ============================================
// HINWEIS: Diese Authentifizierung dient ausschließlich
// Demo-Zwecken. Sie ist NICHT für produktiven Einsatz
// geeignet, da Benutzerdaten im Klartext im Frontend
// liegen. Für eine echte Anwendung müssten Passwörter
// gehasht im Backend gespeichert und JWT-Tokens
// verwendet werden.
// ============================================

const AUTH = (function() {
    // Demo-Benutzerkonten (nur User-Rolle)
    const USERS = [
        { username: 'maria',  password: 'maria123',  anzeigeName: 'Maria Schmidt' },
        { username: 'thomas', password: 'thomas123', anzeigeName: 'Thomas Weber' }
    ];

    const STORAGE_KEY = 'mein-urlaub-auth';

    function login(username, password) {
        const user = USERS.find(u => u.username === username && u.password === password);
        if (!user) return null;
        const session = {
            username: user.username,
            anzeigeName: user.anzeigeName,
            loginZeit: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        return session;
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('cameFromAdmin');
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function istEingeloggt() {
        return getSession() !== null;
    }

    // Rolle: 'user' wenn eingeloggt, 'gast' sonst
    function getRolle() {
        return istEingeloggt() ? 'user' : 'gast';
    }

    function darfBewertenSchreiben() {
        return istEingeloggt();
    }

    function getDemoUsers() {
        return USERS.map(u => ({ username: u.username, anzeigeName: u.anzeigeName }));
    }

    return {
        login, logout, getSession, getRolle,
        istEingeloggt, darfBewertenSchreiben,
        getDemoUsers
    };
})();
