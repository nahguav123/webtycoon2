# Web Tycoon — Installation & Setup

## 1. Download the Project

1. Download the latest ZIP from GitHub.
2. Extract the ZIP to your preferred location.

---

## 2. Install Node.js

Download the latest version of Node.js:

https://nodejs.org/en/download/current

During the Node.js setup, make sure the following are installed:

* Node.js runtime
* npm package manager
* Add to PATH

Verify the installation:

```cmd
node -v
npm -v
```

---

## 3. Install MariaDB

Download the latest MariaDB Server:

https://mariadb.org/download

During the MariaDB setup, make sure the following are installed:

* MariaDB Server
* Database instance
* Client Programs

During database instance setup:

* Set a root username/password. These can be whatever you want.
* Enable **Install as service**
* Enable **Enable networking**
* Use TCP port `3306`

---

## 4. Create the Web Tycoon Database

Open Command Prompt.

Navigate to the MariaDB `bin` folder:

```cmd
cd "C:\Program Files\MariaDB 12.3\bin"
```

> The MariaDB version number may be different.

Log into MariaDB:

```cmd
mariadb -u root -p
```

Enter the root password created during installation.

Create the database and user:

```sql
CREATE DATABASE webtycoon
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE webtycoon;

CREATE USER 'webtycoon'@'localhost'
IDENTIFIED BY 'webpass';

GRANT ALL PRIVILEGES
ON webtycoon.*
TO 'webtycoon'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

> `webpass` is the database password used by the Web Tycoon server. Change it if required, but make sure the same password is used in the server `.env` file.

---

## 5. Import the Database

The database backup should be located at:

```text
server/database/webtycoon/webtycoon.sql
```

Open Command Prompt and navigate to the MariaDB `bin` folder:

```cmd
cd "C:\Program Files\MariaDB 12.3\bin"
```

Import the database:

```cmd
mariadb -u webtycoon -p webtycoon < "C:\...\WebTycoon\server\database\webtycoon\webtycoon.sql"
```

Enter the `webtycoon` database password when prompted.

Check that the tables were imported:

```cmd
mariadb -u root -p
```

Then:

```sql
USE webtycoon;

SHOW TABLES;

EXIT;
```

The Web Tycoon tables should now be listed.

---

## 6. Export the Database — For Developers

To export the current database:

Open Command Prompt and navigate to the MariaDB `bin` folder:

```cmd
cd "C:\Program Files\MariaDB 12.3\bin"
```

Run:

```cmd
mariadb-dump -u webtycoon -p webtycoon > "C:\Users\YourUsername\Downloads\webtycoon.sql"
```

The database backup will be saved as:

```text
webtycoon.sql
```

---

## 7. Install Server Dependencies

Open Command Prompt and navigate to the server directory:

```cmd
cd "C:\...\WebTycoon\server"
```

`package.json` is already included, so **do not run `npm init -y`**.

Install the required packages:

```cmd
npm install socket.io mariadb dotenv bcrypt jsonwebtoken
```

Wait for npm to finish installing the dependencies.

---

## 8. Configure Server Environment Variables

Inside the `server` directory, create a file named:

```text
.env
```

Add:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=webtycoon
DB_PASSWORD=webpass
DB_NAME=webtycoon

JWT_SECRET=YOUR_LONG_RANDOM_SECRET
```

Make sure `DB_PASSWORD` matches the password used when creating the `webtycoon` MariaDB user.

> **Do not upload `.env` to GitHub.**

---

## 9. Install Frontend Dependencies

Open Command Prompt and navigate to the client directory:

```cmd
cd "C:\...\WebTycoon\client"
```

Install the required packages:

```cmd
npm install vue pinia socket.io-client chart.js vue-router vite
```

Wait for npm to finish installing the dependencies.

---

## 10. Run the Game

### Start the Server

Open Command Prompt and navigate to the server directory:

```cmd
cd "C:\...\WebTycoon\server"
```

Start the server:

```cmd
npm run dev
```

The server should start on the configured port.

### Start the Client

Open a **second** Command Prompt window.

Navigate to the client directory:

```cmd
cd "C:\...\WebTycoon\client"
```

Start Vite:

```cmd
npm run dev
```

Vite should start at:

```text
http://localhost:5173
```

Open the address in your browser to access Web Tycoon.

---

## 11. Development Setup

When developing Web Tycoon, you should have two terminals running.

### Terminal 1 — Server

```cmd
cd "C:\...\WebTycoon\server"
npm run dev
```

### Terminal 2 — Client

```cmd
cd "C:\...\WebTycoon\client"
npm run dev
```

Then open:

```text
http://localhost:5173
```
