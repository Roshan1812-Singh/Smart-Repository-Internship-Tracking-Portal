# SRITP — Deployment & Go-Live Checklist

Backend: Render · Frontend: Vercel · DB: MongoDB Atlas

## 1. Render (backend) — Environment Variables
Dashboard → your service → **Environment** → add/update these, then **Manual Deploy**:

```
NODE_ENV=production
PORT=5000
MONGO_URI=<your Atlas connection string>
CLIENT_URL=https://sritp.vercel.app            # no trailing slash
CORS_ORIGINS=https://sritp.vercel.app,http://localhost:5173,http://localhost:3000
JWT_SECRET=<new random 64-byte hex>
JWT_REFRESH_SECRET=<new random 64-byte hex>
JWT_RESET_SECRET=<new random 64-byte hex>
GMAIL_USER=<your gmail>
GMAIL_PASS=<gmail app password>
CLOUDINARY_CLOUD_NAME=<from cloudinary dashboard>
CLOUDINARY_API_KEY=<from cloudinary dashboard>
CLOUDINARY_API_SECRET=<from cloudinary dashboard>
```

Generate a secret locally:
`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## 2. Vercel (frontend) — Environment Variables
Project → Settings → **Environment Variables** → add for Production, then **Redeploy**:

```
VITE_API_URL=https://smart-repository-internship-tracking.onrender.com   # no trailing slash, no /api
```

## 3. Rotate the previously-exposed secrets (IMPORTANT)
The old `.env` was committed to git, so treat these as compromised:
- MongoDB Atlas: change the DB user password, update `MONGO_URI`.
- Gmail: revoke the old App Password, create a new one.
- JWT secrets: use freshly generated values (above).

## 4. Verify
- `GET https://<backend>/api/health` → `{ status: "ok", db: "connected" }`
- Open https://sritp.vercel.app → log in (no network/CORS errors in console).
- Upload a resume/document → it returns a `https://res.cloudinary.com/...` URL and survives a redeploy.

## Notes
- Files now use Cloudinary in production and fall back to local disk only if `CLOUDINARY_*` is unset.
- CORS now matches origins with or without a trailing slash, for both REST and Socket.io.
- Auth endpoints are rate-limited; `helmet` security headers are enabled.
- Role/permission edits and login timestamps now persist in MongoDB.
