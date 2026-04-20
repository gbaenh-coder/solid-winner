# OddJob.ng — Backend Setup & Deployment Guide
# READ THIS TOP TO BOTTOM. DO NOT SKIP STEPS.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 1 — INSTALL TOOLS ON YOUR COMPUTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You need these installed:

1. Node.js → https://nodejs.org  (download the LTS version)
2. VS Code  → https://code.visualstudio.com  (your code editor)
3. Git      → https://git-scm.com

To check if they're installed, open your terminal and type:
  node --version   ← should show v18 or higher
  npm --version    ← should show a number
  git --version    ← should show a number


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 2 — SET UP YOUR FREE DATABASE (MongoDB Atlas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MongoDB Atlas is a FREE cloud database. Your job posts, users, and 
applications will be stored here.

1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free" and create an account
3. Create a FREE cluster (choose M0 — it's free)
4. Choose any region close to Nigeria (e.g. Frankfurt or Paris)
5. Create a database user:
   - Click "Database Access" → "Add New Database User"
   - Username: oddjobadmin
   - Password: make a strong one, SAVE IT
   - Role: "Atlas Admin"
6. Allow network access:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is fine for now, you can restrict later
7. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the string — it looks like:
     mongodb+srv://oddjobadmin:<password>@cluster0.xxxxx.mongodb.net/
   - Replace <password> with your actual password
   - Add "oddjobng" at the end:
     mongodb+srv://oddjobadmin:yourpassword@cluster0.xxxxx.mongodb.net/oddjobng


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 3 — SET UP GMAIL FOR EMAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OddJob.ng sends real emails when someone applies for a job.
We use Gmail with an "App Password" (NOT your real Gmail password).

1. Go to your Google Account: https://myaccount.google.com
2. Click "Security"
3. Turn on "2-Step Verification" (required)
4. Search for "App passwords" in the search bar
5. Select "Mail" and "Windows Computer" (or any device)
6. Click Generate → Google gives you a 16-character password
7. SAVE THIS PASSWORD — you can't see it again
   It looks like: abcd efgh ijkl mnop

Your .env will use:
  EMAIL_USER = your real gmail (e.g. oddjobng@gmail.com)
  EMAIL_PASS = the 16-character app password (no spaces)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 4 — SET UP PAYSTACK (Nigerian Payments)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Paystack is Nigeria's best payment gateway.

1. Go to: https://paystack.com
2. Sign up for a free account
3. Complete your business verification (required for live payments)
4. Go to Settings → API Keys & Webhooks
5. Copy your TEST keys first:
   - Secret key: sk_test_xxxx...
   - Public key: pk_test_xxxx...
6. Use TEST keys while building/testing
7. Switch to LIVE keys when you're ready to take real money


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 5 — RUN THE BACKEND LOCALLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open the oddjob-backend folder in VS Code

2. Open the terminal in VS Code (Ctrl + `)

3. Install all packages:
   npm install

4. Create your .env file:
   - Copy .env.example and rename it to .env
   - Fill in all your real values from steps 2, 3, 4 above

   Your .env should look like:
   ─────────────────────────────────────
   MONGODB_URI=mongodb+srv://oddjobadmin:yourpassword@cluster0.xxxxx.mongodb.net/oddjobng
   JWT_SECRET=supersecretrandomstring123456789abcdef
   PORT=5000
   NODE_ENV=development
   EMAIL_USER=yourgmail@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxx
   FRONTEND_URL=http://localhost:3000
   ─────────────────────────────────────

5. Start the server:
   npm run dev

6. You should see:
   🚀 OddJob.ng server running on port 5000
   ✅ MongoDB connected

7. Test it — open your browser and go to:
   http://localhost:5000
   You should see: {"message":"🚀 OddJob.ng API is running"}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 6 — TEST YOUR API ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Download Postman (free): https://www.postman.com
Or use the VS Code Thunder Client extension (easier).

Test these endpoints:

REGISTER A USER:
  POST http://localhost:5000/api/auth/register
  Body (JSON):
  {
    "firstName": "Kunle",
    "lastName": "Adeyemi",
    "email": "kunle@test.com",
    "password": "password123",
    "role": "freelancer"
  }

LOGIN:
  POST http://localhost:5000/api/auth/login
  Body (JSON):
  {
    "email": "kunle@test.com",
    "password": "password123"
  }
  → Copy the "token" from the response. You'll need it.

POST A JOB:
  POST http://localhost:5000/api/jobs
  Body (JSON):
  {
    "title": "React Developer Needed",
    "description": "Build a fintech app",
    "category": "Tech & Dev",
    "budget": 200000,
    "location": "Remote",
    "posterName": "Ngozi",
    "posterEmail": "ngozi@test.com"
  }

GET ALL JOBS:
  GET http://localhost:5000/api/jobs
  GET http://localhost:5000/api/jobs?category=Design
  GET http://localhost:5000/api/jobs?location=Lagos
  GET http://localhost:5000/api/jobs?search=developer


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 7 — DEPLOY BACKEND TO RENDER.COM (FREE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render is a free cloud platform that will host your Node.js backend.

FIRST — Push your code to GitHub:

1. Create a GitHub account: https://github.com
2. Create a new repository called "oddjob-backend"
3. In your terminal (inside oddjob-backend folder):

   git init
   git add .
   git commit -m "Initial OddJob.ng backend"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/oddjob-backend.git
   git push -u origin main

THEN — Deploy on Render:

1. Go to: https://render.com → Sign up free
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your "oddjob-backend" repository
5. Fill in the settings:
   - Name:         oddjob-backend
   - Region:       Frankfurt EU (closest to Nigeria)
   - Branch:       main
   - Runtime:      Node
   - Build Command: npm install
   - Start Command: node server.js
   - Plan:         Free

6. Click "Advanced" → "Add Environment Variable"
   Add ALL your .env variables one by one:
   MONGODB_URI     → your atlas connection string
   JWT_SECRET      → your secret key
   NODE_ENV        → production
   EMAIL_USER      → your gmail
   EMAIL_PASS      → your app password
   PAYSTACK_SECRET_KEY → your paystack key
   FRONTEND_URL    → https://oddjobsng.netlify.app

7. Click "Create Web Service"

8. Wait 2-3 minutes for deployment...

9. Render gives you a URL like:
   https://oddjob-backend.onrender.com

10. Test it: open https://oddjob-backend.onrender.com in browser
    You should see: {"message":"🚀 OddJob.ng API is running"}

⚠️  IMPORTANT: Free Render servers "sleep" after 15 minutes of 
    inactivity and take ~30 seconds to wake up on first request.
    This is fine for testing. Upgrade to paid ($7/mo) for production.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 8 — CONNECT FRONTEND TO BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In your oddjob-ng-interactive.html file, find this line at the 
top of the <script> section and add:

  const API_URL = 'https://oddjob-backend.onrender.com/api';

Then update each form to call the real API instead of just 
showing a toast. The frontend file already has all the 
functions — you just need to change them to use fetch().

Example — change handleSignup() to:

  async function handleSignup() {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: document.getElementById('signupFirst').value,
        email:     document.getElementById('signupEmail').value,
        password:  document.getElementById('signupPassword').value,
        role:      document.getElementById('signupRole').value
      })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      showToast('Account created! Welcome 🎉', 'success');
    } else {
      showToast(data.message, 'error');
    }
  }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## YOUR COMPLETE ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Browser (User)
       ↓
  Netlify (Frontend HTML)          ← FREE
       ↓ API calls
  Render.com (Node.js Backend)     ← FREE
       ↓
  MongoDB Atlas (Database)         ← FREE
       ↓
  Gmail (Emails)                   ← FREE
       ↓
  Paystack (Payments)              ← 1.5% per transaction

  TOTAL COST = ₦0/month + domain (~₦10,000/year)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## QUICK REFERENCE — ALL YOUR URLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Frontend (live):  https://oddjobsng.netlify.app (or oddjobs.com.ng)
  Backend (live):   https://oddjob-backend.onrender.com
  Database:         MongoDB Atlas dashboard
  Payments:         Paystack dashboard → paystack.com

  API Endpoints:
  POST  /api/auth/register
  POST  /api/auth/login
  GET   /api/auth/me
  GET   /api/jobs
  POST  /api/jobs
  GET   /api/jobs/:id
  POST  /api/jobs/:id/bookmark
  POST  /api/applications
  GET   /api/applications/job/:jobId
  POST  /api/payments/initialize
  GET   /api/payments/verify/:reference
