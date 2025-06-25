import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MsalDebugService } from './msal-debug.service';

@Injectable({
  providedIn: 'root'
})
export class MsalInitService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private initializationSubject = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.initializationSubject.asObservable();
  
  private initializationPromise: Promise<void> | null = null;
  private isInitialized = false;

  constructor(
    private msalService: MsalService,
    private msalDebugService: MsalDebugService
  ) {
    if (this.isBrowser) {
      this.initialize();
    }
  }

  /**
   * Inicializa MSAL de forma segura
   */
  private async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      if (environment.app.enableLogging) {
        console.log('[MSAL Init] Inicializando MSAL...');
      }

      // Inicializar la instancia de MSAL
      await this.msalService.instance.initialize();
      
      if (environment.app.enableLogging) {
        console.log('[MSAL Init] MSAL inicializado correctamente');
      }

      // Manejar promesas de redirección
      const response = await this.msalService.instance.handleRedirectPromise();
      
      if (response) {
        if (environment.app.enableLogging) {
          console.log('[MSAL Init] Respuesta de redirección recibida:', response);
        }
      }

      // Marcar como inicializado
      this.isInitialized = true;
      this.initializationSubject.next(true);

      if (environment.app.enableLogging) {
        console.log('[MSAL Init] Inicialización completa');
        
        // Log de información de cuentas
        const accounts = this.msalService.instance.getAllAccounts();
        console.log(`[MSAL Init] Cuentas encontradas: ${accounts.length}`);
        
        if (accounts.length > 0) {
          console.log(`[MSAL Init] Usuario actual: ${accounts[0].username}`);
        }
      }

    } catch (error) {
      console.error('[MSAL Init] Error durante la inicialización:', error);
      
      // Ejecutar diagnóstico completo del error
      this.msalDebugService.diagnose400Error();
      
      // Log detallado del error para debugging adicional
      this.logDetailedError(error);
      
      // Marcar como inicializado incluso si hay error para evitar bucles
      this.isInitialized = true;
      this.initializationSubject.next(false);
      
      throw error;
    }
  }

  /**
   * Asegura que MSAL esté inicializado antes de continuar
   */
  async ensureInitialized(): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }

    if (this.isInitialized) {
      return true;
    }

    try {
      await this.initialize();
      return this.isInitialized;
    } catch (error) {
      console.error('[MSAL Init] Error asegurando inicialización:', error);
      return false;
    }
  }

  /**
   * Verifica si MSAL está inicializado
   */
  get initialized(): boolean {
    return this.isInitialized && this.isBrowser;
  }

  /**
   * Obtiene el estado de inicialización como Observable
   */
  get initializationStatus$(): Observable<boolean> {
    return this.isInitialized$;
  }

  /**
   * Reinicia MSAL (útil para debugging)
   */
  async restart(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.isInitialized = false;
    this.initializationPromise = null;
    this.initializationSubject.next(false);

    await this.initialize();
  }

  /**
   * Obtiene información de diagnóstico
   */
  getDiagnosticInfo(): any {
    if (!this.isBrowser) {
      return {
        platform: 'server',
        initialized: false
      };
    }

    try {
      const accounts = this.msalService.instance.getAllAccounts();
      const config = this.msalService.instance.getConfiguration();
      
      return {
        platform: 'browser',
        initialized: this.isInitialized,
        accountsCount: accounts.length,
        activeAccount: this.msalService.instance.getActiveAccount()?.username || null,
        clientId: config.auth.clientId,
        authority: config.auth.authority,
        redirectUri: config.auth.redirectUri,
        cacheLocation: config.cache?.cacheLocation || 'unknown',
        // Información adicional para debugging
        navigateToLoginRequestUrl: config.auth.navigateToLoginRequestUrl,
        clientCapabilities: config.auth.clientCapabilities || [],
        knownAuthorities: config.auth.knownAuthorities || [],
        storeAuthStateInCookie: config.cache?.storeAuthStateInCookie,
        currentUrl: window.location.href,
        userAgent: navigator.userAgent
      };
    } catch (error) {
      return {
        platform: 'browser',
        initialized: this.isInitialized,
        error: error instanceof Error ? error.message : 'Unknown error',
        currentUrl: window.location.href,
        userAgent: navigator.userAgent
      };
    }
  }

  /**
   * Log de información de diagnóstico
   */
  logDiagnosticInfo(): void {
    if (environment.app.enableLogging) {
      const info = this.getDiagnosticInfo();
      console.group('[MSAL Init] Información de diagnóstico');
      Object.entries(info).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
      console.groupEnd();
      
      // Agregar validación de configuración
      const validation = this.msalDebugService.validateConfiguration();
      if (!validation.isValid) {
        console.warn('[MSAL Init] Se detectaron problemas de configuración');
        console.log('Errores:', validation.errors);
        console.log('Advertencias:', validation.warnings);
        console.log('Sugerencias:', validation.suggestions);
      }
    }
  }

  /**
   * Log detallado de error para debugging
   */
  private logDetailedError(error: any): void {
    console.group('[MSAL Init] Detalles del Error:');
    console.error('Error completo:', error);
    
    if (error && typeof error === 'object') {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.errorCode);
      console.error('Error description:', error.errorMessage);
      console.error('Error stack:', error.stack);
      
      // Log detalles específicos para errores de red
      if (error.status) {
        console.error('HTTP Status:', error.status);
      }
      if (error.response) {
        console.error('HTTP Response:', error.response);
      }
    }
    console.groupEnd();
  }

  /**
   * Ejecuta diagnóstico completo de MSAL
   */
  runFullDiagnostic(): void {
    console.group('[MSAL Init] Diagnóstico Completo');
    
    // Información general
    this.logDiagnosticInfo();
    
    // Validación de configuración
    const validation = this.msalDebugService.validateConfiguration();
    console.log('Validación de configuración:', validation);
    
    // Verificar si es configuración SPA
    const isSpa = this.msalDebugService.isSpaConfiguration();
    console.log('Configuración SPA detectada:', isSpa);
    
    // Configuración recomendada
    if (!isSpa) {
      const recommended = this.msalDebugService.getRecommendedSpaConfiguration();
      console.log('Configuración SPA recomendada:', recommended);
    }
    
    // Generar reporte
    const report = this.msalDebugService.generateReport();
    console.log('Reporte completo:', report);
    
    console.groupEnd();
  }
}