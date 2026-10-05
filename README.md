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
- **Build combined WAR artifact:**
  ```bash
  ./gradlew :server:bootWar
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

### 1. Run the Backend Server (Development)
Start the Spring Boot backend server with Gradle:
```bash
./gradlew :server:bootRun
```
The REST API server will run at `http://localhost:8081`.

### 2. Run the Frontend Client
You can run the frontend development server via Angular CLI inside the `client` directory:
```bash
cd client
npm install
npm start
```
The Angular SPA will run at `http://localhost:4200`.

---

## WAR File Deployment

The application is configured to build as a unified executable WAR artifact bundling both the Spring Boot REST API and the Angular SPA static assets (`<base href="./">` relative roots for flexible context path deployments).

### 1. Building the WAR Package
Generate the combined WAR artifact using:
```bash
./gradlew :server:bootWar
```
The deployable archive is created at:
`server/build/libs/TripCheck-0.0.1-SNAPSHOT.war`

### 2. Running as a Standalone Executable
Because Spring Boot generates an executable WAR, you can run it directly with `java -jar`:
```bash
java -jar server/build/libs/TripCheck-0.0.1-SNAPSHOT.war
```
Both the SPA and the REST API endpoints will be accessible at `http://localhost:8081`.

### 3. Deploying to an External Servlet Container
You can deploy the WAR to an external servlet container such as Apache Tomcat:
1. **Container Compatibility**: Ensure the servlet container supports Jakarta EE 10 / Servlet 6.0+ (e.g., Apache Tomcat 10.1 or higher) required by Spring Boot 3.x.
2. **Deploy Artifact**: Copy `server/build/libs/TripCheck-0.0.1-SNAPSHOT.war` to the container's deployment directory (e.g., `$CATALINA_BASE/webapps/`).
3. **Context Path Flexibility**: Because the Angular client is configured with relative roots (`<base href="./">`) and relative API endpoints (`api/...`), the application functions whether deployed at the root context (`ROOT.war`) or under any custom context path (e.g. `TripCheck.war` accessible at `http://hostname:port/TripCheck/`).
4. **Environment Variables**: Configure database connection parameters (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`) as container environment variables or JNDI data sources as needed.
