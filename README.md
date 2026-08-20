# Web Tycoon 2 - Main Branch

Web Tycoon 2 is a browser-based website hosting simulation game where players build and manage their own online business. Players can create websites, purchase domains and hosting, manage finances and so on. It was inspired by the original webtycoon that was abandoned by the developers.

> **Development Status:** Web Tycoon is currently under active development.

## Overview

Players will be able to:

* Create and manage their own player account
* Build and manage websites
* Purchase domain names
* Purchase hosting plans
* Manage website expenses
* Generate income from websites from advertising
* Track visitors and website performance

The game is being developed with a server-authoritative architecture so that important game logic and calculations are handled by the backend rather than being trusted to the client.

---

## Stack

### Frontend

* **Vue 3** — User interface
* **Vue Router** — Changes URL and swaps out pages instantly without full page refreshes.
* **Pinia** — Client-side state management
* **Socket.IO Client** — Real-time communication
* **Chart.js** — Charts and statistics
* **Vite** — Frontend development/build tooling

### Backend

* **Node.js** — Server runtime
* **Socket.IO** — Real-time client/server communication
* **MariaDB** — Game database
* **bcrypt** — Password hashing
* **JWT** — Authentication
* **dotenv** — Environment Files for Authentication

### Development

* **Visual Studio Code**
* **Git**
* **GitHub**
* **npm**

---

## Architecture

Web Tycoon is separated into client-side and server-side components.

```text
Web Tycoon
│
├── Client
│   ├── Vue
│   ├── Pinia
│   ├── Socket.IO Client
│   └── UI
│
├── Server
│   ├── Node.js
│   ├── Socket.IO
│   ├── Game Logic
│   ├── Authentication
│   └── Database Access
│
└── Database
    └── MariaDB
```

The server is responsible for authoritative game operations.

The client requests actions from the server, while the server validates the request, performs the required calculations, updates the database, and returns the resulting data.

---

## Project Structure

The project structure is currently being developed and the exact structure may change as development continues.

---

## Database

Web Tycoon uses **MariaDB** for persistent game data.

The database stores information such as:

* Player accounts
* Player game data
* Websites
* Sessions
* Other game-related data

Database access is handled by the server. The client does not directly communicate with MariaDB.

---

## Security

The project uses:

* Password hashing with bcrypt
* Authentication using JWT
* Server-side validation
* Server-side game calculations
* Database-backed player data
* Server-authoritative game state

Sensitive configuration such as database credentials will be stored in environment variables that are not committed to Git.

Example env variable:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=webtycoon
```
---

## Development Setup

### Clone the repository

```bash
git clone https://github.com/nahguav123/webtycoon2.git
cd webtycoon2
```
### Follow Install Instructions.txt

---

## Game Systems

Web Tycoon is being developed around several interconnected game systems.

### Players

Players have accounts containing their identity and game data.

### Money

Players have an in-game economy which is affected by:

* Website income
* Hosting costs
* Domain costs
* Purchases
* Other business expenses

### Websites

Players can create websites and manage their properties.

Websites can generate income based on their performance.

### Hosting

Websites require hosting plans which provide different capabilities and costs.

### Domains

Players can purchase domains for their websites.

### Website Statistics

Websites track statistics such as:

* Visitors
* Income
* Expenses
* Profit
* Other performance metrics

More systems will be added as development continues.

---

## Real-Time Communication

Web Tycoon uses Socket.IO for communication between the client and server.

A simplified interaction looks like:

```text
Client
  │
  │ Request action
  ▼
Socket.IO
  │
  ▼
Server
  │
  ├── Validate request
  ├── Perform game calculations
  ├── Update database
  └── Generate response
  │
  ▼
Socket.IO
  │
  ▼
Client
```

This allows game actions and updates to happen without requiring constant page reloads.

---

## Development Roadmap

The roadmap will change as the game develops.

### Current

* [x] Node.js backend
* [x] Socket.IO communication
* [x] MariaDB database
* [x] Player account creation
* [ ] Password hashing
* [x] Server-side game logic
* [ ] Basic website system
* [ ] Hosting system
* [ ] Domain system
* [ ] Complete authentication system
* [ ] Improved player economy
* [ ] More website types
* [ ] More hosting options
* [ ] More domain options
* [ ] Website upgrades
* [ ] Advertising system
* [ ] Competitors
* [ ] Market system
* [ ] Expanded statistics
* [ ] Achievements
* [ ] Leaderboards
* [ ] More advanced business mechanics
* [ ] Production deployment

---

## License

This project is currently under development.

License information will be added when the project's distribution and licensing model has been finalised.

---

## Development

Web Tycoon is developed by **Vaughan Hathaway** and **...**.

The project is actively being redesigned and improved, so parts of the architecture, database structure, and gameplay systems may change significantly during development.
Note: AI will be used in assisting development but this project is not vibe coded. It has been critically thought about, analysed and planned using a human brain. 
