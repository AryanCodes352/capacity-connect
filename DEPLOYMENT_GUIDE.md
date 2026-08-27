# 🚀 CAPACITY CONNECT — Cloud & Vercel Deployment Guide
> **Deploy this full-stack application live on the public internet in under 3 minutes for free!**

---

## ⚡ Overview of Free Cloud Architecture

| Tier | Service | Provider | Free Tier |
|---|---|---|---|
| 🌐 **Frontend** | React 19 + Tailwind SPA | **Vercel** | Free (Unlimited bandwidth) |
| ⚙️ **Backend API** | Node.js / Express | **Vercel Serverless** OR **Render.com** | Free (Global CDN / Web Service) |
| 🗄️ **Database** | PostgreSQL | **Neon.tech** OR **Supabase** | Free (0.5GB Serverless Postgres) |

---

## 🛠️ Option 1: 100% Free Vercel + Neon Deployment (Recommended)

### Step 1: Create a Free Cloud PostgreSQL Database on Neon.tech
1. Go to **[https://neon.tech](https://neon.tech)** and sign up (Free).
2. Click **Create Project** $\rightarrow$ Name it `capacity-connect-db`.
3. Copy your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### Step 2: Push Database Schema & Seed Data to Neon
From your local terminal on your machine:
```bash
cd capacity-connect/backend

# Set your Neon connection string in your .env
# DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Push schema to your cloud database
npx prisma db push

# Seed the TechNova demo organization data
npm run seed
```
> ✅ Your cloud database is now fully seeded with all 9 users, departments, courses, and assessment questions!

---

### Step 3: Deploy Backend to Vercel
1. Install Vercel CLI (or connect your GitHub repository to Vercel):
   ```bash
   npm i -g vercel
   ```
2. In `capacity-connect/backend`, run:
   ```bash
   cd capacity-connect/backend
   vercel
   ```
3. Follow the prompts:
   - Link to existing project? **No**
   - Project name: `capacity-connect-backend`
   - In which directory is code located? `./`
4. Add Environment Variables in the Vercel Dashboard:
   - `DATABASE_URL`: *(Your Neon PostgreSQL URL)*
   - `JWT_SECRET`: *(A secure random string, e.g. `sih-super-secret-jwt-key-2026`)*
   - `NODE_ENV`: `production`
5. Run production deployment:
   ```bash
   vercel --prod
   ```
   > 🔗 You will get a live backend URL: `https://capacity-connect-backend.vercel.app`

---

### Step 4: Deploy Frontend to Vercel
1. In `capacity-connect/frontend`, run:
   ```bash
   cd capacity-connect/frontend
   vercel
   ```
2. Follow the prompts:
   - Link to existing project? **No**
   - Project name: `capacity-connect`
   - Framework preset: **Vite**
3. Add Environment Variable in Vercel Dashboard:
   - `VITE_API_URL`: `https://capacity-connect-backend.vercel.app/api`
4. Run production deployment:
   ```bash
   vercel --prod
   ```
   > 🎉 **Your Frontend is now LIVE on the public internet at: `https://capacity-connect.vercel.app`!**

---

## 🌐 Option 2: Deploy Frontend on Vercel + Backend on Render.com

If you prefer a persistent Express.js server rather than serverless functions:

### 1. Backend on Render.com:
1. Go to **[https://render.com](https://render.com)** $\rightarrow$ Click **New Web Service**.
2. Connect your GitHub repository $\rightarrow$ Select `capacity-connect/backend` folder.
3. Configure settings:
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `node server.js`
4. Add Environment Variables:
   - `DATABASE_URL`: *(Your Neon or Supabase PostgreSQL URL)*
   - `JWT_SECRET`: `sih-super-secret-jwt-key-2026`
   - `PORT`: `5000`
5. Click **Deploy Web Service**. You will receive: `https://capacity-connect-api.onrender.com`.

### 2. Frontend on Vercel:
1. Push `capacity-connect/frontend` to Vercel.
2. Set Environment Variable:
   - `VITE_API_URL`: `https://capacity-connect-api.onrender.com/api`
3. Click **Deploy**.

---

## 🔑 Live Demonstration Accounts (Ready for Judges)

Once deployed, anyone with your Vercel URL can test the platform instantly:

| Role | Email | Password |
|---|---|---|
| **HR / Admin** | `aditya@technova.com` | `Admin@123` |
| **Technical Trainer** | `priya.trainer@technova.com` | `Trainer@123` |
| **Software Developer (Learner)** | `rahul@technova.com` | `Employee@123` |
| **Frontend Engineer (Learner)** | `priya.dev@technova.com` | `Employee@123` |
| **DevOps Engineer (Learner)** | `deepak@technova.com` | `Employee@123` |

---

*CAPACITY CONNECT — Ready for 1-Click Cloud Deployment.*
