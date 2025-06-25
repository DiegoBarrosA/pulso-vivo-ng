/**
 * MSAL Configuration Debug Script (B2C Compatible)
 * Run this in the browser console to diagnose MSAL issues
 */

// Configuration from your environment
const config = {
  clientId: "7549ac9c-9294-4bb3-98d6-752d12b13d81",
  authority: "https://PulsoVivo.b2clogin.com/PulsoVivo.onmicrosoft.com/B2C_1_pulso_vivo_register_and_login", // Correct B2C authority
  redirectUri: "http://localhost:4200",
  scopes: ["openid", "profile"], // Correct B2C scopes
  clientCapabilities: ["CP1"],
  // B2C specific settings
  isB2C: true, // Set to true for B2C
  tenantId: "82c6cf20-e689-4aa9-bedf-7acaf7c4ead7",
  tenantName: "PulsoVivo",
  policyName: "B2C_1_pulso_vivo_register_and_login"
};

console.log("🔍 MSAL Configuration Debug Script (B2C Compatible)");
console.log("====================================================");

// Detect if configuration is B2C
const isB2CConfig = config.authority.includes('.b2clogin.com') || config.authority.includes('B2C_1_') || config.isB2C;

// Extract tenant ID
const tenantId = config.authority.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)?.[1] || config.tenantId;

console.log("\n📋 Current Configuration:");
console.log("Configuration Type:", isB2CConfig ? "🏢 Azure AD B2C" : "🏢 Azure AD");
console.log("Client ID:", config.clientId);
console.log("Tenant ID:", tenantId);
console.log("Authority:", config.authority);
console.log("Redirect URI:", config.redirectUri);
console.log("Current URL:", window.location.href);
console.log("Current Origin:", window.location.origin);

// Validation checks
console.log("\n✅ Validation Checks:");

// Check if redirect URI matches current origin
const redirectMatches = config.redirectUri.startsWith(window.location.origin);
console.log("Redirect URI matches current origin:", redirectMatches ? "✅ YES" : "❌ NO");

if (!redirectMatches) {
  console.warn("⚠️ Redirect URI mismatch!");
  console.warn("Expected:", window.location.origin);
  console.warn("Configured:", config.redirectUri);
}

// Check client ID format
const clientIdValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.clientId);
console.log("Client ID format valid:", clientIdValid ? "✅ YES" : "❌ NO");

// Check authority format (B2C vs Regular Azure AD)
let authorityValid = false;
if (isB2CConfig) {
  authorityValid = /^https:\/\/[a-zA-Z0-9-]+\.b2clogin\.com\/[a-zA-Z0-9-]+\.onmicrosoft\.com\/[a-zA-Z0-9_]+$/i.test(config.authority);
  console.log("B2C Authority format valid:", authorityValid ? "✅ YES" : "❌ NO");
  console.log("Contains B2C policy:", config.authority.includes("B2C_1_") ? "✅ YES" : "❌ NO");
} else {
  authorityValid = /^https:\/\/login\.microsoftonline\.com\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.authority);
  console.log("Azure AD Authority format valid:", authorityValid ? "✅ YES" : "❌ NO");
}

// Check SPA configuration
const hasSpaCapabilities = config.clientCapabilities.includes("CP1");
console.log("SPA capabilities configured:", hasSpaCapabilities ? "✅ YES" : "⚠️ NO");

// B2C specific checks
if (isB2CConfig) {
  console.log("\n🏢 B2C Specific Checks:");
  console.log("Authority contains placeholder:", config.authority.includes("your-tenant-name") ? "❌ YES (needs replacement)" : "✅ NO");
  console.log("Scopes format check:", config.scopes.some(s => s.includes('.onmicrosoft.com') || s === 'openid' || s === 'profile') ? "✅ B2C format detected" : "⚠️ Check B2C scope format");
}

console.log("\n🌐 Azure Portal Links:");
console.log("App Registration:", `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/${config.clientId}`);
console.log("Authentication Settings:", `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/${config.clientId}`);
console.log("API Permissions:", `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/${config.clientId}`);

