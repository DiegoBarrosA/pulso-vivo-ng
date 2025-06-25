/**
 * Quick B2C Endpoint Test with Correct Configuration
 * Run this in the browser console to test the corrected B2C endpoints
 */

// Correct B2C Configuration based on your endpoint
const correctB2CConfig = {
  tenantName: "PulsoVivo",
  tenantDomain: "PulsoVivo.b2clogin.com",
  tenantId: "82c6cf20-e689-4aa9-bedf-7acaf7c4ead7",
  clientId: "7549ac9c-9294-4bb3-98d6-752d12b13d81",
  policyName: "B2C_1_pulso_vivo_register_and_login",
  authority: "https://PulsoVivo.b2clogin.com/PulsoVivo.onmicrosoft.com/B2C_1_pulso_vivo_register_and_login",
  scopes: ["openid", "profile"]
};

console.log("🔍 Testing Correct B2C Configuration");
console.log("====================================");

console.log("\n📋 Correct Configuration:");
console.log("Tenant Name:", correctB2CConfig.tenantName);
console.log("Tenant Domain:", correctB2CConfig.tenantDomain);
console.log("Policy Name:", correctB2CConfig.policyName);
console.log("Authority:", correctB2CConfig.authority);

// Test the correct endpoint
async function testCorrectEndpoint() {
  const wellKnownUrl = `${correctB2CConfig.authority}/v2.0/.well-known/openid-configuration`;
  
  console.log("\n🌐 Testing Well-Known Endpoint:");
  console.log("URL:", wellKnownUrl);
  
  try {
    const response = await fetch(wellKnownUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ SUCCESS! Endpoint is working");
      console.log("Issuer:", data.issuer);
      console.log("Authorization Endpoint:", data.authorization_endpoint);
      console.log("Token Endpoint:", data.token_endpoint);
      console.log("JWKS URI:", data.jwks_uri);
      
      // Check if this matches your provided endpoint structure
      const authEndpoint = data.authorization_endpoint;
      console.log("\n✅ Endpoint Validation:");
      console.log("Contains tenant:", authEndpoint.includes("PulsoVivo.b2clogin.com") ? "✅ YES" : "❌ NO");
      console.log("Contains policy:", authEndpoint.includes("B2C_1_pulso_vivo_register_and_login") ? "✅ YES" : "❌ NO");
      console.log("Uses v2.0:", authEndpoint.includes("v2.0") ? "✅ YES" : "❌ NO");
      
      return data;
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ NETWORK ERROR: ${error.message}`);
    return null;
  }
}

// Generate the complete environment configuration
function generateEnvironmentConfig() {
  console.log("\n📝 Complete Environment Configuration:");
  console.log("=====================================");
  
  const envConfig = `
export const environment = {
  production: false,

  // Configuración de Azure AD B2C - CORRECTED
  azureAd: {
    clientId: "${correctB2CConfig.clientId}",
    authority: "${correctB2CConfig.authority}",
    redirectUri: "http://localhost:4200",
    postLogoutRedirectUri: "http://localhost:4200",
    scopes: ${JSON.stringify(correctB2CConfig.scopes)},
    
    // B2C Required Settings
    knownAuthorities: ["${correctB2CConfig.tenantDomain}"],
    validateAuthority: false, // CRITICAL for B2C
    navigateToLoginRequestUrl: false,
    clientCapabilities: ["CP1"],
    
    // Optional B2C settings
    cloudDiscoveryMetadata: "",
    authorityMetadata: "",
    authorityDomain: "${correctB2CConfig.tenantDomain}"
  }
  // ... rest of your configuration
};`;

  console.log(envConfig);
  
  return envConfig;
}

// Test MSAL configuration compatibility
function testMSALCompatibility() {
  console.log("\n🔧 MSAL Configuration Test:");
  console.log("===========================");
  
  if (window.msalInstance) {
    const config = window.msalInstance.getConfiguration();
    console.log("Current Authority:", config.auth.authority);
    console.log("Expected Authority:", correctB2CConfig.authority);
    console.log("Authority Match:", config.auth.authority === correctB2CConfig.authority ? "✅ YES" : "❌ NO - UPDATE NEEDED");
    
    console.log("Current Known Authorities:", config.auth.knownAuthorities);
    console.log("Expected Known Authorities:", [correctB2CConfig.tenantDomain]);
    
    console.log("Validate Authority:", config.auth.validateAuthority);
    console.log("Should be false for B2C:", config.auth.validateAuthority === false ? "✅ CORRECT" : "❌ SHOULD BE FALSE");
  } else {
    console.log("❌ No MSAL instance found");
  }
}

// Check current error and provide fix
function analyzeCurrentError() {
  console.log("\n🐛 Error Analysis:");
  console.log("==================");
  
  const currentAuthority = "https://pulsovivo.b2clogin.com/pulsovivo.onmicrosoft.com/B2C_1_signupsignin";
  const correctAuthority = correctB2CConfig.authority;
  
  console.log("❌ PROBLEM IDENTIFIED:");
  console.log("Current (Wrong):", currentAuthority);
  console.log("Correct:", correctAuthority);
  
  console.log("\n🔍 Issues Found:");
  console.log("1. Tenant name case: 'pulsovivo' → 'PulsoVivo'");
  console.log("2. Policy name: 'B2C_1_signupsignin' → 'B2C_1_pulso_vivo_register_and_login'");
  
  console.log("\n✅ SOLUTION:");
  console.log("Update your environment.ts with the configuration shown above");
}

// Generate Azure Portal links
function generatePortalLinks() {
  console.log("\n🌐 Azure B2C Portal Links:");
  console.log("==========================");
  console.log(`B2C Overview: https://portal.azure.com/#view/Microsoft_AAD_B2CAdmin/TenantManagementMenuBlade/~/overview/tenantId/${correctB2CConfig.tenantId}`);
  console.log(`User Flows: https://portal.azure.com/#view/Microsoft_AAD_B2CAdmin/TenantManagementMenuBlade/~/UserFlows/tenantId/${correctB2CConfig.tenantId}`);
  console.log(`App Registration: https://portal.azure.com/#view/Microsoft_AAD_B2CAdmin/ApplicationMenuBlade/~/Overview/appId/${correctB2CConfig.clientId}/tenantId/${correctB2CConfig.tenantId}`);
}

// Main test function
async function runTest() {
  console.log("🚀 Running B2C Configuration Test...");
  
  analyzeCurrentError();
  const endpointData = await testCorrectEndpoint();
  testMSALCompatibility();
  generateEnvironmentConfig();
  generatePortalLinks();
  
  if (endpointData) {
    console.log("\n🎉 SUCCESS SUMMARY:");
    console.log("===================");
    console.log("✅ Correct B2C endpoint found and working");
    console.log("✅ Configuration generated");
    console.log("📝 Next step: Update your environment.ts file");
    console.log("🔄 Then restart your Angular development server");
  } else {
    console.log("\n❌ ENDPOINT TEST FAILED");
    console.log("Check network connectivity and B2C configuration");
  }
}

// Auto-run test
runTest();

// Expose for manual testing
window.testB2C = {
  config: correctB2CConfig,
  test: runTest,
  testEndpoint: testCorrectEndpoint,
  generateConfig: generateEnvironmentConfig
};

console.log("\n💡 Manual Commands Available:");
console.log("testB2C.test() - Run full test");
console.log("testB2C.testEndpoint() - Test endpoint only");
console.log("testB2C.generateConfig() - Generate configuration");