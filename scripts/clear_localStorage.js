// Clear localStorage script for C&C CRM
// Run this in the browser console to clear all mock data

console.log('🧹 Clearing C&C CRM localStorage...');

// Clear all journey-related data
localStorage.removeItem('journey-storage');
localStorage.removeItem('auth-token');
localStorage.removeItem('super-admin-token');
localStorage.removeItem('access_token');

// Clear any other potential mock data
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('journey') || key.includes('mock') || key.includes('demo'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🗑️ Removed: ${key}`);
});

console.log('✅ localStorage cleared! Refresh the page to load real data.');
console.log('📊 You should now see:');
console.log('   - Real LGM users (32 users)');
console.log('   - No mock journey data');
console.log('   - Real API data only');

// Optional: Reload the page
// window.location.reload(); 