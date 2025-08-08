#!/usr/bin/env node
/**
 * 🔧 Clear Mock Journey Data Script
 * =================================
 * 
 * This script clears any mock journey data from localStorage and ensures
 * the system starts fresh with real API data.
 * 
 * Run this in the browser console to clear mock data.
 */

console.log('🔧 Clearing mock journey data from localStorage...');

// Clear journey-related localStorage items
const itemsToClear = [
  'journey-storage',
  'journey-storage-state',
  'mock-journeys',
  'test-journeys'
];

itemsToClear.forEach(item => {
  if (localStorage.getItem(item)) {
    localStorage.removeItem(item);
    console.log(`✅ Cleared: ${item}`);
  }
});

// Clear any cookies that might contain mock data
const cookiesToClear = [
  'journey-data',
  'mock-journeys',
  'test-data'
];

cookiesToClear.forEach(cookie => {
  document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log(`✅ Cleared cookie: ${cookie}`);
});

// Force refresh the journey store
if (window.location.href.includes('dashboard') || window.location.href.includes('journeys')) {
  console.log('🔄 Refreshing page to load fresh data...');
  window.location.reload();
} else {
  console.log('✅ Mock data cleared. Navigate to dashboard to see real data.');
}

console.log('🎯 Mock journey data cleanup complete!'); 