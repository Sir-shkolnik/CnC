// Clear localStorage script for C&C CRM
// Run this in browser console to clear all stored data

console.log('🧹 Clearing C&C CRM localStorage...');

// Clear all journey-related storage
localStorage.removeItem('journey-storage');
localStorage.removeItem('auth-token');
localStorage.removeItem('super-admin-token');
localStorage.removeItem('access_token');

// Clear any other related storage
const keysToRemove = [
  'journey-storage',
  'auth-token', 
  'super-admin-token',
  'access_token',
  'user-data',
  'company-data',
  'lgm-data'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  }
});

// Clear sessionStorage too
sessionStorage.clear();
console.log('✅ Cleared sessionStorage');

// Clear cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cleared cookies');

console.log('🎉 All C&C CRM storage cleared! Refresh the page to load fresh data.'); 