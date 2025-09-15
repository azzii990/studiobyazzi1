Studio by Azzi â€” Live Deployment Guide (Beginner Friendly)

This repo contains your full website (frontend) and a Node.js backend (orders, admin, AI chat, payment helpers). Follow the steps below to put it live with GitHub + Render.

What youâ€™ll get
- One URL that serves your entire site and API (easiest).
- Orders saved and viewable in Admin.
- Optional AI chat replies if you add an OpenAI key.

Prerequisites
1) Create accounts: GitHub.com and Render.com (free).
2) Install Git: https://git-scm.com/downloads (accept defaults).
3) Open a terminal in your project folder (Windows):
   - File Explorer â†’ go to your folder â†’ rightâ€‘click empty space â†’ Open in Terminal
   - The prompt should end with Studio-by-Azzi>

Step 1 â€” Initialize Git locally
Run these in the terminal (inside Studio-by-Azzi):

  git init
  git add .
  git commit -m "Initial commit: site + backend"

Explanation:
- git init: starts a local repository in this folder
- git add .: stages all files
- git commit: saves a snapshot (locally)

Step 2 â€” Create a GitHub repo and push
1) On GitHub: New repository â†’ name it studio-by-azzi â†’ Create
2) Back in your terminal (replace YOUR-USER):

  git remote add origin https://github.com/YOUR-USER/studio-by-azzi.git
  git branch -M main
  git push -u origin main

You should now see your files on GitHub.

Step 3 â€” Deploy on Render (hosts site + API)
1) Go to Render â†’ New â†’ Web Service â†’ connect your GitHub account, choose your repo
2) Settings:
   - Root Directory: server
   - Build Command: npm install
   - Start Command: npm start
   - Environment: Node
3) Add Environment Variables (Render dashboard â†’ your service â†’ Environment):
   - ADMIN_TOKEN: a strong secret (e.g., AzziSecret123!)
   - ALLOWED_ORIGINS: leave empty (frontend and backend share one origin)
   - OPENAI_API_KEY: optional (enables AI chat)
   - (Optional SMTP) ADMIN_EMAIL, SMTP_HOST, SMTP_PORT=587, SMTP_USER, SMTP_PASS
4) Click Create Web Service. Wait for â€œLiveâ€.

Step 4 â€” Verify live
- Render gives you a URL like https://studio-by-azzi.onrender.com
- Visit:
  - Home: / (index.html)
  - Services & Order: /services.html (place an order)
  - Payment: /payment.html (Quick Pay UPI link)
  - Admin: /admin.html â†’ enter ADMIN_TOKEN â†’ Refresh Orders/Chats

Update the site later
- Edit files locally â†’

  git add .
  git commit -m "Describe your change"
  git push

- Render autoâ€‘deploys on push to main.

Optional â€” GitHub Pages (if you prefer)
- You can host just the frontend on GitHub Pages and the backend on Render.
- Then set `BACKEND_BASE_URL` in script.js and admin.js to your Render URL, and set `ALLOWED_ORIGINS` on Render to your GitHub Pages origin. The allâ€‘inâ€‘one Render setup above is simpler.

Local run (optional)
- Backend only (serves the site too):

  cd server
  Copy-Item .env.example .env
  notepad .env   # set ADMIN_TOKEN and others
  npm install
  npm run dev

- Open http://localhost:8080

Security & privacy
- The file .gitignore prevents committing secrets like server/.env and local data.
- Never put ADMIN_TOKEN or SMTP passwords in code. Always set them in Renderâ€™s Environment panel.

Need help?
- If you get stuck, share the exact error message and Iâ€™ll guide you through fixing it.

