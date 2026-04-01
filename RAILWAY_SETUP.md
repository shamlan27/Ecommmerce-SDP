# Railway Deployment Guide - E-Commerce SDP

## Quick Start - 5 Steps to Deploy

### Step 1: Prerequisites
- Railway account (https://railway.app)
- Git installed locally
- Both backend and frontend pushed to GitHub

### Step 2: Deploy Laravel Backend

1. **Set up the repository:**
   ```bash
   cd backend
   git init (if not already in git)
   git add .
   git commit -m "Initial Laravel setup"
   ```

2. **Connect to Railway:**
   - Go to https://railway.app/dashboard
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository containing the backend
   - Link the `/backend` directory as the root

3. **Configure Environment Variables:**
   In Railway dashboard, add these variables under "Variables":
   ```
   APP_NAME=Ecommerce-SDP
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:YOUR_RANDOM_KEY (generate with: php artisan key:generate)
   APP_URL=https://your-backend-url.railway.app
   FRONTEND_URL=https://your-frontend-url.netlify.app (or Railway URL)
   
   DB_CONNECTION=mysql
   DB_HOST=${{MYSQL.PRIVATE_HOST}}
   DB_PORT=3306
   DB_DATABASE=railway
   DB_USERNAME=${{MYSQL.USERNAME}}
   DB_PASSWORD=${{MYSQL.PASSWORD}}
   
   STRIPE_PUBLIC_KEY=your_stripe_key
   STRIPE_SECRET_KEY=your_stripe_secret
   
   LOG_CHANNEL=stderr
   ```

4. **Add MySQL Database:**
   - In Railway dashboard, click "New Service" → "Database" → "MySQL"
   - The variables above will auto-populate with the database credentials

5. **Deploy:**
   - Push to GitHub (Railway auto-deploys on push)
   - Monitor logs in Railway dashboard

---

### Step 3: Deploy Next.js Frontend

**Option A: Deploy on Railway (Recommended)**

1. **Repository Setup:**
   ```bash
   cd frontend
   git add .
   git commit -m "Initial Next.js setup"
   ```

2. **In Railway Dashboard:**
   - Click "New Project" → "Deploy from GitHub"
   - Select the frontend directory as root
   - Add these variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
     NODE_ENV=production
     ```

3. **Deploy:**
   - The app auto-deploys on GitHub push

**Option B: Deploy on Vercel (Alternative)**

1. Push frontend to GitHub
2. Go to vercel.com → Import Project
3. Select your frontend repository
4. Set Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app/api
   ```
5. Click Deploy

---

### Step 4: Configure CORS

In your Laravel backend, make sure `config/cors.php` includes your frontend URL:

```php
'allowed_origins' => ['https://your-frontend-url.railway.app', 'https://your-frontend-url.vercel.app'],
```

---

### Step 5: Post-Deployment

1. **Run Migrations:**
   - Migrations run automatically via `release: php artisan migrate --force`
   - Check Railway logs to confirm

2. **Test the Connection:**
   ```bash
   curl https://your-backend-url.railway.app/api/status
   curl https://your-frontend-url.railway.app
   ```

3. **Custom Domain (Optional):**
   - In Railway → Settings → Domain
   - Add your custom domain
   - Update DNS records

4. **Configure Email (Optional):**
   Add to environment variables:
   ```
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=587
   MAIL_USERNAME=your_username
   MAIL_PASSWORD=your_password
   MAIL_FROM_ADDRESS=your@email.com
   ```

---

## Troubleshooting

### Backend Build Fails
- Check `Procfile` syntax
- Ensure PHP version in `composer.json` is compatible
- Review logs: Railway Dashboard → Logs

### Frontend doesn't connect to backend
- Verify `NEXT_PUBLIC_API_URL` includes full URL with `/api`
- Check CORS configuration in Laravel
- Ensure both services are running

### Database connection errors
- Confirm database variables match MySQL service
- Check credentials in Railway → MySQL logs

---

## Estimated Costs
- Railway Free Tier: $5/month credit
- Backend (Laravel): ~2-5 GB
- Frontend (Next.js): ~1-3 GB
- MySQL Database: ~5 GB
- Total: Usually within free tier for small projects

Good luck with your deployment! 🚀
