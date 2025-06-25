import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { MsalInitService } from '../../services/msal-init.service';
import { MsalDebugService, MsalConfigValidation } from '../../services/msal-debug.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-msal-debug',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './msal-debug.component.html',
  styles: [`
    .msal-debug-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .debug-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .debug-section h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }

    .status-grid, .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 10px;
    }

    .status-item, .config-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: white;
      border-radius: 4px;
      border: 1px solid #eee;
    }

    .status-item.success {
      border-left: 4px solid #28a745;
    }

    .status-item.error {
      border-left: 4px solid #dc3545;
    }

    .status-item.warning {
      border-left: 4px solid #ffc107;
    }

    .status-label, .config-label {
      font-weight: 600;
      color: #666;
    }

    .config-value {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      word-break: break-all;
    }

    .error-list, .warning-list, .suggestion-list {
      list-style: none;
      padding: 0;
    }

    .error-item, .warning-item, .suggestion-item {
      padding: 8px 12px;
      margin-bottom: 5px;
      border-radius: 4px;
    }

    .error-item {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .warning-item {
      background: #fff3cd;
      border: 1px solid #ffecb5;
      color: #856404;
    }

    .suggestion-item {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }

    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .debug-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .debug-btn.primary {
      background: #007bff;
      color: white;
    }

    .debug-btn.secondary {
      background: #6c757d;
      color: white;
    }

    .debug-btn.danger {
      background: #dc3545;
      color: white;
    }

    .debug-btn:hover {
      opacity: 0.9;
    }

    .link-group {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .azure-link {
      display: inline-block;
      padding: 8px 16px;
      background: #0078d4;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
    }

    .azure-link:hover {
      background: #106ebe;
    }

    .instruction-box {
      background: #e7f3ff;
      border: 1px solid #b3d9ff;
      border-radius: 4px;
      padding: 15px;
    }

    .instruction-list {
      margin: 10px 0;
      padding-left: 20px;
    }

    .instruction-list li {
      margin-bottom: 8px;
    }

    .instruction-list code {
      background: #f1f1f1;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    .error-log {
      max-height: 200px;
      overflow-y: auto;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }

    .log-entry {
      display: flex;
      padding: 5px 10px;
      border-bottom: 1px solid #eee;
    }

    .log-timestamp {
      color: #666;
      margin-right: 10px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .log-message {
      flex: 1;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .tokens-container {
      margin-top: 15px;
    }

    .token-section {
      margin-bottom: 25px;
      padding: 15px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: #ffffff;
    }

    .token-section h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #495057;
    }

    .token-section h5 {
      margin: 15px 0 5px 0;
      color: #6c757d;
      font-size: 0.9em;
    }

    .token-actions {
      margin-bottom: 15px;
    }

    .debug-btn.small {
      padding: 6px 12px;
      font-size: 0.85em;
      margin-right: 8px;
    }

    .token-display {
      margin-top: 10px;
    }

    .token-preview {
      font-family: 'Courier New', monospace;
      font-size: 0.8em;
      padding: 8px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      word-break: break-all;
      color: #495057;
    }

    .token-json {
      font-family: 'Courier New', monospace;
      font-size: 0.75em;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 12px;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 5px 0;
    }

    .no-tokens {
      text-align: center;
      padding: 30px;
      color: #6c757d;
      font-style: italic;
      background: #f8f9fa;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .status-grid, .config-grid {
        grid-template-columns: 1fr;
      }
      
      .button-group {
        flex-direction: column;
      }
      
      .debug-btn {
        width: 100%;
      }
      
      .link-group {
        flex-direction: column;
      }

      .token-json {
        font-size: 0.65em;
        max-height: 200px;
      }
    }
  `]
})
export class MsalDebugComponent implements OnInit {
  validation: MsalConfigValidation = {
    isValid: false,
    errors: [],
    warnings: [],
    suggestions: [],
    isB2C: false
  };

