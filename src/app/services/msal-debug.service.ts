import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface MsalConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  isB2C: boolean;
  issuerValidation?: {
    expectedIssuer: string;
    actualIssuer?: string;
    isValid: boolean;
  };
}

export interface AzureAdAppConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  expectedConfigurationType: 'spa' | 'web' | 'unknown';
}

@Injectable({
  providedIn: 'root'
})
export class MsalDebugService {

  /**
   * Valida la configuración completa de MSAL
   */
  validateConfiguration(): MsalConfigValidation {
    const result: MsalConfigValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      isB2C: this.isB2CConfiguration()
    };

    // Validar Client ID
    this.validateClientId(result);
    
    // Validar Authority/Tenant
    this.validateAuthority(result);
    
    // Validar Redirect URI
    this.validateRedirectUri(result);
    
    // Validar Scopes
    this.validateScopes(result);
    
    // Validar configuración SPA
    this.validateSpaConfiguration(result);
    
    // Validar configuración B2C específica
    if (result.isB2C) {
      this.validateB2CConfiguration(result);
    }
    
    // Validar issuer para problemas STS vs login.microsoftonline.com
    this.validateIssuerConfiguration(result);
    
    // Determinar si la configuración es válida
    result.isValid = result.errors.length === 0;
    
