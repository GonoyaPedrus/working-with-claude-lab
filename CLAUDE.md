# ops-dashboard (Marlowe & Finch operations wall-screen)
- Run: `docker compose up -d db && ./mvnw spring-boot:run` (no Docker: `SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run`), then http://localhost:8080.
- Test: `./mvnw test` (Java, 25) and `npm test` (Jest, 45). Both must stay green.
- Backend: Java 17 / Spring Boot 3.2 in `src/main/java/com/marlowefinch/ops/`, plain SQL via Spring JDBC (no JPA), read-only `GET /api/*`.
- DB: Flyway migrations in `src/main/resources/db/`; tests assert exact seed numbers, so don't touch `V2__seed.sql`.
- "Today" is pinned to 2026-09-21 by `ClockConfig`; never use the system clock.
- Frontend: vanilla JS in `src/main/resources/static/` (`index.html`, `style.css`, `app.js`), no framework, no build step.
- New element ids in `index.html` must be registered in `src/test/javascript/setup/loadApp.js`.
- Tickets live in `docs/tickets/`; where a ticket and chat disagree, the ticket wins.
- pom.xml dependencies are frozen. Any change needs a CHG ticket.
