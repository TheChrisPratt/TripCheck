# TripCheck

TripCheck is a trip planning checklist application featuring a decoupled client/server architecture with passwordless WebAuthn/Passkey authentication.

## Architecture & Tech Stack

- **Server**:
  - Java 21 (LTS)
  - Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security, WebAuthn Server Core)
  - MySQL 8.x
  - Gradle (Kotlin DSL)
- **Client**:
  - TypeScript
  - Angular (Single Page Application)
  - Gradle integration via `com.github.node-gradle.node`

---

## Prerequisites

Ensure the following tools are installed on your system:
- **Java Development Kit (JDK)**: Version 21 or later
- **Docker & Docker Compose**: For local MySQL database container
- **Node.js & npm** (optional for standalone client development; Gradle wrapper manages Node via plugin)

---

## Local Development Setup

### 1. Start the Database

Start the local MySQL instance using Docker Compose:

```bash
docker compose up -d
```

This starts a MySQL 8.0 container on port `3306` with the following credentials (configured in `docker-compose.yml`):
- **Database:** `tripcheck_db`
- **Username:** `tripcheck_user`
- **Password:** `tripcheck_pass`
- **Root Password:** `root_password`

To stop the database:
```bash
docker compose down
```

---

## Gradle Build & Test Tasks

Use the Gradle wrapper (`./gradlew` on Linux/macOS or `.\gradlew.bat` on Windows) to run tasks:

### Build and Package
- **Build and test the entire project:**
  ```bash
  ./gradlew build
  ```
- **Build without running tests:**
  ```bash
  ./gradlew assemble
  ```
- **Clean build artifacts:**
  ```bash
  ./gradlew clean
  ```

### Running Tests
- **Run all project tests:**
  ```bash
  ./gradlew test
  ```
- **Run backend tests only:**
  ```bash
  ./gradlew :server:test
  ```
- **Run frontend tests only:**
  ```bash
  ./gradlew :client:test
  ```

---

## Running the Application

### 1. Run the Backend Server
Start the Spring Boot backend server with Gradle:
```bash
./gradlew :server:bootRun
```
The REST API server will run at `http://localhost:8080`.

### 2. Run the Frontend Client
You can run the frontend development server via Angular CLI inside the `client` directory:
```bash
cd client
npm install
npm start
```
The Angular SPA will run at `http://localhost:4200`.
