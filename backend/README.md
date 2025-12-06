# MERN E-commerce (Basic) - Backend

## Setup
1. Copy `.env.example` to `.env` and set MONGO_URI and JWT_SECRET.
2. Install dependencies:
   ```
   cd backend
   npm install
   ```
3. Run:
   ```
   npm run dev
   ```
4. Register an admin (one-time) via:
   POST /api/admin/register
   Body: { "username": "admin", "password": "password" }
5. Login via POST /api/admin/login to get token, then use token to add products.
