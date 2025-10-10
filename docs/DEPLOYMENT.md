# Deployment Guide

Deploying this thing to production. Here are your best options, ranked by ease of use.

## Railway (Easiest)

Railway is ridiculously easy for NestJS apps. Literally connects to your GitHub and deploys automatically.

### How to Deploy:

1. **Sign up at https://railway.app** (use your GitHub account)

2. **Click "New Project" → "Deploy from GitHub"**
   - Pick your repo
   - Railway auto-detects it's a NestJS app
   - It'll start deploying immediately

3. **Add PostgreSQL**
   - In the dashboard, click "New"
   - Add PostgreSQL
   - Railway automatically sets DATABASE_URL for you

4. **Set your env vars**

   ```bash
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=change-this-to-something-random
   JWT_REFRESH_SECRET=also-change-this
   JWT_EXPIRES_IN=30m
   JWT_REFRESH_EXPIRES_IN=7d
   OPENAI_API_KEY=sk-your-key
   ```

5. **That's it!**
   - Railway builds and deploys automatically
   - You get a URL like `https://your-app.up.railway.app`
   - Every push to main auto-deploys
     **Why Railway:**

- $5/month free credit (enough for light usage)
- HTTPS is automatic
- PostgreSQL included
- Zero config needed
- Auto-deploys are magical
- Fast and reliable

## **Gotcha:** You'll run out of free credits fast if you have high traffic. Monitor your usage.

### Render

Great alternative with a true free tier.

#### Steps to Deploy:

1. **Create Render Account**

- Visit https://render.com
- Sign up with GitHub

2. **Create Web Service**

- Click "New +" → "Web Service"
- Connect your GitHub repo
- Select the `api` directory as root

3. **Configuration**

```yaml
# Build Command
pnpm install && pnpm run build
# Start Command
pnpm run start:prod
# Environment
NODE_ENV=production
```

4. **Add PostgreSQL Database**

- Create new PostgreSQL service
- Copy the DATABASE_URL to your web service environment

#### Render Benefits:

- Truly free tier
- 750 hours/month
- Free SSL certificates
- Auto-deploys from GitHub
- ❌ Services sleep after 15min inactivity

---

### Heroku

Still viable but no longer free.

#### Steps to Deploy:

1. **Install Heroku CLI**

```bash
# macOS
brew tap heroku/brew && brew install heroku
# Login
heroku login
```

2. **Create Heroku App**

```bash
cd api
heroku create your-app-name
```

3. **Add PostgreSQL**

```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
```

5. **Deploy**

```bash
git push heroku main
```

---

## Production Configuration

### Environment Variables Template

Create a `.env.production` file:

```bash
# Server
NODE_ENV=production
PORT=3001
# Database (provided by hosting service)
DATABASE_URL=postgresql://username:password@host:port/database
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
# Security
BCRYPT_ROUNDS=12
# CORS (set to your frontend URL)
FRONTEND_URL=https://your-frontend-domain.com
# Email Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Production Checklist

- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure CORS for your frontend domain
- [ ] Set up email service (Gmail, SendGrid, etc.)
- [ ] Enable database SSL in production
- [ ] Set up monitoring (Railway/Render provide basic monitoring)
- [ ] Configure custom domain (optional)

## ‍♂ Quick Start Commands

### Test Production Build Locally

```bash
# Build the app
pnpm run build
# Start in production mode
pnpm run start:prod
```

### Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Cost Comparison

| Platform | Free Tier        | Database   | Custom Domain | Auto-Deploy |
| -------- | ---------------- | ---------- | ------------- | ----------- |
| Railway  | $5 credit/month  | PostgreSQL |               |             |
| Render   | 750 hours/month  | PostgreSQL |               |             |
| Heroku   | $5/month minimum | PostgreSQL |               |             |
| Fly.io   | Good allowance   | PostgreSQL |               |             |

## Recommendation

**For Development/MVP**: Use **Railway** - best developer experience
**For Production**: Consider **Railway** or **Render** based on your needs
Railway is recommended because:

- Zero configuration needed
- Excellent NestJS support
- Built-in database
- Great performance
- Fair pricing model

---

## Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)

---

**Next Steps**: Choose a platform and follow the deployment steps above. Your API will be live in minutes!
