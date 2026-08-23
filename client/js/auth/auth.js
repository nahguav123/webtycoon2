// ==========================================
// JWT TOKEN STORAGE
// ==========================================

const TOKEN_KEY = "token";


// ==========================================
// GET TOKEN
// ==========================================

export function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}


// ==========================================
// SET TOKEN
// ==========================================

export function setToken(token) {

    if (!token) {
        throw new Error(
            "Cannot store an empty authentication token."
        );
    }

    localStorage.setItem(
        TOKEN_KEY,
        token
    );

}


// ==========================================
// REMOVE TOKEN
// ==========================================

export function removeToken() {

    localStorage.removeItem(
        TOKEN_KEY
    );

}


// ==========================================
// CHECK TOKEN
// ==========================================

export function hasToken() {

    return !!getToken();

}