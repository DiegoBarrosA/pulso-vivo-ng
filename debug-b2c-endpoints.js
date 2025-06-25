/**
 * B2C Endpoint Debugging Script
 * Run this in the browser console to debug B2C policy and endpoint issues
 */

// B2C Configuration from your environment
const b2cConfig = {
  tenantName: "pulsovivo",
  tenantDomain: "pulsovivo.b2clogin.com",
  tenantId: "82c6cf20-e689-4aa9-bedf-7acaf7c4ead7",
  clientId: "7549ac9c-9294-4bb3-98d6-752d12b13d81",
  currentAuthority: "https://pulsovivo.b2clogin.com/pulsovivo.onmicrosoft.com/B2C_1_signupsignin",
  // Common B2C policy names to test
  commonPolicies: [
    "B2C_1_signupsignin",
    "B2C_1_signup_signin",
    "B2C_1_susi",
    "B2C_1_sign_up_sign_in",
    "B2C_1_SignUpSignIn",
    "B2C_1_signin",
    "B2C_1_signup",
    "B2C_1_ropc",
    "B2C_1_edit_profile",
    "B2C_1_password_reset"
  ]
};

console.log("🔍 B2C Endpoint Debugging Tool");
console.log("==============================");

console.log("\n📋 Current B2C Configuration:");
console.log("Tenant Name:", b2cConfig.tenantName);
console.log("Tenant Domain:", b2cConfig.tenantDomain);
console.log("Tenant ID:", b2cConfig.tenantId);
console.log("Client ID:", b2cConfig.clientId);
console.log("Current Authority:", b2cConfig.currentAuthority);

// Function to test a specific policy endpoint
async function testPolicyEndpoint(policyName) {
  const testUrl = `https://${b2cConfig.tenantDomain}/${b2cConfig.tenantName}.onmicrosoft.com/${policyName}/v2.0/.well-known/openid-configuration`;
  
  try {
    const response = await fetch(testUrl);
    if (response.ok) {
      const data = await response.json();
      return {
        policy: policyName,
        status: 'SUCCESS',
        url: testUrl,
        data: data
      };
    } else {
      return {
        policy: policyName,
        status: 'ERROR',
        statusCode: response.status,
        url: testUrl
      };
    }
  } catch (error) {
    return {
      policy: policyName,
      status: 'FAILED',
      error: error.message,
      url: testUrl
    };
  }
}

// Test alternative B2C discovery endpoint formats
async function testDiscoveryEndpoints() {
  console.log("\n🌐 Testing B2C Discovery Endpoints:");
  console.log("===================================");
  
  // Test general tenant discovery
  const generalEndpoints = [
    `https://${b2cConfig.tenantDomain}/${b2cConfig.tenantName}.onmicrosoft.com/v2.0/.well-known/openid_configuration`,
    `https://${b2cConfig.tenantDomain}/${b2cConfig.tenantId}/v2.0/.well-known/openid_configuration`,
    `https://login.microsoftonline.com/${b2cConfig.tenantId}/v2.0/.well-known/openid_configuration`,
    `https://login.microsoftonline.com/${b2cConfig.tenantName}.onmicrosoft.com/v2.0/.well-known/openid_configuration`
  ];
  
  for (const endpoint of generalEndpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint} - ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   Issuer: ${data.issuer}`);
        console.log(`   Authorization endpoint: ${data.authorization_endpoint}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Network Error: ${error.message}`);
    }
  }
}

// Test all common policy names
async function testCommonPolicies() {
  console.log("\n🔍 Testing Common B2C Policy Names:");
  console.log("===================================");
  
  const results = [];
  
  for (const policy of b2cConfig.commonPolicies) {
    const result = await testPolicyEndpoint(policy);
    results.push(result);
    
    if (result.status === 'SUCCESS') {
      console.log(`✅ ${policy} - WORKING!`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Issuer: ${result.data.issuer}`);
      console.log(`   Authorization: ${result.data.authorization_endpoint}`);
      console.log(`   Token: ${result.data.token_endpoint}`);
    } else {
      console.log(`❌ ${policy} - ${result.status} (${result.statusCode || result.error})`);
    }
  }
  
  const workingPolicies = results.filter(r => r.status === 'SUCCESS');
  
  if (workingPolicies.length > 0) {
    console.log(`\n🎉 Found ${workingPolicies.length} working policy(ies):`);
    workingPolicies.forEach(policy => {
      console.log(`   - ${policy.policy}`);
    });
    
    console.log(`\n📝 Recommended Configuration:`);
    const recommendedPolicy = workingPolicies[0];
    const recommendedAuthority = `https://${b2cConfig.tenantDomain}/${b2cConfig.tenantName}.onmicrosoft.com/${recommendedPolicy.policy}`;
    console.log(`authority: "${recommendedAuthority}"`);
    
    // Generate environment update
    console.log(`\n🔧 Update your environment.ts:`);
    console.log(`azureAd: {`);
    console.log(`  clientId: "${b2cConfig.clientId}",`);
    console.log(`  authority: "${recommendedAuthority}",`);
    console.log(`  redirectUri: "http://localhost:4200",`);
    console.log(`  postLogoutRedirectUri: "http://localhost:4200",`);
    console.log(`  scopes: ["openid", "profile"],`);
    console.log(`  knownAuthorities: ["${b2cConfig.tenantDomain}"],`);
    console.log(`  validateAuthority: false,`);
    console.log(`  navigateToLoginRequestUrl: false,`);
    console.log(`  clientCapabilities: ["CP1"]`);
    console.log(`}`);
    
  } else {
    console.log(`\n❌ No working policies found. This might indicate:`);
    console.log(`   1. The B2C tenant doesn't exist or isn't configured`);
    console.log(`   2. The policies have different names`);
    console.log(`   3. The tenant domain is incorrect`);
    console.log(`   4. Network connectivity issues`);
  }
  
  return workingPolicies;
}

