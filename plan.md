# TripCheck Implementation Plan

## 1. Overview & Architecture Summary

TripCheck is a decoupled full-stack trip planning and checklist application.
- **Backend (`/server`):** Java 21, Spring Boot 3.4.x, Spring Data JPA, Spring Security, MySQL 8.x, package-by-feature layout.
- **Frontend (`/client`):** Angular (Latest stable), TypeScript (Strict mode enabled), WebAuthn (Passkeys) passwordless auth with HttpOnly cookie tokens.
- **Infrastructure:** Root-level `docker-compose.yml` managing local MySQL 8 container (and Keycloak IdP integration).
- **Build System:** Gradle multi-project Kotlin DSL (`build.gradle.kts`), orchestrating the Angular build via `com.github.node-gradle.node`.

---

## 2. Environment & Infrastructure Setup

### Target Configuration
- **Database:** MySQL 8 running on port `3306`, database `tripcheck_db`, user `tripcheck_user`, password `tripcheck_pass`.
- **Identity Provider (IdP):** Keycloak running locally on port `8080` (or configured mock/WebAuthn RP for local dev) providing public key / JWKS for JWT signature verification.

### Files to Create / Configure
- `docker-compose.yml` — Container services for MySQL 8 and Keycloak.
- `server/src/main/resources/application.yml` — Spring Boot database connection, JPA/Hibernate settings, JWT JWKS issuer URI, CORS config.
- `server/src/main/resources/application-test.yml` — H2/Testcontainers profile for server test execution.

---

## 3. Step-by-Step Implementation Sequence

### Phase 1: Project Scaffolding & Local Infrastructure
1. **Create `docker-compose.yml`** at the project root with MySQL 8 service and health check.
2. **Initialize Spring Boot Resource Configurations** in `server/src/main/resources/application.yml` and `server/src/main/resources/application-dev.yml`.
3. **Initialize Angular Frontend Workspace** in `client/` using Angular CLI (standalone components, routing, strict mode, SCSS/CSS).
4. **Update `client/build.gradle.kts`** to configure npm scripts (`npm run build`, `npm run test`) and test execution hooks.

