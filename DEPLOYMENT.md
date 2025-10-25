# Deployment Guide - Circuit Stream

## 📋 Pre-Deployment Checklist

- ✅ Code pushed to GitHub
- ✅ `.env.example` files created
- ✅ `requirements.txt` updated with gunicorn
- ✅ `Procfile` created for Railway
- ✅ `runtime.txt` specifies Python version
- ✅ CORS configured in backend
- ✅ Environment variables ready

## 🚂 Backend Deployment (Railway)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Authorize Railway to access your repositories

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `Circuit-Stream---F1-Data-Analysis`
4. Railway will auto-detect Python project

### Step 3: Configure Environment Variables
In Railway dashboard, add these variables:
```
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
```

### Step 4: Deploy
- Railway automatically builds and deploys
- Wait for deployment to complete
- **Copy your Railway URL**: `https://your-app-name.railway.app`

### Step 5: Test Backend
Visit: `https://your-app-name.railway.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "message": "F1 Data Analysis API is running"
}
```

## ⚡ Frontend Deployment (Vercel)

### Step 1: Update Frontend for Production

1. Create `.env.production` in `frontend/` folder:
```bash
REACT_APP_API_URL=https://your-app-name.railway.app
```

2. **Important**: Update all axios calls to use environment variable

Update each component to use the API URL from config:

```javascript
// Add this import at the top of each component
import API_BASE_URL from '../config/api';

// Replace all axios calls from:
axios.get('http://localhost:5000/api/...')

// To:
axios.get(`${API_BASE_URL}/api/...`)
```

3. Commit and push changes:
```bash
git add .
git commit -m "Configure for production deployment"
git push origin main
```

### Step 2: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel

### Step 3: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import `Circuit-Stream---F1-Data-Analysis`
3. **Configure Project**:
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

### Step 4: Add Environment Variables
In Vercel project settings:
```
REACT_APP_API_URL=https://your-railway-backend.railway.app
```

### Step 5: Deploy
- Click **"Deploy"**
- Wait for build to complete
- Your app will be live at: `https://your-app.vercel.app`

## 🔄 Update Workflow

### For Backend Changes:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Railway auto-deploys on push to main branch

### For Frontend Changes:
```bash
cd frontend
git add .
git commit -m "Update frontend"  
git push origin main
```
Vercel auto-deploys on push to main branch

## 🐛 Troubleshooting

### Backend Issues on Railway

**Problem**: Build fails
- Check Railway logs
- Verify `requirements.txt` has all dependencies
- Ensure `Procfile` exists with: `web: gunicorn app:app`

**Problem**: App crashes
- Check Railway logs: Click "View Logs"
- Common issue: Missing environment variables
- Verify Python version in `runtime.txt`

**Problem**: Slow loading
- Normal for first request (cold start)
- FastF1 downloads and caches data
- Subsequent requests will be faster

### Frontend Issues on Vercel

**Problem**: Build fails
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Ensure root directory is set to `frontend`

**Problem**: API calls fail (CORS error)
- Verify `REACT_APP_API_URL` environment variable
- Check CORS configuration in Flask backend
- Ensure Railway backend URL is correct

**Problem**: Images not loading
- Verify images are in `frontend/public/` directory
- Check image paths in code
- Clear Vercel cache and redeploy

### General Issues

**Problem**: Data not loading
- Check Railway backend logs
- Verify FastF1 cache directory exists
- Test API endpoint directly: `https://your-app.railway.app/api/health`

**Problem**: Slow performance
- First load is slow (data download + cache)
- Consider adding loading states
- Railway free tier has limited resources

## 💰 Cost Breakdown

### Railway (Backend)
- **Free Tier**: $5 credit/month
- Enough for hobby projects
- No credit card required initially

### Vercel (Frontend)
- **Free Tier**: Unlimited
- Perfect for static sites
- 100GB bandwidth/month

### Total Cost: **$0/month** for hobby use! 🎉

## 🔐 Security Best Practices

1. **Never commit sensitive data**:
   - Use `.env` files (gitignored)
   - Store secrets in platform dashboards

2. **Restrict CORS in production**:
   ```python
   # In app.py, update CORS to specific origin:
   CORS(app, origins=["https://your-app.vercel.app"])
   ```

3. **Use environment variables** for all configuration

## 📊 Monitoring

### Railway
- View logs: Railway dashboard → Your project → View Logs
- Monitor resources: Check CPU/Memory usage
- Set up alerts for crashes

### Vercel
- Analytics: Vercel dashboard → Analytics
- Error tracking: Check deployment logs
- Performance: Core Web Vitals

## 🎯 Next Steps After Deployment

1. **Test thoroughly**:
   - Try all features
   - Test on mobile devices
   - Check different Grand Prix

2. **Add custom domain** (optional):
   - Railway: Settings → Domains
   - Vercel: Settings → Domains

3. **Set up monitoring**:
   - Use Railway/Vercel built-in monitoring
   - Consider UptimeRobot for uptime checks

4. **Share your app**! 🚀

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **FastF1 Docs**: https://docs.fastf1.dev

---

Good luck with your deployment! 🏁✨
