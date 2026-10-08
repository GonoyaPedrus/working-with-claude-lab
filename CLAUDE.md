# CLAUDE.md
- App: `ops-dashboard`, Marlowe & Finch's ops wall-screen. Java 17 / Spring Boot 3.2 backend in `src/main/java/com/marlowefinch/ops/` (plain SQL via Spring JDBC, no JPA, read-only `GET /api/*`); vanilla-JS frontend in `src/main/resources/static/` (`index.html`, `style.css`, `app.js`, no framework, no build step).
- Run: `docker compose up -d db && ./mvnw spring-boot:run` (no Docker: `SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run`), then http://localhost:8080.
- Test: `./mvnw test` (Java, 25) and `npm test` (Jest, 45); both must stay green. One test: `./mvnw test -Dtest=DashboardRepositoryTest`, `npx jest src/test/javascript/render.test.js`.
- Java tests are full `@SpringBootTest` on the `demo` profile (H2 + the real Flyway seed, no DB mocks) and assert exact seed numbers: don't touch `V2__seed.sql` or `tools/make_seed.py`.
- "Today" is pinned to 2026-09-21 by `ClockConfig`; never use the system clock.
- Jest drives `app.js` in jsdom against a fake API in `src/test/javascript/setup/loadApp.js`; its `FIXTURES` are hand-copied from the API, so update them whenever an endpoint's JSON changes.
- New element ids in `index.html` must be added to `REGISTERED_IDS` in `loadApp.js` (`harness.test.js` enforces it).
- Tickets live in `docs/tickets/`; where a ticket and chat disagree, the ticket wins.
- pom.xml dependencies are frozen. Any change needs a CHG ticket.
