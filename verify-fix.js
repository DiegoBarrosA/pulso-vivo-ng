/**
 * Verification Script - Test if B2C Configuration Fix Worked
 * Run this in browser console after updating environment.ts
 */

console.log("🔍 B2C Configuration Fix Verification");
console.log("=====================================");

// Expected correct configuration
const expectedConfig = {
  tenantName: "PulsoVivo",
  tenantDomain: "PulsoVivo.b2clogin.com",
  policyName: "B2C_1_pulso_vivo_register_and_login",
  authority: "https://PulsoVivo.b2clogin.com/PulsoVivo.onmicrosoft.com/B2C_1_pulso_vivo_register_and_login",
  clientId: "7549ac9c-9294-4bb3-98d6-752d12b13d81",
  scopes: ["openid", "profile"]
};

// Test the well-known endpoint
async function verifyEndpoint() {
  const wellKnownUrl = `${expectedConfig.authority}/v2.0/.well-known/openid-configuration`;
  
  console.log("\n🌐 Testing Corrected Endpoint:");
  console.log("URL:", wellKnownUrl);
  
  try {
    const response = await fetch(wellKnownUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ SUCCESS! B2C endpoint is now working");
      console.log("✅ Issuer:", data.issuer);
      console.log("✅ Auth Endpoint:", data.authorization_endpoint);
      console.log("✅ Token Endpoint:", data.token_endpoint);
      return true;
    } else {
      console.log(`❌ FAILED: ${response.status} - ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

// Check current MSAL instance
function checkMSALConfig() {
  console.log("\n🔧 MSAL Instance Check:");
  console.log("=======================");
  
  if (window.msalInstance) {
    const config = window.msalInstance.getConfiguration();
    const currentAuthority = config.auth.authority;
    
    console.log("Current Authority:", currentAuthority);
    console.log("Expected Authority:", expectedConfig.authority);
    
    const authorityCorrect = currentAuthority === expectedConfig.authority;
    console.log("Authority Updated:", authorityCorrect ? "✅ YES" : "❌ NO - RESTART NEEDED");
    
    const knownAuth = config.auth.knownAuthorities;
    const knownAuthCorrect = knownAuth && knownAuth.includes(expectedConfig.tenantDomain);
    console.log("Known Authorities:", knownAuth);
    console.log("Known Auth Correct:", knownAuthCorrect ? "✅ YES" : "❌ NO");
    
    const validateAuth = config.auth.validateAuthority;
    console.log("Validate Authority:", validateAuth);
    console.log("Should be false:", validateAuth === false ? "✅ CORRECT" : "❌ SHOULD BE FALSE");
    
    return authorityCorrect && knownAuthCorrect && (validateAuth === false);
  } else {
    console.log("❌ No MSAL instance found (app may need restart)");
    return false;
  }
}

// Check for previous error
function checkForErrors() {
  console.log("\n🐛 Error Check:");
  console.log("===============");
  
  // Check console for recent 404 errors
  const has404Error = performance.getEntriesByType('resource').some(entry => 
    entry.name.includes('pulsovivo.b2clogin.com') && 
    entry.responseStatus === 404
  );
  
  if (has404Error) {
    console.log("⚠️ Still seeing 404 errors from old configuration");
    console.log("🔄 Restart your development server: npm start or ng serve");
  } else {
    console.log("✅ No 404 errors detected");
  }
  
  return !has404Error;
}

// Provide next steps
function showNextSteps(endpointWorking, msalCorrect, noErrors) {
  console.log("\n📝 Status Summary:");
  console.log("==================");
  console.log("B2C Endpoint Working:", endpointWorking ? "✅ YES" : "❌ NO");
  console.log("MSAL Config Updated:", msalCorrect ? "✅ YES" : "❌ NO");
  console.log("No 404 Errors:", noErrors ? "✅ YES" : "❌ NO");
  
  if (endpointWorking && msalCorrect && noErrors) {
    console.log("\n🎉 SUCCESS! Your B2C configuration is now correct!");
    console.log("✅ Try logging in at: http://localhost:4200/debug/msal");
    console.log("✅ Test authentication using the 'Test Login' button");
  } else {
    console.log("\n🔄 Next Steps:");
    
    if (!endpointWorking) {
      console.log("1. ❌ B2C endpoint not working - check tenant/policy names");
    }
    
    if (!msalCorrect) {
      console.log("2. ❌ Update environment.ts with correct configuration");
      console.log("   Copy the configuration from the debug output above");
    }
    
    if (!noErrors) {
      console.log("3. ❌ Restart development server to clear cached config:");
      console.log("   Stop current server (Ctrl+C) and run: ng serve");
    }
    
    console.log("\n📄 Reference Configuration:");
    console.log(`authority: "${expectedConfig.authority}"`);
    console.log(`knownAuthorities: ["${expectedConfig.tenantDomain}"]`);
    console.log(`validateAuthority: false`);
    console.log(`scopes: ${JSON.stringify(expectedConfig.scopes)}`);
  }
}

// Main verification function
async function runVerification() {
  console.log("🚀 Running verification...");
  
  const endpointWorking = await verifyEndpoint();
  const msalCorrect = checkMSALConfig();
  const noErrors = checkForErrors();
  
  showNextSteps(endpointWorking, msalCorrect, noErrors);
  
  return {
    endpointWorking,
    msalCorrect,
    noErrors,
    allGood: endpointWorking && msalCorrect && noErrors
  };
}

// Auto-run verification
runVerification().then(result => {
  if (result.allGood) {
    console.log("\n🎯 ALL CHECKS PASSED! B2C configuration is working correctly.");
  } else {
    console.log("\n⚠️ Some issues found. Follow the next steps above to complete the fix.");
  }
});

// Expose for manual use
window.verifyFix = runVerification;

console.log("\n💡 Manual command: verifyFix() - Run this verification again");