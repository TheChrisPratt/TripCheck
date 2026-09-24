# Product Requirements Document: TripCheck - Trip Planning Checklist

## 1. System Architecture & Authentication (Passkeys / WebAuthn)

- **Authentication Strategy:** The application uses passwordless Passkeys (WebAuthn) exclusively. No passwords or Google tokens are stored or accepted.
- **IdP:**
  - The application will rely on a local KeyCloak instance.
- **Server Role (Relying Party):**
  - The backend will use Spring Security.
  - The backend must verify that the incoming JWT is authentic. It does this 
    by checking the cryptographic signature against your identity provider's 
    public keys using Spring Security.
  - The backend does not need to call a database or an external server for 
    every single API request. It can decode the JWT locally, read the 
    expiration date, and look at the user's permissions (scopes) instantly.
  - The web frontend will run on a different domain than the Java API. It must 
    be configured to use CORS on the Java backend to explicitly allow requests 
    from the web frontend's domain.
- **Client Role:**
  - Angular collects the user's username/email to initiate the process.
  - It invokes the browser's native WebAuthn API (or `@github/webauthn-json` 
    wrapper) using the challenge provided by the backend.
  - It transmits the public key credential payload back to the backend server
    to complete the login or registration phase.
  - Do not store the Access Tokens in browser localStorage. It is vulnerable 
    to Cross-Site Scripting (XSS) attacks. Instead, store tokens in HttpOnly, 
    Secure, SameSite=Strict cookies. This ensures malicious browser scripts 
    cannot steal the user's login tokens.

## 2. Core Functional Requirements

### A. Data Model
- A Trip record will contain the following fields:
  - Trip name
  - Starting date
  - Ending date
  - List of tasks to do prior to the trip
  - List of tasks to do on the day of departure
  - List of tasks to do on the day of return
  - List of stops that make up the trip
- A Stop record will contain the following fields:
  - Stop name
  - Stop date
  - Stop location
  - Number of nights at the location
  - Web Address
  - Telephone number
  - Confirmation code
  - Site number
  - List of tasks to do on arrival.
  - List of tasks to do on departure.
  - Notes
- A Task record will contain the following fields:
  - Task description
  - Task status

### B. Create a new Trip
- Users must be able to create a new trip to contain the details of their 
  adventure.
- Collects trip name and starting date.
- Exposes REST endpoints to create the trip record in the database.

### C. Add a Pre-trip Task to the Trip
- Users can add new tasks to the list of tasks to do prior to the trip.
- Initial status will be **Incomplete**.

### D. Add a Day of Departure Task to the Trip
- Users can add new tasks to the list of tasks to do on the day of departure.
- Initial status will be **Incomplete**.

### E. Add a Stop to the Trip
- Users can enter the stop name, location, number of nights, web address, 
  telephone number, and optionally the confirmation code and site number 
  during creation.
- Stop date will be calculated based on the previous stop's date and the number of nights.

### F. Add an Arrival task to the Stop
- Users can add new tasks to the list of tasks to do on the day of arrival.
- Initial status will be **Incomplete**.

### G. Add a Departure task to the Stop
- Users can add new tasks to the list of tasks to do on the day of departure.
- Initial status will be **Incomplete**.

### H. Add a Day of Return Task to the Trip
- Users can add new tasks to the list of tasks to do on the day of return.
- Initial status will be **Incomplete**.


## 3. Immediate Bootstrap Directives for Junie

1. Initialize the Angular frontend workspace inside `/client` using 
   Angular CLI commands via Node execution.
2. Formulate a base `SecurityConfig.java` class within `/server` that 
   requires authenticated bearer tokens for all paths under `/api/**`.
3. Provide a working local development environment blueprint 
   containing a `docker-compose.yml` configured for a local MySQL 
   database instance.
