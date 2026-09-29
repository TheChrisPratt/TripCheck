# Project Constitution & Technical Constraints

## Architecture

- Decoupled Client/Server separation.
- Server: RESTful API server.
- Client: Single Page Application (SPA).

## Server Tech Stack

- Language: Java (JDK 21 or later LTS)
- Framework: Spring Boot 3.x
- Database: MySQL 8.x
- Build System: Gradle (Kotlin DSL preferred: `build.gradle.kts`)
- Key Libraries: 
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - MySQL Connector/J

## Client Tech Stack

- Language: TypeScript
- Framework: Angular (Latest stable)
- Build System: Orchestrated via Gradle using the `com.github.node-gradle.node` plugin.

## Project Validation Commands

- To build and test the entire project: `./gradlew build`
- To run backend tests: `./gradlew :server:test`
- To run frontend tests: `./gradlew :client:test`

## Code Guidelines

- Server: Use standard Spring Boot package-by-layer layout.
- Client: Adhere to official Angular style guide guidelines (Strict mode enabled).
- Database: Provide a `docker-compose.yml` for spinning up a local MySQL instance during development.
- All: Maintain consistent code formatting within each file.
