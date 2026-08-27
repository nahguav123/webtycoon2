/*
PURPOSE: Stores and manages the JWT.

INPUT: JWT token.
OUTPUT: Stored/retrieved/removed JWT.
FUNCTIONS: getToken(), setToken(), removeToken(), hasToken().
DATA: JWT in localStorage.
*/


const TOKEN_KEY = "token";

// Gets token from localStoreage
export function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}

// Adds token to localStorage
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

// Removes token from localStorage
export function removeToken() {

    localStorage.removeItem(
        TOKEN_KEY
    );

}

// Checks if token exists
export function hasToken() {

    return !!getToken();

}