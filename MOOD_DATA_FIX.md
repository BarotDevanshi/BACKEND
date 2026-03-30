# Mood Data Storage - Debugging & Fixes

## Issues Found & Fixed ✅

### 1. **Improved Logging**
- Added detailed console logs to track data flow
- Frontend: Logs when sending mood data
- Backend: Logs received data, validation, and database saves

### 2. **Better Error Handling**
- Controller now checks if user ID exists
- Validation errors are logged
- Error responses include more details

### 3. **Token Verification**
- API interceptor now logs token status
- Helps identify authentication issues

---

## How to Test the Mood Feature

### Step 1: Check Browser Console
1. Open your app in browser
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. When you click a mood button, you should see:
   ```
   [API INTERCEPTOR] Token check: Token found
   [API INTERCEPTOR] Authorization header set
   [MoodCard] Sending mood data: {mood: "happy", note: "home"}
   [MoodCard] Response from server: {...}
   ```

### Step 2: Check Backend Logs
When mood is submitted, server logs should show:
```
[MOOD API] Received request with: {body: {...}, userId: <ID>}
[DB SUCCESS] Mood saved for userId: <ID>
```

### Step 3: Verify in Database
1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Navigate to your database cluster
3. Look for `neuro-nexus` database
4. Find the `moods` collection
5. You should see your mood entries

---

## Common Issues & Solutions

### ❌ Issue: "No token found" in logs
**Solution:**
- Make sure you're logged in first
- Check that login token is saved to localStorage
- Token key should be: `neuro_token`

**Fix Code:**
```javascript
// After successful login, verify token is saved:
console.log(localStorage.getItem('neuro_token')); // Should show token
```

### ❌ Issue: "Invalid mood value" validation error
**Solution:**
Valid mood values are: `happy`, `sad`, `stressed`, `neutral`, `angry`

**Frontend sends:** ✅
- `happy` → Happy
- `neutral` → Calm
- `stressed` → Stressed
- `sad` → Sad

**Note:** Add "angry" option to MoodCard if needed

### ❌ Issue: "User authentication failed" error
**Solution:**
- The JWT token might be invalid or expired
- Try logging out and logging back in
- Clear browser cache and localStorage

**Debug Code:**
```javascript
// Add to browser console:
localStorage.removeItem('neuro_token');
localStorage.removeItem('nn-displayName');
// Then login again
```

### ❌ Issue: Connection timeout or 500 error
**Solution:**
- Check if MongoDB is connected
- Verify MONGO_URI in .env file
- Restart the server

**Check connection:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "database": "Connected",
  "serverTime": "2026-03-30T...",
  "environment": "development"
}
```

---

## Next Steps to Verify

After implementing these changes:

1. **Restart the backend**
   ```bash
   npm run dev
   # or
   node server.js
   ```

2. **Clear frontend cache and refresh**
   - Press `Ctrl+Shift+Delete` to clear browser cache
   - Reload the page

3. **Test**
   - Login
   - Select a mood
   - Check browser console for logs
   - Check database for saved data

4. **Verify the GET endpoint works**
   - Navigate to moods page
   - Should display saved moods
   - Check console for `[MOOD API] Received request` logs

---

## Full Debugging Checklist

- [ ] Backend logs show token is received
- [ ] Backend logs show mood data is received
- [ ] Backend logs show successful database save
- [ ] Frontend shows success toast message
- [ ] Database contains the mood entry
- [ ] GET /api/moods returns the saved mood

---

## If It Still Doesn't Work

Check these files for errors:

1. **Frontend Logs** → Browser Console (F12)
2. **Backend Logs** → Terminal output
3. **Database** → MongoDB Atlas UI
4. **Network Tab** → F12 → Network tab → Check API request headers

Provide the error messages from any of these sources for further debugging.
