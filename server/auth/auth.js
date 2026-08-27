/*
PURPOSE: Creates and verifies JWTs.

INPUT: userid or JWT.
OUTPUT: Signed JWT or verified payload.
FUNCTIONS: generateToken(), verifyToken().
DATA: JWT_SECRET.
*/


import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET;


if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
}


export function generateToken(userid) {
    return jwt.sign(
        {
            userid: Number(userid)
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

export function verifyToken(token) {

    if (!token) {
        throw new Error("Authentication token is required.");
    }

    return jwt.verify(
        token,
        JWT_SECRET
    );

}