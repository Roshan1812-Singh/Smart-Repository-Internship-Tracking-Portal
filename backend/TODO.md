# Fix CORS Error - TODO Steps

✅ 1. Create backend/.env with CORS_ORIGINS=http://localhost:5173,http://localhost:3000
✅ 2. Edit backend/server.js to use dynamic CORS from env var  
✅ 3. Restart backend server
✅ 4. Test login from frontend
✅ 5. Update TODO.md as complete

**Login 500 Fixed!** Added JWT_SECRET/JWT_REFRESH_SECRET to .env.

✅ All steps complete.

**Status:** Backend ready. Test login now.

**Production:** Update Vercel env vars: CORS_ORIGINS=https://sritp.vercel.app, JWT_SECRET, JWT_REFRESH_SECRET.

Run: cd backend && npm start (if not running)