### Phase 2: Security & Authentication (WebAuthn / Passkeys & JWT)
1. **CORS Configuration:** Configure `CorsConfigurationSource` to allow requests from the Angular client origin (`http://localhost:4200` by default).
2. **Token & Cookie Management:** Implement JWT cookie resolver to extract access tokens from `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
3. **Security Configuration (`SecurityConfig.java`):**
   - Require authentication for all endpoints under `/api/**`.
   - Permit public access to authentication endpoints (e.g., `/api/auth/webauthn/**`, `/actuator/health`).
   - Validate JWT cryptographic signature against Keycloak JWKS public keys.
   - Stateless session management (`SessionCreationPolicy.STATELESS`).
4. **WebAuthn Relying Party Service & Controller:**
   - Registration challenge/response handling (`/api/auth/webauthn/register-request`, `/api/auth/webauthn/register-finish`).
   - Authentication challenge/response handling (`/api/auth/webauthn/login-request`, `/api/auth/webauthn/login-finish`).
   - Issue HttpOnly cookie containing JWT upon successful verification.

### Phase 3: Backend Domain Model & Persistence (Package-by-Feature)
1. **Package Structure:**
   - `com.anodyzed.tripcheck.model`
   - `com.anodyzed.tripcheck.services`
   - `com.anodyzed.tripcheck.security`
   - `com.anodyzed.tripcheck.repositories`
   - `com.anodyzed.tripcheck.resources`
   - `com.anodyzed.tripcheck.util`
2. **Entities:**
   - `Task`: ID, description (`String`), status (`TaskStatus` enum: `INCOMPLETE`, `COMPLETED`), task category/type (`PRE_TRIP`, `DEPARTURE_DAY`, `RETURN_DAY`, `STOP_ARRIVAL`, `STOP_DEPARTURE`), parent references.
   - `Stop`: ID, name, stopDate (`LocalDate`), location, numberOfNights (`Integer`), webAddress, telephoneNumber, confirmationCode, siteNumber, notes, arrival tasks, departure tasks, trip reference, order index.
   - `Trip`: ID, name, startingDate (`LocalDate`), endingDate (`LocalDate`), pre-trip tasks, day-of-departure tasks, day-of-return tasks, ordered list of stops, owner userId.
3. **Date Calculation & Domain Logic:**
   - Stop date calculation engine: `Stop[0].date = Trip.startingDate`, `Stop[i].date = Stop[i-1].date + Stop[i-1].numberOfNights`.
   - Trip ending date calculation: `Trip.endingDate = Stop[last].date + Stop[last].numberOfNights` (or starting date if no stops).
4. **JPA Repositories:**
   - `TripRepository` (with user isolation queries)
   - `StopRepository`
   - `TaskRepository`

### Phase 4: Backend Service & REST API Layer
1. **DTOs & Request/Response Models:**
   - `CreateTripRequest`, `TripSummaryResponse`, `TripDetailResponse`
   - `CreateStopRequest`, `StopResponse`
   - `CreateTaskRequest`, `UpdateTaskStatusRequest`, `TaskResponse`
2. **Services & Business Logic:**
   - `TripService`: Create trip, retrieve trip details, recalculate stop dates & trip end date.
   - `StopService`: Add stop to trip, recompute stop dates sequentially, add arrival/departure tasks.
   - `TaskService`: Add pre-trip, departure-day, return-day tasks to trip; add arrival/departure tasks to stop; toggle task completion status.
3. **Resources (REST Endpoints):**
   - `POST /api/trips` — Create a new trip (name, starting date).
   - `GET /api/trips` — List user's trips.
   - `GET /api/trips/{id}` — Get full trip details including stops and tasks.
   - `POST /api/trips/{tripId}/tasks/pre-trip` — Add pre-trip task (status initialized to `INCOMPLETE`).
   - `POST /api/trips/{tripId}/tasks/departure-day` — Add day of departure task.
   - `POST /api/trips/{tripId}/tasks/return-day` — Add day of return task.
   - `POST /api/trips/{tripId}/stops` — Add stop to trip (recalculates stop dates).
   - `POST /api/stops/{stopId}/tasks/arrival` — Add arrival task to stop.
   - `POST /api/stops/{stopId}/tasks/departure` — Add departure task to stop.
   - `PATCH /api/tasks/{taskId}/status` — Update task status.
4. **Exception Handling & Validation:**
   - Global exception handler (`@RestControllerAdvice`) returning standardized problem details (`RFC 7807`).

### Phase 5: Frontend Architecture & UI Components (Angular)
1. **Core / Auth Module:**
   - `AuthService`: WebAuthn registration and login handling using `@github/webauthn-json` or browser WebAuthn API; `withCredentials: true` for cookie transport.
   - `AuthGuard`: Route guard checking authentication state.
   - `HttpErrorInterceptor`: Handle 401/403 and API errors.
2. **Models / Interfaces:**
   - `Trip`, `Stop`, `Task`, `TaskStatus`, `CreateTripDto`, `CreateStopDto`, `CreateTaskDto`.
3. **Components & Views:**
   - `LoginComponent` / `RegisterPasskeyComponent`: Passwordless login interface with username/email input.
   - `TripListComponent`: Overview of user trips with "Create Trip" button.
   - `TripCreateComponent`: Form to input trip name and starting date.
   - `TripDetailComponent`: Master view showing trip dates, pre-trip checklist, departure-day checklist, stops timeline, and return-day checklist.
   - `StopCardComponent`: Display stop details (location, nights, contact, confirmation, calculated stop date), arrival tasks, and departure tasks.
   - `TaskItemComponent`: Interactive checklist item to toggle Incomplete/Complete status.
   - `AddTaskModalComponent`: Reusable component/dialog to add tasks to corresponding checklists.
   - `AddStopModalComponent`: Form to capture stop details (name, location, nights, phone, web address, confirmation code, site number, notes).

### Phase 6: Automated Testing & Verification
1. **Backend Tests:**
   - `SecurityConfigTest`: Verify unauthenticated requests to `/api/**` return 401/403.
   - `TripServiceTest` & `StopServiceTest`: Unit tests for date calculation algorithms and entity state transitions.
   - `TripResourceTest` (MockMvc): Integration tests verifying request validation, endpoint contracts, and status defaults.
2. **Frontend Tests:**
   - Angular component unit tests (`*.spec.ts`) for `TripCreateComponent`, `TripDetailComponent`, `StopCardComponent`, and `TaskItemComponent`.
   - `AuthService` and `TripService` unit tests mocking `HttpClient`.
3. **Build & Full Pipeline Verification:**
   - Verify `./gradlew :server:test` passes.
   - Verify `./gradlew :client:test` passes.
   - Verify `./gradlew build` builds both server jar and client bundle cleanly.

---

## 4. Sequence of Files to Create

```
TripCheck/
├── docker-compose.yml
├── server/
│   └── src/
│       ├── main/
│       │   ├── java/com/anodyzed/tripcheck/
│       │   │   ├── TripCheckApplication.java
│       │   │   ├── util/
│       │   │   │   ├── exception/GlobalExceptionHandler.java
│       │   │   │   └── exception/ResourceNotFoundException.java
│       │   │   ├── security/
│       │   │   │   ├── config/SecurityConfig.java
│       │   │   │   ├── config/CorsConfig.java
│       │   │   │   ├── cookie/JwtCookieAuthenticationFilter.java
│       │   │   │   └── auth/WebAuthnController.java
│       │   │   ├── model/
│       │   │   │   ├── Trip.java
│       │   │   │   ├── Stop.java
│       │   │   |   ├── Task.java
│       │   │   |   ├── TaskStatus.java
│       │   │   |   └── TaskCategory.java
│       │   │   ├── repository/
│       │   │   │   ├── TripRepository.java
│       │   │   │   ├── StopRepository.java
│       │   │   |   └── TaskRepository.java
│       │   │   ├── services/
│       │   │   │   ├── TripService.java
│       │   │   │   ├── StopService.java
│       │   │   |   └── TaskService.java
│       │   │   ├── resources/
│       │   │   │   ├── TripResource.java
│       │   │   │   ├── StopResource.java
│       │   │   |   └── TaskResource.java
│       │   │   └── task/
│       │   │       ├── dto/CreateTripRequest.java
│       │   │       ├── dto/StopResponse.java
│       │   │       ├── dto/TripDetailResponse.java
│       │   │       ├── dto/CreateStopRequest.java
│       │   │       └── dto/CreateTaskRequest.java
│       │   └── resources/
│       │       ├── application.yml
│       │       └── application-dev.yml
│       └── test/
│           ├── java/com/anodyzed/tripcheck/
│           │   ├── security/SecurityConfigTest.java
│           │   ├── trip/TripServiceTest.java
│           │   ├── trip/TripResourceTest.java
│           │   └── stop/StopCalculationTest.java
│           └── resources/
│               └── application-test.yml
└── client/
    ├── package.json
    ├── angular.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.spec.json
    ├── src/
    │   ├── index.html
    │   ├── main.ts
    │   ├── styles.scss
    │   └── app/
    │       ├── app.config.ts
    │       ├── app.routes.ts
    │       ├── app.component.ts
    │       ├── core/
    │       │   ├── auth/auth.service.ts
    │       │   ├── auth/auth.guard.ts
    │       │   └── interceptors/auth.interceptor.ts
    │       ├── models/
    │       │   ├── trip.model.ts
    │       │   ├── stop.model.ts
    │       │   └── task.model.ts
    │       ├── services/
    │       │   └── trip.service.ts
    │       └── features/
    │           ├── auth/login.component.ts
    │           ├── trips/
    │           │   ├── trip-list/trip-list.component.ts
    │           │   ├── trip-create/trip-create.component.ts
    │           │   └── trip-detail/trip-detail.component.ts
    │           ├── stops/
    │           │   ├── stop-card/stop-card.component.ts
    │           │   └── stop-modal/stop-modal.component.ts
    │           └── tasks/
    │               ├── task-item/task-item.component.ts
    │               └── task-modal/task-modal.component.ts
```

---

## 5. Sequence of Commands to Run

### Infrastructure & Database
```powershell
# 1. Start local MySQL database (and Keycloak if configured)
docker-compose up -d
```

### Frontend Initialization & Client Tasks
```powershell
# 2. Initialize Angular CLI workspace inside /client
cd client
npx -y @angular/cli@latest new tripcheck-client --directory . --style scss --routing --strict --skip-git
npm install @github/webauthn-json
cd ..

# 3. Run client tests via Gradle
./gradlew :client:test
```

### Backend Verification & Full Build
```powershell
# 4. Run backend tests
./gradlew :server:test

# 5. Build and verify full multi-project build (client + server)
./gradlew build
```
