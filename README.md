# Web Tycoon 2

Web Tycoon 2 is a browser-based business simulation game where players build and manage their own online businesses. Players can create websites, purchase domains and hosting, manage finances and so on. It was inspired by the original webtycoon that was abandoned by the developers.

> 🚧 **Development Status:** Web Tycoon is currently under active development.

## 🎮 Overview

Web Tycoon is designed around the idea of running an online business from the ground up.

Players will be able to:

* Create and manage their own player account
* Build and manage websites
* Purchase domain names
* Purchase hosting plans
* Manage website expenses
* Generate income from websites
* Track visitors and website performance
* Manage their virtual money
* Expand their online business
* Make decisions that affect the growth and profitability of their business

The game is being developed with a server-authoritative architecture so that important game logic and calculations are handled by the backend rather than being trusted to the client.

---

## Stack

### Frontend

* **Vue 3** — User interface
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

### Development

* **Visual Studio Code**
* **Git**
* **GitHub**
* **npm**

---

## 🏗️ Architecture

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

This helps prevent players from manipulating important game values through browser developer tools.

---

## Project Structure

The project structure is currently being developed and the exact structure may change as development continues.

---

## Database

Web Tycoon uses **MariaDB** for persistent game data.

The database stores information such as:

* Player accounts
* Player game data
* Money
* Websites
* Website statistics
* Hosting information
* Domain information
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

Sensitive configuration such as database credentials will eventually be stored in environment variables rather than committed to Git.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=webtycoon
```
---

## Development Setup

### Requirements

Before running Web Tycoon locally, install:

* Node.js
* npm
* MariaDB
* Git

### Clone the repository

```bash
git clone https://github.com/nahguav123/webtycoon2.git
cd webtycoon2
```

### Install dependencies

Install the required npm packages in the relevant project directories.

```bash
npm install
```

### Configure environment variables

Create a `.env` file containing your local database and server configuration.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=webtycoon
```

### Start the server

```bash
npm start
```

The exact commands may change as the project development structure evolves.

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
* [x] Password hashing
* [x] Server-side game logic
* [x] Basic website system
* [x] Hosting system
* [x] Domain system

### Planned

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

## Project Goals

The main goal of Web Tycoon is to create a deep browser-based business simulation while keeping the game architecture secure, scalable, and maintainable.

* JavaScript
* Vue
* Node.js
* SQL
* MariaDB
* WebSockets
* Server architecture
* Authentication
* Database design
* Git
* Software architecture

---

## License

This project is currently under development.

License information will be added when the project's distribution and licensing model has been finalised.

---

## Development

Web Tycoon is developed by **Vaughan Hathaway** and **...**.

The project is actively being redesigned and improved, so parts of the architecture, database structure, and gameplay systems may change significantly during development.
Note: AI will be used in assisting development but in no way is this project vibe coded. It has been critically thought about, analysed and planned using a human brain. 