    return result;
  }

  /**
   * Valida el Client ID
   */
  private validateClientId(result: MsalConfigValidation): void {
    const clientId = environment.azureAd.clientId;
    
    if (!clientId) {
      result.errors.push('Client ID no está configurado');
      return;
    }
    
    // Validar formato GUID
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(clientId)) {
      result.errors.push('Client ID no tiene formato GUID válido');
    }
    
    // Verificar que no sea un placeholder
    if (clientId.includes('your-client-id') || clientId.includes('REPLACE')) {
      result.errors.push('Client ID parece ser un placeholder, debe ser reemplazado con el valor real');
    }
  }

  /**
   * Detecta si la configuración es para B2C
   */
  private isB2CConfiguration(): boolean {
    const authority = environment.azureAd.authority;
    return authority?.includes('.b2clogin.com') || 
           authority?.includes('B2C_1_') ||
           (environment.azureAd.knownAuthorities && 
            environment.azureAd.knownAuthorities.some(auth => auth.includes('.b2clogin.com')));
  }

  /**
   * Valida configuración específica de B2C
   */
  private validateB2CConfiguration(result: MsalConfigValidation): void {
    const authority = environment.azureAd.authority;
    const knownAuthorities = environment.azureAd.knownAuthorities;
    const validateAuthority = (environment.azureAd as any).validateAuthority;

    // Verificar validateAuthority para B2C
    if (validateAuthority !== false) {
      result.warnings.push('Para B2C, validateAuthority debería ser false');
      result.suggestions.push('Agregar validateAuthority: false en la configuración');
    }

    // Verificar knownAuthorities para B2C
    if (!knownAuthorities || knownAuthorities.length === 0) {
      result.warnings.push('knownAuthorities no está configurado para B2C');
      result.suggestions.push('Agregar el dominio B2C a knownAuthorities (ej: ["tenant.b2clogin.com"])');
    }

    // Verificar formato de policy en authority
    if (authority && !authority.includes('B2C_1_')) {
      result.warnings.push('Authority no parece incluir un nombre de policy B2C');
      result.suggestions.push('Verificar que la authority incluya el nombre de la policy (ej: B2C_1_signupsignin)');
    }

    // Verificar scopes para B2C
    const scopes = environment.azureAd.scopes;
    if (scopes && scopes.length > 0) {
      const hasB2CScopes = scopes.some(scope => 
        scope.includes('.onmicrosoft.com') || 
        scope === 'openid' || 
        scope === 'profile'
      );
    
      if (!hasB2CScopes) {
        result.warnings.push('Los scopes no parecen ser específicos de B2C');
        result.suggestions.push('Usar scopes como openid, profile, o https://tenant.onmicrosoft.com/api/scope');
      }
    }
  }

  /**
   * Valida configuración de issuer para manejar problemas STS vs login.microsoftonline.com
   */
  private validateIssuerConfiguration(result: MsalConfigValidation): void {
    const authority = environment.azureAd.authority;
    const tenantId = this.extractTenantId();
  
    if (!tenantId) return;

    // Determinar issuer esperado basado en authority
    let expectedIssuer: string;
  
    if (result.isB2C) {
      // Para B2C, el issuer puede variar
      const b2cMatch = authority?.match(/https:\/\/([^\/]+)\.b2clogin\.com\/([^\/]+)\/([^\/]+)/);
      if (b2cMatch) {
        expectedIssuer = `https://${b2cMatch[1]}.b2clogin.com/${tenantId}/v2.0/`;
      } else {
        expectedIssuer = `https://sts.windows.net/${tenantId}/`;
      }
    } else {
      // Para Azure AD regular, pueden ser STS o login.microsoftonline.com
      expectedIssuer = `https://sts.windows.net/${tenantId}/`;
    }

    result.issuerValidation = {
      expectedIssuer: expectedIssuer,
      isValid: true // Asumimos válido hasta que se detecte un problema específico
    };

    // Agregar sugerencias para problemas comunes de issuer
    if (!result.isB2C) {
      result.suggestions.push('Si ves errores de issuer, verifica que aceptes tanto STS como login.microsoftonline.com');
      result.suggestions.push('Issuer común: https://sts.windows.net/' + tenantId + '/');
      result.suggestions.push('Issuer alternativo: https://login.microsoftonline.com/' + tenantId + '/v2.0');
    }
  }

  /**
   * Log de pasos de solución específicos para B2C
   */
  private logB2CTroubleshootingSteps(): void {
    const steps = [
      '1. Verificar que la aplicación esté registrada como "Single-page application" en B2C',
      '2. Configurar validateAuthority: false en la configuración MSAL',
      '3. Verificar que el dominio B2C esté en knownAuthorities',
      '4. Verificar que la authority incluya el nombre correcto de la policy',
      '5. Verificar que el redirect URI esté registrado en B2C',
      '6. Verificar que los scopes usen el formato B2C correcto',
      '7. Para problemas de issuer, verificar configuración de validación de tokens',
      '8. Si es una aplicación nueva B2C, esperar hasta 10 minutos para propagación'
    ];
  
    steps.forEach(step => console.log(step));
  
    console.log('\n🏢 Configuración específica de B2C:');
    console.log('- Authority debe usar formato: https://tenant.b2clogin.com/tenant.onmicrosoft.com/policy');
    console.log('- validateAuthority debe ser false');
    console.log('- knownAuthorities debe incluir: ["tenant.b2clogin.com"]');
    console.log('- Scopes deben usar formato: https://tenant.onmicrosoft.com/api/scope');
  }

  /**
   * Valida la Authority/Tenant
   */
  private validateAuthority(result: MsalConfigValidation): void {
    const authority = environment.azureAd.authority;
    
    if (!authority) {
      result.errors.push('Authority no está configurado');
      return;
    }
    
    // Check if it's B2C or regular Azure AD
    const isB2C = this.isB2CConfiguration();
    
    if (isB2C) {
      // B2C Authority validation
      const b2cAuthorityRegex = /^https:\/\/[a-zA-Z0-9-]+\.b2clogin\.com\/[a-zA-Z0-9-]+\.onmicrosoft\.com\/[a-zA-Z0-9_]+$/i;
      if (!b2cAuthorityRegex.test(authority)) {
        result.errors.push('B2C Authority formato inválido. Debe ser: https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}');
      }
      
      // Check for B2C-specific placeholders
      if (authority.includes('your-tenant-name') || authority.includes('B2C_1_signupsignin')) {
        result.warnings.push('Authority parece contener placeholders de B2C que deben ser reemplazados');
      }
    } else {
      // Regular Azure AD validation
      const authorityRegex = /^https:\/\/login\.microsoftonline\.com\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!authorityRegex.test(authority)) {
        result.warnings.push('Authority no tiene formato Azure AD estándar. Si usas B2C, esto es normal.');
      }
      
      // Extraer Tenant ID
      const tenantMatch = authority.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
      if (tenantMatch) {
        const tenantId = tenantMatch[1];
        if (tenantId.toLowerCase() === '82c6cf20-e689-4aa9-bedf-7acaf7c4ead7') {
          result.suggestions.push('Se detectó un Tenant ID específico. Verificar que sea el correcto.');
        }
      }
    }
    
    // Verificar que no sea un placeholder genérico
    if (authority.includes('your-tenant-id') || authority.includes('REPLACE')) {
      result.errors.push('Authority parece contener un placeholder, debe ser reemplazado con el valor real');
    }
  }

  /**
   * Valida el Redirect URI
   */
  private validateRedirectUri(result: MsalConfigValidation): void {
    const redirectUri = environment.azureAd.redirectUri;
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200';
    
    if (!redirectUri) {
      result.errors.push('Redirect URI no está configurado');
      return;
    }
    
    // Validar que sea una URL válida
    try {
      new URL(redirectUri);
    } catch {
      result.errors.push('Redirect URI no es una URL válida');
      return;
    }
    
    // Verificar que coincida con el origen actual
    if (!redirectUri.startsWith(currentOrigin)) {
      result.warnings.push(`Redirect URI (${redirectUri}) no coincide con el origen actual (${currentOrigin})`);
      result.suggestions.push('Asegúrate de que el Redirect URI esté registrado en Azure AD para el origen actual');
    }
    
    // Verificar protocolo HTTPS en producción
    if (environment.production && !redirectUri.startsWith('https://')) {
      result.errors.push('En producción, el Redirect URI debe usar HTTPS');
    }
    
    // Verificar que no sea un placeholder
    if (redirectUri.includes('your-domain') || redirectUri.includes('REPLACE')) {
      result.errors.push('Redirect URI parece contener un placeholder');
    }
  }

  /**
   * Valida los Scopes
   */
  private validateScopes(result: MsalConfigValidation): void {
    const scopes = environment.azureAd.scopes;
    
    if (!scopes || scopes.length === 0) {
      result.warnings.push('No hay scopes configurados');
      result.suggestions.push('Considera agregar scopes como ["user.read"] para acceso básico');
      return;
    }
    
    // Validar scopes comunes
    const validScopes = ['user.read', 'profile', 'email', 'openid', 'offline_access'];
    const invalidScopes = scopes.filter(scope => 
      !validScopes.includes(scope) && 
      !scope.startsWith('api://') && 
      !scope.startsWith('https://graph.microsoft.com/')
    );
    
    if (invalidScopes.length > 0) {
      result.warnings.push(`Scopes potencialmente inválidos: ${invalidScopes.join(', ')}`);
      result.suggestions.push('Verificar que todos los scopes estén registrados y sean válidos');
    }
  }

  /**
   * Valida configuración específica para SPA
   */
  private validateSpaConfiguration(result: MsalConfigValidation): void {
    const clientCapabilities = environment.azureAd.clientCapabilities;
    const navigateToLoginRequestUrl = environment.azureAd.navigateToLoginRequestUrl;
    
    // Verificar client capabilities para SPA
    if (!clientCapabilities || !clientCapabilities.includes('CP1')) {
      result.warnings.push('Client capabilities no incluyen CP1 (recomendado para SPA)');
      result.suggestions.push('Agregar "CP1" a clientCapabilities para habilitar características SPA');
    }
    
    // Verificar navigate to login request URL
    if (navigateToLoginRequestUrl !== false) {
      result.suggestions.push('Para SPA, se recomienda navigateToLoginRequestUrl: false');
    }
  }

  /**
   * Genera un diagnóstico completo del error 400
   */
  diagnose400Error(): void {
    console.group('🔍 [MSAL Debug] Diagnóstico de Error 400 - Bad Request');
    
    // Validar configuración
    const validation = this.validateConfiguration();
    
    // Mostrar tipo de configuración
    console.log(`🏢 Tipo de configuración: ${validation.isB2C ? 'Azure AD B2C' : 'Azure AD'}`);
    
    console.group('📋 Validación de Configuración:');
    console.log('✅ Configuración válida:', validation.isValid);
    
    if (validation.errors.length > 0) {
      console.group('❌ Errores encontrados:');
      validation.errors.forEach(error => console.error(`- ${error}`));
      console.groupEnd();
    }
    
    if (validation.warnings.length > 0) {
      console.group('⚠️ Advertencias:');
      validation.warnings.forEach(warning => console.warn(`- ${warning}`));
      console.groupEnd();
    }
    
    if (validation.suggestions.length > 0) {
      console.group('💡 Sugerencias:');
      validation.suggestions.forEach(suggestion => console.log(`- ${suggestion}`));
      console.groupEnd();
    }
    console.groupEnd();
    
    // Mostrar información específica de issuer
    if (validation.issuerValidation) {
      console.group('🎫 Validación de Issuer:');
      console.log('Issuer esperado:', validation.issuerValidation.expectedIssuer);
      if (validation.issuerValidation.actualIssuer) {
        console.log('Issuer actual:', validation.issuerValidation.actualIssuer);
      }
      console.log('Issuer válido:', validation.issuerValidation.isValid);
      if (!validation.issuerValidation.isValid) {
        console.warn('⚠️ Problema de issuer detectado - común en B2C o configuraciones mixtas');
      }
      console.groupEnd();
    }
    
    // Mostrar configuración actual
    console.group('⚙️ Configuración Actual:');
    this.logCurrentConfiguration();
    console.groupEnd();
    
    // Mostrar pasos de solución específicos
    console.group('🛠️ Pasos para Resolver Error 400:');
    if (validation.isB2C) {
      this.logB2CTroubleshootingSteps();
    } else {
      this.logTroubleshootingSteps();
    }
    console.groupEnd();
    
    // Generar comandos de verificación
    console.group('🔍 Comandos de Verificación:');
    this.generateVerificationCommands();
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * Log de configuración actual
   */
  private logCurrentConfiguration(): void {
    const config = {
      'Client ID': environment.azureAd.clientId,
      'Authority': environment.azureAd.authority,
      'Redirect URI': environment.azureAd.redirectUri,
      'Post Logout Redirect URI': environment.azureAd.postLogoutRedirectUri,
      'Scopes': environment.azureAd.scopes,
      'Client Capabilities': environment.azureAd.clientCapabilities,
      'Navigate to Login Request URL': environment.azureAd.navigateToLoginRequestUrl,
      'Known Authorities': environment.azureAd.knownAuthorities,
      'Current URL': typeof window !== 'undefined' ? window.location.href : 'N/A (SSR)',
      'Current Origin': typeof window !== 'undefined' ? window.location.origin : 'N/A (SSR)'
    };
    
    Object.entries(config).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  }

  /**
   * Log de pasos para solucionar problemas
   */
  private logTroubleshootingSteps(): void {
    const steps = [
      '1. Verificar que la aplicación esté registrada como "Single-page application" en Azure AD',
      '2. Verificar que el Client ID sea correcto y coincida con el registro en Azure AD',
      '3. Verificar que el Tenant ID en la Authority sea correcto',
      '4. Verificar que el Redirect URI esté registrado exactamente como aparece en la configuración',
      '5. Verificar que los scopes solicitados estén disponibles y configurados',
      '6. Verificar que la aplicación tenga los permisos necesarios',
      '7. Si es una aplicación nueva, esperar hasta 5 minutos para la propagación de cambios'
    ];
    
    steps.forEach(step => console.log(step));
  }

  /**
   * Genera comandos de verificación
   */
  private generateVerificationCommands(): void {
    const clientId = environment.azureAd.clientId;
    const tenantId = this.extractTenantId();
    
    console.log('🌐 Verificar configuración en Azure Portal:');
    console.log(`https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/${clientId}`);
    
    console.log('\n📝 Verificar registros de aplicación:');
    console.log(`https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps`);
    
    if (tenantId) {
      console.log('\n🏢 Información del Tenant:');
      console.log(`Tenant ID: ${tenantId}`);
      console.log(`https://portal.azure.com/#view/Microsoft_AAD_IAM/TenantOverview.ReactView/tenantId/${tenantId}`);
    }
  }

  /**
   * Extrae el Tenant ID de la Authority
   */
  private extractTenantId(): string | null {
    const authority = environment.azureAd.authority;
    const match = authority?.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    return match ? match[1] : null;
  }

  /**
   * Verifica si la configuración sugiere que es una SPA
   */
  isSpaConfiguration(): boolean {
    const clientCapabilities = environment.azureAd.clientCapabilities;
    const navigateToLoginRequestUrl = environment.azureAd.navigateToLoginRequestUrl;
    
    return (
      Array.isArray(clientCapabilities) && 
      clientCapabilities.includes('CP1') &&
      navigateToLoginRequestUrl === false
    );
  }

  /**
   * Genera configuración recomendada para SPA
   */
  getRecommendedSpaConfiguration(): Partial<typeof environment.azureAd> {
    const isB2C = this.isB2CConfiguration();
    
    if (isB2C) {
      return {
        clientCapabilities: ['CP1'],
        navigateToLoginRequestUrl: false,
        validateAuthority: false,
        knownAuthorities: ['your-tenant-name.b2clogin.com'],
        cloudDiscoveryMetadata: '',
        authorityMetadata: ''
      };
    } else {
      return {
        clientCapabilities: ['CP1'],
        navigateToLoginRequestUrl: false,
        knownAuthorities: [],
        cloudDiscoveryMetadata: '',
        authorityMetadata: ''
      };
    }
  }

  /**
   * Genera un reporte completo
   */
  generateReport(): string {
    const validation = this.validateConfiguration();
    const isSpa = this.isSpaConfiguration();
    const tenantId = this.extractTenantId();
    
    let report = '# MSAL Configuration Report\n\n';
    
    report += `## Configuration Status\n`;
    report += `- **Valid**: ${validation.isValid ? '✅' : '❌'}\n`;
    report += `- **Type**: ${validation.isB2C ? 'Azure AD B2C' : 'Azure AD'}\n`;
    report += `- **SPA Configuration**: ${isSpa ? '✅' : '❌'}\n`;
    report += `- **Tenant ID**: ${tenantId || 'Not found'}\n\n`;
    
    if (validation.issuerValidation) {
      report += `## Issuer Validation\n`;
      report += `- **Expected**: ${validation.issuerValidation.expectedIssuer}\n`;
      if (validation.issuerValidation.actualIssuer) {
        report += `- **Actual**: ${validation.issuerValidation.actualIssuer}\n`;
      }
      report += `- **Valid**: ${validation.issuerValidation.isValid ? '✅' : '❌'}\n\n`;
    }
    
    if (validation.errors.length > 0) {
      report += `## Errors\n`;
      validation.errors.forEach(error => {
        report += `- ❌ ${error}\n`;
      });
      report += '\n';
    }
    
    if (validation.warnings.length > 0) {
      report += `## Warnings\n`;
      validation.warnings.forEach(warning => {
        report += `- ⚠️ ${warning}\n`;
      });
      report += '\n';
    }
    
    if (validation.suggestions.length > 0) {
      report += `## Suggestions\n`;
      validation.suggestions.forEach(suggestion => {
        report += `- 💡 ${suggestion}\n`;
      });
      report += '\n';
    }
    
    report += `## Current Configuration\n`;
    report += `- **Client ID**: ${environment.azureAd.clientId}\n`;
    report += `- **Authority**: ${environment.azureAd.authority}\n`;
    report += `- **Redirect URI**: ${environment.azureAd.redirectUri}\n`;
    report += `- **Scopes**: ${JSON.stringify(environment.azureAd.scopes)}\n`;
    
    if (validation.isB2C) {
      report += `\n## B2C Specific Configuration\n`;
      report += `- **Known Authorities**: ${JSON.stringify(environment.azureAd.knownAuthorities)}\n`;
      report += `- **Validate Authority**: ${(environment.azureAd as any).validateAuthority ?? 'undefined'}\n`;
    }
    
    return report;
  }
}