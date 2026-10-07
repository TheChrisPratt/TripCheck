**Root Cause**

The error `TypeError: Cannot read properties of undefined (reading 'create')` occurs because **WebAuthn (Passkeys / Credential Management API) requires a Secure Context (`isSecureContext === true`)**.

In web browsers:
- `navigator.credentials` is only defined and available when the web page is loaded in a **Secure Context** (such as `https://...` or `http://localhost` / `http://127.0.0.1`).
- When accessing the application from another computer over plain HTTP using an IP address or LAN domain (e.g., `http://10.0.0.58:8081`), modern browsers (Chrome, Edge, Safari, Firefox) classify the connection as **insecure** and intentionally disable `window.navigator.credentials` for security reasons.
- When `@github/webauthn-json` invokes `navigator.credentials.create(...)` in `auth.service.ts`, `navigator.credentials` is `undefined`, triggering the error.

---

**Additional Consideration: Relying Party (RP) ID & Origin Configuration**

Even after establishing a secure context, WebAuthn mandates that the **Relying Party ID** (`rpId`) and **Origin** sent by the server match the URL in the browser's address bar.

Currently in `../server/src/main/resources/application.yml`:
```yaml
app:
  webauthn:
    rp-id: "localhost"
    rp-name: "TripCheck"
    origin: "http://localhost:4200"
```
When running on `10.0.0.58`, the backend configuration must match the hostname/IP used to access the site.

---

**Solutions**

**Solution 1: Use SSH Local Port Forwarding (Quickest for Development)**

If you are developing or testing from another computer and want to avoid setting up SSL certificates or changing browser flags:
1. Run an SSH tunnel on the remote client machine to forward port `8081`:
   ```bash
   ssh -L 8081:localhost:8081 user@10.0.0.58
   ```
2. Open `http://localhost:8081` in the browser on that remote computer.
3. Because the browser accesses the app through `localhost`, it is recognized as a secure context and works with the default `rp-id: "localhost"`.

---

**Solution 2: Browser Insecure Origin Bypass (For Local LAN Testing)**

Chromium-based browsers (Chrome, Edge, Brave) allow whitelisting specific HTTP origins as secure for development purposes:
1. On the client computer, navigate to:
   - Chrome: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   - Edge: `edge://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add `http://10.0.0.58:8081` to the text box and set the dropdown to **Enabled**.
3. Relaunch the browser.
4. Pass the appropriate RP ID and Origin to the backend when starting the server:
   ```bash
   java -Dapp.webauthn.rp-id=10.0.0.58 -Dapp.webauthn.origin=http://10.0.0.58:8081 -jar TripCheck-0.0.1-SNAPSHOT.war
   ```
   *(or set `APP_WEBAUTHN_RP_ID=10.0.0.58` and `APP_WEBAUTHN_ORIGIN=http://10.0.0.58:8081` environment variables)*.

---

**Solution 3: Enable HTTPS / TLS (Recommended for Production & Staging)**

Configure HTTPS so that connections from other machines are natively secure:
1. **Reverse Proxy (Nginx / Caddy / Traefik)**: Put a reverse proxy with an SSL certificate (e.g., Let's Encrypt or a local CA certificate using `mkcert`) in front of port `8081`.
2. **Spring Boot Embedded SSL**: Configure an SSL keystore in `application.yml`:
   ```yaml
   server:
     ssl:
       key-store: "classpath:keystore.p12"
       key-store-password: "your-password"
       key-store-type: "PKCS12"
       key-alias: "tripcheck"
   ```
3. Set `app.webauthn.rp-id` to your domain/hostname and `app.webauthn.origin` to `https://<your-domain-or-ip>:8081`.
