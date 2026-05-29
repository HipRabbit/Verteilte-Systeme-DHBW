// ============================================
// Authentifizierung - Frontend (localStorage)
// ============================================
// Demo-Projekt DHBW Heilbronn — Verteilte Systeme
// Passwörter werden im Klartext in localStorage gespeichert.
// Für produktiven Einsatz wäre ein Backend mit Hashing nötig.
// ============================================

const AUTH = (function() {
    const USERS_KEY   = 'meinUrlaub_users';
    const SESSION_KEY = 'mein-urlaub-auth';

    function getUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
        catch { return []; }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function register(username, anzeigeName, password) {
        if (!username || !anzeigeName || !password)
            return { error: 'Alle Felder müssen ausgefüllt sein.' };
        const users = getUsers();
        if (users.find(u => u.username === username))
            return { error: 'Benutzername bereits vergeben.' };
        // Erster registrierter Nutzer wird automatisch Admin
        const rolle = users.length === 0 ? 'admin' : 'user';
        users.push({ username, anzeigeName, password, rolle });
        saveUsers(users);
        return { success: true };
    }

    function login(username, password) {
        const user = getUsers().find(u => u.username === username && u.password === password);
        if (!user) return null;
        const session = {
            username:    user.username,
            rolle:       user.rolle,
            anzeigeName: user.anzeigeName,
            loginZeit:   new Date().toISOString()
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('cameFromAdmin');
    }

    function getSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function getRolle() {
        const s = getSession();
        return s ? s.rolle : 'gast';
    }

    function istEingeloggt()         { return getSession() !== null; }
    function istAdmin()              { return getRolle() === 'admin'; }
    function darfBewertenSchreiben() { const r = getRolle(); return r === 'user' || r === 'admin'; }
    function darfAdminPanel()        { return getRolle() === 'admin'; }
    function hatNutzer()             { return getUsers().length > 0; }

    return {
        login, logout, register, getSession, getRolle,
        istEingeloggt, istAdmin,
        darfBewertenSchreiben, darfAdminPanel, hatNutzer
    };
})();
