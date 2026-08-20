import "dotenv/config";
import mariadb from "mariadb";


// ==========================================
// DATABASE CONNECTION
// ==========================================

export const dbpool = mariadb.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,

    user: process.env.DB_USER || "webtycoon",
    password: "webpass", // process.env.DB_PASSWORD ||
    database: process.env.DB_NAME || "webtycoon",

    connectionLimit: 10,

    charset: "utf8mb4",
});


// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

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


// ==========================================
// GET DATABASE CONNECTION - Manual way of .query
// ==========================================

export async function getDbConnection() {

    return await dbpool.getConnection();

}


// ==========================================
// CLOSE DATABASE
// ==========================================

export async function closeDatabase() {

    await dbpool.end();

}