  isInitialized = false;
  isSpaConfig = false;
  accountsCount = 0;
  extractedTenantId: string | null = null;
  currentUrl = '';
  currentOrigin = '';
  currentTokens: {
    accessToken?: string;
    idToken?: string;
    accessTokenDecoded?: any;
    idTokenDecoded?: any;
  } = {};
  
  currentConfig: {
    clientId: string;
    authority: string;
    redirectUri: string;
    scopes: string[];
    clientCapabilities: string[];
  } = {
    clientId: '',
    authority: '',
    redirectUri: '',
    scopes: [],
    clientCapabilities: []
  };

  azurePortalLinks = {
    appRegistration: '',
    authentication: '',
    apiPermissions: '',
    allApps: 'https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps'
  };

  errorLog: Array<{timestamp: Date, message: string}> = [];
  showTokens = false;

  constructor(
    private msalService: MsalService,
    private msalInitService: MsalInitService,
    private msalDebugService: MsalDebugService
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.subscribeToInitialization();
    
    // Ensure all required methods are available
    this.verifyMethodsExist();
  }

  private initializeData(): void {
    // Load current configuration
    this.currentConfig = {
      clientId: environment.azureAd.clientId,
      authority: environment.azureAd.authority,
      redirectUri: environment.azureAd.redirectUri,
      scopes: environment.azureAd.scopes || [],
      clientCapabilities: environment.azureAd.clientCapabilities || []
    };

    // Extract tenant ID
    this.extractedTenantId = this.extractTenantId();

    // Set current URL info
    if (typeof window !== 'undefined') {
      this.currentUrl = window.location.href;
      this.currentOrigin = window.location.origin;
    }

    // Generate Azure Portal links
    this.generateAzurePortalLinks();

    // Run initial validation
    this.validateConfiguration();

    // Check SPA configuration
    this.isSpaConfig = this.msalDebugService.isSpaConfiguration();

    // Get account count
    this.updateAccountCount();
  }

  private subscribeToInitialization(): void {
    this.msalInitService.isInitialized$.subscribe(initialized => {
      this.isInitialized = initialized;
      if (initialized) {
        this.updateAccountCount();
      }
    });
  }

  private extractTenantId(): string | null {
    const authority = environment.azureAd.authority;
    const match = authority?.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    return match ? match[1] : null;
  }

  private generateAzurePortalLinks(): void {
    const clientId = environment.azureAd.clientId;
    this.azurePortalLinks = {
      appRegistration: `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/${clientId}`,
      authentication: `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/${clientId}`,
      apiPermissions: `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/${clientId}`,
      allApps: 'https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps'
    };
  }

