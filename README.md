# Golf360 Phase 1 Realistic Starter

This starter includes:
- Spring Boot backend
- PostgreSQL config
- Seeded demo club, courses, tee times, and a demo player
- Next.js frontend for login, club browsing, course selection, tee time booking, and booking history

## Backend
1. Create PostgreSQL database: `golf360`
2. Update credentials in `backend/src/main/resources/application.yml` if needed
3. Run:
   - `cd backend`
   - `mvn spring-boot:run`
4. Swagger UI:
   - `http://localhost:8081/swagger-ui/index.html`

## Frontend
1. Run:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
2. Open:
   - `http://localhost:3005`

## Demo Login
- Email: `player@golf360.com`
- Password: `Password123`

## Recommended Next Phase
- Add JWT request filter and protected endpoints
- Add club manager dashboard
- Add payment gateway
- Add scorecards and tournament leaderboards