// Test B2C tenant management endpoint
async function testTenantManagement() {
  console.log("\n🏢 Testing B2C Tenant Management:");
  console.log("=================================");
  
  const managementEndpoints = [
    `https://graph.microsoft.com/v1.0/directoryObjects?$filter=displayName eq '${b2cConfig.tenantName}'`,
    `https://graph.microsoft.com/beta/tenants?$filter=defaultDomainName eq '${b2cConfig.tenantName}.onmicrosoft.com'`
  ];
  
  for (const endpoint of managementEndpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`${response.ok ? '✅' : '❌'} Graph API test - ${response.status}`);
      if (!response.ok && response.status === 401) {
        console.log(`   ℹ️ 401 is expected (authentication required)`);
      }
    } catch (error) {
      console.log(`❌ Graph API test - Network Error: ${error.message}`);
    }
  }
}

// Generate Azure Portal links for B2C management
function generatePortalLinks() {
  console.log("\n🌐 Azure B2C Portal Links:");
  console.log("==========================");
  console.log(`B2C Tenant Overview: https://portal.azure.com/#view/Microsoft_AAD_B2CAdmin/TenantManagementMenuBlade/~/overview/tenantId/${b2cConfig.tenantId}`);
  console.log(`User Flows (Policies): https://portal.azure.com/#view/Microsoft_AAD_B2CAdmin/TenantManagementMenuBlade/~/UserFlows/tenantId/${b2cConfig.tenantId}`);
  console.log(`App Registrations: https://portal.azure.com/#view/Microsoft_AAD_B2CAdmin/TenantManagementMenuBlade/~/Applications/tenantId/${b2cConfig.tenantId}`);
  console.log(`Your App: https://portal.azure.com/#view/Microsoft_AAD_B2CAdmin/ApplicationMenuBlade/~/Overview/appId/${b2cConfig.clientId}/tenantId/${b2cConfig.tenantId}`);
}

// Check current MSAL instance configuration
function checkCurrentMSAL() {
  console.log("\n🔍 Current MSAL Instance Check:");
  console.log("===============================");
  
  if (window.msalInstance) {
    const config = window.msalInstance.getConfiguration();
    console.log("✅ MSAL instance found");
    console.log("Client ID:", config.auth.clientId);
    console.log("Authority:", config.auth.authority);
    console.log("Known Authorities:", config.auth.knownAuthorities);
    console.log("Validate Authority:", config.auth.validateAuthority);
    
    const accounts = window.msalInstance.getAllAccounts();
    console.log("Accounts:", accounts.length);
    
    if (accounts.length > 0) {
      console.log("Active Account:", accounts[0].username);
      console.log("Account Environment:", accounts[0].environment);
    }
  } else {
    console.log("❌ No MSAL instance found in window");
  }
}

// Manual policy testing function
function testCustomPolicy(policyName) {
  console.log(`\n🧪 Testing custom policy: ${policyName}`);
  return testPolicyEndpoint(policyName).then(result => {
    if (result.status === 'SUCCESS') {
      console.log(`✅ ${policyName} - WORKING!`);
      console.log(`URL: ${result.url}`);
      return result;
    } else {
      console.log(`❌ ${policyName} - ${result.status} (${result.statusCode || result.error})`);
      return null;
    }
  });
}

// Troubleshooting steps
function showTroubleshootingSteps() {
  console.log("\n🛠️ B2C Troubleshooting Steps:");
  console.log("=============================");
  console.log("1. Check if B2C tenant exists and is accessible");
  console.log("2. Verify user flows (policies) are created and published");
  console.log("3. Confirm app registration is configured as SPA");
  console.log("4. Check if custom domains are configured");
  console.log("5. Verify network connectivity to b2clogin.com");
  console.log("6. Test with different policy names");
  console.log("7. Check Azure Portal for exact policy names");
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Running Complete B2C Diagnostic...");
  console.log("=====================================");
  
  checkCurrentMSAL();
  await testDiscoveryEndpoints();
  const workingPolicies = await testCommonPolicies();
  await testTenantManagement();
  generatePortalLinks();
  showTroubleshootingSteps();
  
  if (workingPolicies.length === 0) {
    console.log("\n❗ RECOMMENDATION:");
    console.log("No working policies found. Please:");
    console.log("1. Check Azure B2C Portal for exact policy names");
    console.log("2. Verify the tenant name is correct");
    console.log("3. Ensure policies are published");
    console.log("4. Test with: testCustomPolicy('YOUR_EXACT_POLICY_NAME')");
  }
  
  return workingPolicies;
}

// Expose functions globally for manual testing
window.b2cDebug = {
  testPolicyEndpoint,
  testCustomPolicy,
  runAllTests,
  checkCurrentMSAL,
  config: b2cConfig
};

console.log("\n💡 Available Commands:");
console.log("======================");
console.log("runAllTests() - Run complete diagnostic");
console.log("testCustomPolicy('policy_name') - Test specific policy");
console.log("checkCurrentMSAL() - Check current MSAL configuration");
console.log("b2cDebug.config - View current B2C configuration");

// Auto-run basic tests
console.log("\n🔄 Auto-running basic tests...");
runAllTests().then(workingPolicies => {
  if (workingPolicies.length > 0) {
    console.log(`\n🎯 SUCCESS: Found ${workingPolicies.length} working policy(ies)!`);
    console.log("Copy the recommended configuration above to fix your setup.");
  } else {
    console.log("\n⚠️ No working policies found. Check the troubleshooting steps above.");
  }
});