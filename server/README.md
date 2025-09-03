Studio by Azzi — One-Command Setup

What this does
- Runs the backend API and serves the frontend site from the same address.
- You only need to start one server, then visit http://localhost:8080

Steps (beginner-friendly)
1) Install Node.js (LTS) from nodejs.org. Verify with `node -v`.
2) Open a terminal in the project folder, then:
   - `cd server`
   - Copy env file: PowerShell -> `Copy-Item .env.example .env`
   - Open it: `notepad .env`
     - Set `ADMIN_TOKEN=ChooseAStrongSecret`
     - (Optional) Set email SMTP settings if you want notifications.
   - Install deps: `npm install`
   - Run the server: `npm run dev`
3) Open your browser: http://localhost:8080
   - Home page: index.html
   - Services + ordering: services.html (Order Now opens a form)
   - Payment: payment.html (your UPI shown)
   - Admin: admin.html (enter your ADMIN_TOKEN, then Refresh)
   - Chat: floating 💬 button on every page. Messages are saved and visible in Admin.
   - AI Chat (optional): Set OPENAI_API_KEY in server/.env to enable AI responses. Falls back to smart rules if not set.

Environment
- PORT: HTTP port (default 8080)
- ALLOWED_ORIGINS: Not required if frontend is served by this server (same-origin). If you serve the frontend elsewhere, set this to that origin.
- ADMIN_EMAIL + SMTP_*: Optional; enable email notifications of new orders

API (for reference)
- GET /api/health -> { ok: true }
- GET /api/services -> { services: [...] }
- POST /api/orders { name, email, phone?, serviceKey, details?, budget? }
- GET /api/orders/:id
- Admin (Bearer token required):
  - GET /api/admin/orders
  - PATCH /api/admin/orders/:id { status }
  - DELETE /api/admin/orders/:id
  - GET /api/admin/chat
  - PATCH /api/admin/chat/:id { status }
  - DELETE /api/admin/chat/:id

Chat (public)
- POST /api/chat { name?, email?, message, page? } -> { ok, id }

AI Chat (public)
- POST /api/ai-chat { message, history? } -> { reply }
  - If OPENAI_API_KEY is set, uses OpenAI (model from AI_MODEL, default gpt-4o-mini)
  - Otherwise, uses a concise rule-based assistant with your pricing/services info

Notes
- Orders are stored in `server/data/orders.json`.
- For production, consider a database and hardened auth.
