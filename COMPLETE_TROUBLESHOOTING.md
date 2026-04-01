# MOOD DATA NOT STORING - COMPLETE TROUBLESHOOTING GUIDE

## ✅ VERIFIED: Backend API is Working!

```
✓ Server running on port 5000
✓ MongoDB database connected
✓ Mood POST endpoint works
✓ Mood GET endpoint works
✓ Data is saved to database
```

**Test Result:**
```json
Created mood: {"mood":"happy", "note":"test"}
Response: {"success":true, "data": {...}}
```

---

## 🔍 ISSUE IS ON FRONTEND - Let's Debug

### Quick Test (Do This First!)

1. **Open your app in browser**
2. **Press F12** → Go to **Console** tab
3. **Copy & Paste this entire script:**

```javascript
// ===== MOOD DATA DEBUGGING =====
const token = localStorage.getItem('neuro_token');
console.log("Authentication Status:", token ? "✓ LOGGED IN" : "❌ NOT LOGGED IN");

if (!token) {
  console.log("ERROR: You must LOGIN first before saving mood!");
} else {
  console.log("Token found:", token.substring(0, 50) + "...");

  // Try to save a mood
  fetch("http://localhost:5000/api/moods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ mood: "happy", note: "debug test" })
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      console.log("✓ SUCCESS - Mood was saved!");
      console.log("Server response:", d);
    } else {
      console.log("❌ FAILED - Server error:", d);
    }
  })
  .catch(e => console.error("❌ Network error:", e));
}
```

4. **Look at the console output:**
   - If you see `❌ NOT LOGGED IN` → **Solution: Login first!**
   - If you see `✓ SUCCESS - Mood was saved!` → **Check MongoDB database!**
   - If you see network error → **Backend not running!**

---

## 🛠️ SOLUTION CHECKLIST

### Problem 1: "NOT LOGGED IN"
**Status:** User is not authenticated
**Fix:**
1. Go to `/login` page
2. Enter your email and password
3. Click Login
4. Wait for success message
5. Try mood selection again

**Verify login worked:**
```javascript
console.log(localStorage.getItem('neuro_token')); // Should show a long string
```

---

### Problem 2: "SUCCESS - Mood was saved!" but no data in app
**Status:** Backend saved it, but frontend not displaying
**Fix:**
1. Refresh the page (Ctrl+R or Cmd+R)
2. Check which page displays moods
3. Navigate to that page
4. Check if you see your mood history

---

### Problem 3: Network Error
**Status:** Backend server not responding
**Fix:**

Before running the app, check:

```bash
# Open terminal in BACKEND folder
# Run this command to start the server:
npm run dev
```

**Or manually:**
```bash
node server.js
```

**Verify server is running:**
```bash
# In another terminal, run:
curl http://localhost:5000/api/health
```

Should see:
```json
{
  "status": "OK",
  "database": "Connected"
}
```

---

### Problem 4: 401 Unauthorized Error
**Status:** Token is invalid or expired
**Fix:**
```javascript
// Clear old token and login again
localStorage.removeItem('neuro_token');
localStorage.removeItem('nn-displayName');
// Reload page and login
```

---

## 📋 STEP-BY-STEP COMPLETE SETUP

### 1. Start the Backend Server
```bash
cd "c:/Users/devan/OneDrive/Desktop/Neuro Nexus/BACKEND"
npm run dev
```

**Expected output:**
```
MongoDB Connected ✅
Server running on port 5000 🔥
```

### 2. Start the Frontend (New Terminal)
```bash
cd "c:/Users/devan/OneDrive/Desktop/Neuro Nexus/BACKEND/frontend"
npm run dev
```

**Expected output:**
```
Local: http://localhost:5173
```

### 3. Open the App
```
Open browser → http://localhost:5173
```

### 4. Login/Register
- Click on Login
- Enter any email: `test@example.com`
- Password: `test123`
- Click Login

### 5. Test Mood Feature
- Go to Home page
- Select a mood (Happy, Calm, Stressed, or Sad)
- **Check browser console (F12) for logs**
- Should see success message

### 6. Verify Data Saved
```javascript
// In browser console, check:
localStorage.getItem('neuro_token') // Should exist
```

**Check MongoDB:**
- Go to https://cloud.mongodb.com/
- Select `neuro-nexus` database
- Open `moods` collection
- Should see your mood entry

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env file)
Check that file exists at:
```
c:/Users/devan/OneDrive/Desktop/Neuro Nexus/BACKEND/.env
```

Should contain:
```
MONGO_URI=mongodb+srv://barotdevanshi25_db_user:Devanshi123@neuro-nexus.y2aww2f.mongodb.net/neuro-nexus
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
PORT=5000
```

### Frontend (.env file)
If needed, create:
```
c:/Users/devan/OneDrive/Desktop/Neuro Nexus/BACKEND/frontend/.env
```

With:
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 MANUAL TESTING WITH CURL

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 3. Copy the TOKEN from response

# 4. Save mood (replace TOKEN)
curl -X POST http://localhost:5000/api/moods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"mood":"happy","note":"test"}'

# 5. Get moods
curl -X GET http://localhost:5000/api/moods \
  -H "Authorization: Bearer TOKEN"
```

---

## 📱 WHAT EACH LOG MESSAGE MEANS

| Message | Status | What to do |
|---------|--------|-----------|
| `[API INTERCEPTOR] Token found` | ✓ Good | Token is in localStorage |
| `[API INTERCEPTOR] No token found` | ❌ Bad | User is not logged in |
| `[MoodCard] Sending mood data` | ✓ Good | Frontend is sending data |
| `[MoodCard] Response from server` | ✓ Good | Backend response received |
| `[MOOD API] Received request` | ✓ Good | Backend got the request |
| `[DB SUCCESS] Mood saved` | ✓ Good | Data saved to database ✅ |
| `Invalid mood value` | ❌ Bad | Check mood enum values |
| `User authentication failed` | ❌ Bad | Token is invalid |

---

## 🚨 IF STILL NOT WORKING

Please provide these details:
1. **What error do you see in browser console?** (F12 → Console)
2. **What error do you see in terminal?** (Where you run `npm run dev`)
3. **Are you logged in?** (Check if you can see home page after login)
4. **Screenshot of the console errors**

---

## ⚡ QUICK FIXES

### Cache Issues
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then reload the page
```

### Token Expires
- Token lasts 24 hours
- If old, login again

### Wrong API URL
Check in browser console:
```javascript
import.meta.env.VITE_API_URL
```

Should be: `http://localhost:5000/api`

---

## ✅ FINAL CHECKLIST

- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev` in frontend folder)
- [ ] Logged in successfully
- [ ] Browser console shows no errors
- [ ] Click mood button
- [ ] See success toast message
- [ ] Check browser console logs
- [ ] Check MongoDB for saved data

If all checked ✓ then mood data IS being saved! 🎉