console.log(`\n🛠️ Common 400 Error Solutions (${isB2CConfig ? 'B2C' : 'Azure AD'}):`);
if (isB2CConfig) {
  console.log("1. Ensure app is configured as 'Single-page application' in Azure B2C");
  console.log("2. Set validateAuthority: false in MSAL configuration (CRITICAL for B2C)");
  console.log("3. Add B2C domain to knownAuthorities (e.g., ['tenant.b2clogin.com'])");
  console.log("4. Verify redirect URI is registered exactly as:", config.redirectUri);
  console.log("5. Check that authority includes correct policy name (B2C_1_xxx)");
  console.log("6. Ensure scopes use B2C format (https://tenant.onmicrosoft.com/api/scope)");
  console.log("7. Wait 5-10 minutes after B2C changes for propagation");
} else {
  console.log("1. Ensure app is configured as 'Single-page application' in Azure AD");
  console.log("2. Verify redirect URI is registered exactly as:", config.redirectUri);
  console.log("3. Check that client ID and tenant ID are correct");
  console.log("4. Ensure proper scopes are configured");
  console.log("5. Wait 2-3 minutes after Azure AD changes for propagation");
}

// Issuer validation info
console.log("\n🎫 Issuer Validation Info:");
const expectedIssuer = `https://sts.windows.net/${tenantId}/`;
console.log("Expected issuer (STS format):", expectedIssuer);
console.log("Alternative issuer (v2.0):", `https://login.microsoftonline.com/${tenantId}/v2.0`);
if (isB2CConfig) {
  console.log("B2C issuer may vary based on policy and configuration");
  console.log("Common B2C issuer format:", `https://sts.windows.net/${tenantId}/`);
}

console.log("\n⚠️ Issuer Mismatch Solution:");
console.log("If you see issuer validation errors, configure your API to accept multiple issuers:");
console.log("- https://sts.windows.net/" + tenantId + "/");
console.log("- https://login.microsoftonline.com/" + tenantId + "/v2.0");
if (isB2CConfig) {
  console.log("- https://your-tenant-name.b2clogin.com/" + tenantId + "/v2.0/");
}

console.log("\n🔬 Advanced Debugging:");
console.log("Run this in console to test token acquisition:");
console.log(`
// Test MSAL token acquisition
if (window.msalInstance) {
  window.msalInstance.acquireTokenSilent({
    scopes: ['user.read'],
    account: window.msalInstance.getAllAccounts()[0],
    forceRefresh: false
  }).then(response => {
    console.log('✅ Token acquired successfully!', response);
    console.log('Access Token:', response.accessToken);
    console.log('ID Token:', response.idToken);
    
    // Decode and display JWT tokens
    if (response.accessToken) {
      const accessTokenDecoded = decodeJWT(response.accessToken);
      console.log('Access Token Decoded:', accessTokenDecoded);
    }
    if (response.idToken) {
      const idTokenDecoded = decodeJWT(response.idToken);
      console.log('ID Token Decoded:', idTokenDecoded);
    }
  }).catch(error => {
    console.error('❌ Token acquisition failed:', error);
    console.error('Error code:', error.errorCode);
    console.error('Error message:', error.errorMessage);
  });
} else {
  console.log('MSAL instance not found. Check if MSAL is properly initialized.');
}

// JWT Decoder function
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Add human-readable timestamps
    if (decoded.exp) {
      decoded.exp_readable = new Date(decoded.exp * 1000).toLocaleString();
    }
    if (decoded.iat) {
      decoded.iat_readable = new Date(decoded.iat * 1000).toLocaleString();
    }
    if (decoded.nbf) {
      decoded.nbf_readable = new Date(decoded.nbf * 1000).toLocaleString();
    }
    
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return { error: 'Failed to decode JWT' };
  }
}

// Copy token to clipboard function
function copyTokenToClipboard(tokenType = 'access') {
  if (window.msalInstance) {
    const accounts = window.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      window.msalInstance.acquireTokenSilent({
        scopes: ['user.read'],
        account: accounts[0],
        forceRefresh: false
      }).then(response => {
        const token = tokenType === 'access' ? response.accessToken : response.idToken;
        if (token) {
          navigator.clipboard.writeText(token).then(() => {
            console.log('✅ Token copied to clipboard!');
            alert('Token copied to clipboard!');
          }).catch(() => {
            console.log('Token (copy manually):', token);
            alert('Failed to copy automatically. Check console for token.');
          });
        } else {
          console.log('No token available');
        }
      }).catch(error => {
        console.error('Failed to get token:', error);
      });
    } else {
      console.log('No accounts available');
    }
  } else {
    console.log('MSAL instance not found');
  }
}
`);

