/**
 * B2C Redirect URI Fix Guide and Verification Script
 * Run this in browser console to get step-by-step instructions
 */

console.log("🔧 B2C Redirect URI Fix Guide");
console.log("=============================");

const b2cConfig = {
  clientId: "7549ac9c-9294-4bb3-98d6-752d12b13d81",
  tenantId: "82c6cf20-e689-4aa9-bedf-7acaf7c4ead7",
  redirectUri: "http://localhost:4200",
  currentError: "AADB2C90006 - redirect_uri_mismatch"
};

console.log("\n🚨 PROBLEM IDENTIFIED:");
console.log("Error Code: AADB2C90006");
console.log("Issue: Redirect URI not registered in Azure B2C");
console.log("Missing URI:", b2cConfig.redirectUri);
console.log("Client ID:", b2cConfig.clientId);

console.log("\n🛠️ STEP-BY-STEP FIX:");
console.log("====================");

console.log("\n1️⃣ OPEN AZURE B2C PORTAL:");
console.log("Click this link to go directly to your app:");
const appAuthUrl = `https://portal.azure.com/#view/Microsoft_AAD_B2CAdmin/ApplicationMenuBlade/~/Authentication/appId/${b2cConfig.clientId}/tenantId/${b2cConfig.tenantId}`;
console.log(appAuthUrl);

console.log("\n2️⃣ CONFIGURE AUTHENTICATION:");
console.log("▶️ In the Azure portal page that opens:");
console.log("   a) Look for 'Platform configurations' section");
console.log("   b) If you see a 'Web' platform → DELETE IT");
console.log("   c) Click 'Add a platform'");
console.log("   d) Select 'Single-page application (SPA)'");
console.log("   e) Enter redirect URI: http://localhost:4200");
console.log("   f) Click 'Configure'");
console.log("   g) Click 'Save' at the top");

console.log("\n3️⃣ VERIFICATION:");
console.log("After saving in Azure portal, run: verifyRedirectURI()");

// Function to verify if redirect URI is configured
async function verifyRedirectURI() {
  console.log("\n🔍 Verifying Redirect URI Configuration...");
  
  // We can't directly check the B2C app registration via API without auth,
  // but we can provide guidance on verification
  console.log("\n✅ VERIFICATION STEPS:");
  console.log("1. Check Azure portal shows redirect URI under SPA platform");
  console.log("2. Test login again from your app");
  console.log("3. Should no longer see redirect_uri_mismatch error");
  
  // Test the auth endpoint format
  const testAuthUrl = `https://PulsoVivo.b2clogin.com/PulsoVivo.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_pulso_vivo_register_and_login&client_id=${b2cConfig.clientId}&nonce=test&redirect_uri=${encodeURIComponent(b2cConfig.redirectUri)}&scope=openid&response_type=id_token&prompt=login`;
  
  console.log("\n🧪 TEST LOGIN URL:");
  console.log("If you want to test manually, try this URL:");
  console.log(testAuthUrl);
  console.log("\n⚠️  WARNING: Only click if you want to test login immediately");
  
  return testAuthUrl;
}

// Function to check current MSAL instance
function checkCurrentMSAL() {
  console.log("\n🔧 Current MSAL Configuration:");
  console.log("==============================");
  
  if (window.msalInstance) {
    const config = window.msalInstance.getConfiguration();
    console.log("✅ MSAL Instance found");
    console.log("Client ID:", config.auth.clientId);
    console.log("Authority:", config.auth.authority);
    console.log("Redirect URI:", config.auth.redirectUri);
    console.log("Known Authorities:", config.auth.knownAuthorities);
    
    // Check if redirect URI matches
    const redirectMatch = config.auth.redirectUri === b2cConfig.redirectUri;
    console.log("Redirect URI matches expected:", redirectMatch ? "✅ YES" : "❌ NO");
    
    return config;
  } else {
    console.log("❌ No MSAL instance found");
    return null;
  }
}

// Function to provide troubleshooting if still having issues
function troubleshootRedirectURI() {
  console.log("\n🔍 TROUBLESHOOTING REDIRECT URI ISSUES:");
  console.log("======================================");
  
  console.log("\n❌ If still seeing redirect_uri_mismatch:");
  console.log("1. Double-check the redirect URI is EXACTLY: http://localhost:4200");
  console.log("2. Ensure it's under 'Single-page application' platform (not Web)");
  console.log("3. Wait 2-3 minutes after saving for Azure changes to propagate");
  console.log("4. Clear browser cache and cookies");
  console.log("5. Restart your Angular development server");
  
  console.log("\n✅ Common Redirect URI Formats for Development:");
  console.log("- http://localhost:4200 (your current)");
  console.log("- http://localhost:4200/ (with trailing slash)");
  console.log("- https://localhost:4200 (if using HTTPS)");
  
  console.log("\n🔧 Alternative Testing Ports:");
  console.log("If port 4200 doesn't work, try these and update both:");
  console.log("- http://localhost:3000");
  console.log("- http://localhost:8080");
  console.log("- http://localhost:5000");
  
  console.log("\n📝 Production Redirect URIs:");
  console.log("For production, you'll need to add your actual domain:");
  console.log("- https://yourdomain.com");
  console.log("- https://www.yourdomain.com");
}

// Function to generate complete Azure B2C configuration checklist
function generateB2CChecklist() {
  console.log("\n📋 COMPLETE B2C CONFIGURATION CHECKLIST:");
  console.log("========================================");
  
  const checklist = [
    "✅ User flow (B2C_1_pulso_vivo_register_and_login) created and published",
    "✅ App registered as 'Single-page application' (not Web)",
    "✅ Redirect URI 'http://localhost:4200' added to SPA platform",
    "✅ Client ID copied to environment.ts",
    "✅ Authority URL formatted correctly",
    "✅ validateAuthority set to false",
    "✅ knownAuthorities includes B2C domain",
    "✅ Scopes configured (openid, profile)",
    "✅ Angular dev server restarted after config changes"
  ];
  
  checklist.forEach(item => console.log(item));
  
  return checklist;
}

// Main execution
console.log("\n🚀 IMMEDIATE ACTION REQUIRED:");
console.log("============================");
console.log("1. Click the Azure portal link above");
console.log("2. Add redirect URI to SPA platform");
console.log("3. Save changes in Azure portal");
console.log("4. Run verifyRedirectURI() to test");

// Expose functions for manual use
window.b2cFix = {
  verify: verifyRedirectURI,
  checkMSAL: checkCurrentMSAL,
  troubleshoot: troubleshootRedirectURI,
  checklist: generateB2CChecklist,
  config: b2cConfig
};

console.log("\n💡 AVAILABLE COMMANDS:");
console.log("======================");
console.log("verifyRedirectURI() - Test redirect URI configuration");
console.log("b2cFix.checkMSAL() - Check current MSAL config");
console.log("b2cFix.troubleshoot() - Show troubleshooting steps");
console.log("b2cFix.checklist() - Show complete configuration checklist");

// Auto-show the portal link prominently
console.log("\n🎯 CLICK THIS LINK NOW:");
console.log("=======================");
console.log("👆 " + appAuthUrl);
console.log("📝 Add redirect URI: http://localhost:4200");
console.log("💾 Save changes");
console.log("🔄 Then test login again");