  private updateAccountCount(): void {
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      this.accountsCount = accounts.length;
      
      // If we have accounts, try to get current tokens
      if (accounts.length > 0) {
        this.getCurrentTokens();
      }
    } catch (error) {
      this.accountsCount = 0;
      this.logError(`Error getting accounts: ${error}`);
    }
  }

  private logError(message: string): void {
    this.errorLog.unshift({
      timestamp: new Date(),
      message: message
    });

    // Keep only last 10 errors
    if (this.errorLog.length > 10) {
      this.errorLog = this.errorLog.slice(0, 10);
    }
  }

  validateConfiguration(): void {
    this.validation = this.msalDebugService.validateConfiguration();
  }

  runFullDiagnostic(): void {
    this.msalDebugService.diagnose400Error();
    this.msalInitService.runFullDiagnostic();
    this.validateConfiguration();
  }

  async testLogin(): Promise<void> {
    try {
      console.log('🔐 Testing login...');
      const loginRequest = {
        scopes: environment.azureAd.scopes,
        prompt: 'select_account'
      };
      
      const result = await this.msalService.loginPopup(loginRequest);
      console.log('✅ Login successful:', result);
      this.updateAccountCount();
      this.getCurrentTokens();
    } catch (error) {
      console.error('❌ Login failed:', error);
      this.logError(`Login test failed: ${error}`);
    }
  }

  downloadReport(): void {
    const report = this.msalDebugService.generateReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `msal-config-report-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async clearCache(): Promise<void> {
    try {
      console.log('🗑️ Clearing MSAL cache...');
      await this.msalService.instance.clearCache();
      console.log('✅ Cache cleared successfully');
      this.updateAccountCount();
      this.currentTokens = {};
      
      // Optionally reload the page
      if (confirm('Cache cleared. Would you like to reload the page?')) {
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      this.logError(`Error clearing cache: ${error}`);
    }
  }

  async getCurrentTokens(): Promise<void> {
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length === 0) {
        this.currentTokens = {};
        return;
      }

      const account = accounts[0];
      
      // Try to get access token silently
      try {
        const tokenRequest = {
          scopes: environment.azureAd.scopes,
          account: account,
          forceRefresh: false
        };

        const response = await this.msalService.instance.acquireTokenSilent(tokenRequest);
        
        this.currentTokens.accessToken = response.accessToken;
        this.currentTokens.idToken = response.idToken;
        
        // Decode tokens
        if (response.accessToken) {
          this.currentTokens.accessTokenDecoded = this.decodeJWT(response.accessToken);
        }
        if (response.idToken) {
          this.currentTokens.idTokenDecoded = this.decodeJWT(response.idToken);
        }

        console.log('✅ Tokens retrieved successfully');
      } catch (error) {
        console.log('ℹ️ Could not get tokens silently (user may need to login)');
        this.currentTokens = {};
      }
    } catch (error) {
      console.error('❌ Error getting tokens:', error);
      this.logError(`Error getting tokens: ${error}`);
    }
  }

  decodeJWT(token: string): any {
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

  copyToClipboard(text: string, label: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        console.log(`✅ ${label} copied to clipboard`);
        alert(`${label} copied to clipboard!`);
      }).catch(err => {
        console.error('❌ Failed to copy to clipboard:', err);
        this.fallbackCopyToClipboard(text, label);
      });
    } else {
      this.fallbackCopyToClipboard(text, label);
    }
  }

  private fallbackCopyToClipboard(text: string, label: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log(`✅ ${label} copied to clipboard (fallback)`);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      console.error('❌ Fallback copy failed:', err);
      alert('Failed to copy to clipboard. Please copy manually from the console.');
      console.log(`${label}:`, text);
    }
    
    document.body.removeChild(textArea);
  }

  toggleTokenDisplay(): void {
    this.showTokens = !this.showTokens;
    if (this.showTokens && Object.keys(this.currentTokens).length === 0) {
      this.getCurrentTokens();
    }
  }

  refreshTokens(): void {
    this.getCurrentTokens();
  }

  copyTokenDecoded(tokenType: 'access' | 'id'): void {
    const token = tokenType === 'access' ? this.currentTokens.accessTokenDecoded : this.currentTokens.idTokenDecoded;
    if (token) {
      const formatted = JSON.stringify(token, null, 2);
      this.copyToClipboard(formatted, `${tokenType} Token (Decoded)`);
    }
  }

  copyTokenRaw(tokenType: 'access' | 'id'): void {
    const token = tokenType === 'access' ? this.currentTokens.accessToken : this.currentTokens.idToken;
    if (token) {
      this.copyToClipboard(token, `${tokenType} Token (Raw JWT)`);
    }
  }

  /**
   * Verify all required methods exist to prevent TypeScript errors
   */
  private verifyMethodsExist(): void {
    const requiredMethods = [
      'getCurrentTokens',
      'toggleTokenDisplay',
      'refreshTokens',
      'copyTokenRaw',
      'copyTokenDecoded',
      'runFullDiagnostic',
      'validateConfiguration',
      'testLogin',
      'downloadReport',
      'clearCache'
    ];

    requiredMethods.forEach(method => {
      if (typeof (this as any)[method] !== 'function') {
        console.error(`Method ${method} is not defined on MsalDebugComponent`);
      }
    });
  }
}