// Test network connectivity to Azure AD/B2C
console.log(`\n🌐 Testing ${isB2CConfig ? 'B2C' : 'Azure AD'} connectivity...`);
fetch(`${config.authority}/.well-known/openid_configuration`)
  .then(response => {
    if (response.ok) {
      console.log(`✅ ${isB2CConfig ? 'B2C' : 'Azure AD'} endpoint is reachable`);
      return response.json();
    } else {
      console.error(`❌ ${isB2CConfig ? 'B2C' : 'Azure AD'} endpoint returned:`, response.status, response.statusText);
    }
  })
  .then(data => {
    if (data) {
      console.log("✅ OpenID configuration loaded");
      console.log("Token endpoint:", data.token_endpoint);
      console.log("Authorization endpoint:", data.authorization_endpoint);
      console.log("Issuer:", data.issuer);
      
      // Check issuer format
      if (data.issuer) {
        const issuerMatchesSTS = data.issuer.includes('sts.windows.net');
        const issuerMatchesLogin = data.issuer.includes('login.microsoftonline.com');
        console.log("Issuer uses STS format:", issuerMatchesSTS ? "✅ YES" : "❌ NO");
        console.log("Issuer uses login.microsoftonline format:", issuerMatchesLogin ? "✅ YES" : "❌ NO");
        
        if (issuerMatchesSTS) {
          console.log("ℹ️ This explains the STS issuer in your tokens");
        }
      }
    }
  })
  .catch(error => {
    console.error(`❌ Failed to reach ${isB2CConfig ? 'B2C' : 'Azure AD'} endpoint:`, error);
  });

// Generate curl command for manual testing
console.log("\n🔧 Manual Testing Commands:");
console.log(`Test ${isB2CConfig ? 'B2C' : 'Azure AD'} connectivity:`);
console.log(`curl -s "${config.authority}/.well-known/openid_configuration" | jq .`);

if (isB2CConfig) {
  console.log("\n🏢 B2C Configuration Template:");
  console.log("Current correct configuration for your environment.ts:");
  console.log(`authority: "https://PulsoVivo.b2clogin.com/PulsoVivo.onmicrosoft.com/B2C_1_pulso_vivo_register_and_login"`);
  console.log(`validateAuthority: false`);
  console.log(`knownAuthorities: ["PulsoVivo.b2clogin.com"]`);
  console.log(`scopes: ["openid", "profile"]`);
}

console.log("\n🎫 JWT Token Utilities:");
console.log("Copy access token to clipboard:");
console.log("copyTokenToClipboard('access')");
console.log("\nCopy ID token to clipboard:");
console.log("copyTokenToClipboard('id')");
console.log("\nDecode any JWT token:");
console.log("decodeJWT('your-jwt-token-here')");

console.log("\n📝 Next Steps:");
console.log("1. Fix any validation errors shown above");
console.log("2. Update Azure AD app registration if needed");
console.log("3. Clear browser cache and cookies");
console.log("4. Restart your development server");
console.log("5. Test authentication again");
console.log("6. Use token utilities above to examine JWT tokens");

console.log("\n🔍 For more detailed debugging, navigate to: http://localhost:4200/debug/msal");