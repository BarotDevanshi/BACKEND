// Add this to browser console (F12 → Console) and run it to diagnose the issue

console.log("=== NEURO NEXUS DEBUGGING TOOL ===");

// 1. Check if logged in
const token = localStorage.getItem('neuro_token');
console.log("✓ Token stored?", !!token ? "YES" : "NO ❌");
if (token) {
  console.log("  Token:", token.substring(0, 50) + "...");
}

// 2. Check API base URL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log("✓ API Base URL:", baseURL);

// 3. Test with manual fetch
async function testMoodAPI() {
  console.log("\n=== Testing Mood API ===");

  if (!token) {
    console.error("❌ No token! You must be logged in.");
    return;
  }

  try {
    const response = await fetch(`${baseURL}/moods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        mood: 'happy',
        note: 'test from console'
      })
    });

    console.log("Response Status:", response.status);
    const data = await response.json();
    console.log("Response Data:", data);

    if (response.ok) {
      console.log("✓ Mood saved successfully!");
    } else {
      console.error("❌ Error:", data);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

// 4. Check localStorage
console.log("\n=== LocalStorage Contents ===");
console.log("neuro_token:", localStorage.getItem('neuro_token') ? "✓ Present" : "❌ Missing");
console.log("nn-displayName:", localStorage.getItem('nn-displayName'));

// Run the test
testMoodAPI();

// 5. Show results
console.log("\n=== NEXT STEPS ===");
console.log("If 'No token' error:");
console.log("  → You need to LOGIN first");
console.log("\nIf 'Mood saved successfully':");
console.log("  → Check MongoDB database for the entry");
console.log("\nIf network error:");
console.log("  → Check if backend server is running on port 5000");
