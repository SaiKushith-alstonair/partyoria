// Run this in your browser console to clear all authentication data

console.log('🧹 Clearing all authentication data...');

// Clear localStorage
const localStorageKeys = [
    'access_token',
    'refresh_token', 
    'authToken',
    'token',
    'partyoria_user',
    'vendor_profile',
    'auth-storage'
];

localStorageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✓ Cleared localStorage: ${key}`);
    }
});

// Clear sessionStorage
const sessionStorageKeys = [
    'access_token',
    'refresh_token',
    'authToken',
    'token'
];

sessionStorageKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`✓ Cleared sessionStorage: ${key}`);
    }
});

// Clear cookies (if any)
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ All authentication data cleared!');
console.log('');
console.log('🔑 Now login with these credentials:');
console.log('   Email: test@example.com');
console.log('   Password: testpass123');
console.log('');
console.log('🔄 Refresh the page and try again.');

// Optionally reload the page
// window.location.reload();