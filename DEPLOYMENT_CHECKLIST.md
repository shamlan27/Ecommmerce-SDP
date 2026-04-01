# Railway Deployment - Quick Start Checklist

## Pre-Deployment ✅

### 1. Prepare Your Project
- [ ] Both backend and frontend are in git repository
- [ ] Push to GitHub (public or private repo)
- [ ] All `.env` files are in `.gitignore`

### 2. Generate Laravel App Key
```bash
cd backend
php artisan key:generate
# Copy the generated key for later
```

### 3. Update Configuration Files
- [x] `/backend/Procfile` - Created ✅
- [x] `/frontend/Procfile` - Created ✅
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend environment

---

## Deployment Steps (5 minutes) 🚀

### Step 1: Create Railway Account
1. Visit https://railway.app
2. Sign up with GitHub
3. Go to Dashboard

### Step 2: Create Backend Project
1. Click "New Project"
2. Select "Deploy from GitHub"
3. Authorize GitHub
4. Select your repository
5. Select the `backend` directory as root

### Step 3: Add Environment Variables (Backend)
In Railway → Plugins → Add MySQL Database

Then go to Variables and add:
```
APP_KEY=base64:YOUR_GENERATED_KEY
APP_ENV=production
APP_DEBUG=false
FRONTEND_URL=${{RAILWAY_FRONTEND_URL}}
DB_CONNECTION=mysql
DB_HOST=${{MYSQL.PRIVATE_HOST}}
DB_PORT=3306
DB_DATABASE=${{MYSQL.DATABASE}}
DB_USERNAME=${{MYSQL.USERNAME}}
DB_PASSWORD=${{MYSQL.PASSWORD}}
LOG_CHANNEL=stderr
STRIPE_PUBLIC_KEY=your_key
STRIPE_SECRET_KEY=your_secret
```

### Step 4: Create Frontend Project
1. Click "New Project"
2. Select "Deploy from GitHub"
3. Select your repository
4. Select the `frontend` directory as root

### Step 5: Add Environment Variables (Frontend)
Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-railroad-url.railway.app/api
NODE_ENV=production
```

---

## Post-Deployment Tests ✅

### Test Backend
```bash
curl https://your-backend.railway.app/api/status
# Should return 200 OK
```

### Test Frontend
```bash
curl https://your-frontend.railway.app
# Should return HTML
```

### Test API Connection
1. Go to frontend URL
2. Try to login or make an API call
3. Check Network tab (DevTools) for successful requests

---

## Troubleshooting

### Build Fails
- Check Railway logs: Dashboard → Logs
- Verify PHP/Node versions match `composer.json` and `package.json`
- Ensure `Procfile` syntax is correct

### 502 Bad Gateway
- Wait 2-3 minutes for backend to start
- Check logs for errors
- Verify database connection variables

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in `/backend/config/cors.php`
- Add frontend URL to CORS allowed origins

### Database connection error
- Verify MySQL service is running
- Check credentials in Railway dashboard
- Run migrations manually: `railway run php artisan migrate`

---

## Cost Estimate

| Service | Size | Cost |
|---------|------|------|
| Frontend (Next.js) | 1-3GB | Free |
| Backend (Laravel) | 2-5GB | Free |
| MySQL Database | 5GB | Free |
| **Total** | | **~$5/mo credit** |

Railway gives $5/month free credit for most projects!

---

Good luck! 🎉
