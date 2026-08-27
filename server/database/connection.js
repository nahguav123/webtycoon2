/*
PURPOSE: Connects the server to MariaDB.

INPUT: Database environment variables.
OUTPUT: Shared database connection pool.
FUNCTIONS: testDatabaseConnection(), getDbConnection(), closeDatabase().
DATA: dbpool.
*/


import "dotenv/config";
import mariadb from "mariadb";


// Database connection - dbpool
export const dbpool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),

    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    connectionLimit: 10,

    charset: "utf8mb4",
});


// Function for testing database connection
export async function testDatabaseConnection() {
    let connection;

    try {
        connection = await dbpool.getConnection();
        console.log("MariaDB connected successfully.");

    } catch (error) {
        console.error("MariaDB connection failed:");
        console.error(error);

        throw error;

    } finally {
        if (connection) {
            connection.release();
        }
    }
}


// Get database connection - manual way of .query, requires closing
export async function getDbConnection() {

    return await dbpool.getConnection();

}


// Close database connection
export async function closeDatabase() {

    await dbpool.end();

}