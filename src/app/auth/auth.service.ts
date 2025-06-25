import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, RedirectRequest, SilentRequest } from '@azure/msal-browser';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { MsalInitService } from '../services/msal-init.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userSubject = new BehaviorSubject<AccountInfo | null>(null);
  public user$ = this.userSubject.asObservable();
  
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private msalService: MsalService,
    private msalInitService: MsalInitService
  ) {
    if (this.isBrowser) {
      this.initializeAuth();
    }
  }

  private async initializeAuth(): Promise<void> {
    try {
      const initialized = await this.msalInitService.ensureInitialized();
      if (initialized) {
        this.checkAuthenticationStatus();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  private checkAuthenticationStatus(): void {
    if (!this.isBrowser) return;
    
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts && accounts.length > 0) {
        this.isAuthenticatedSubject.next(true);
        this.userSubject.next(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    }
  }

  /**
   * Inicia el proceso de login con Azure AD
   */
  async login(): Promise<void> {
    if (!this.isBrowser) return;
    
    const initialized = await this.msalInitService.ensureInitialized();
    if (!initialized) {
      console.error('MSAL not initialized, cannot login');
      return;
    }
    
    try {
      const loginRequest: RedirectRequest = {
        scopes: environment.azureAd.scopes,
        prompt: 'select_account'
      };

      this.msalService.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    if (!this.isBrowser) return;
    
    const initialized = await this.msalInitService.ensureInitialized();
    if (!initialized) {
      console.error('MSAL not initialized, cannot logout');
      return;
    }
    
    try {
      this.msalService.logoutRedirect({
        postLogoutRedirectUri: environment.azureAd.postLogoutRedirectUri
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Obtiene el token de acceso actual
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.isBrowser) return null;
    
    const initialized = await this.msalInitService.ensureInitialized();
    if (!initialized) {
      console.error('MSAL not initialized, cannot get access token');
      return null;
    }
    
    try {
      const account = this.msalService.instance.getAllAccounts()[0];
      if (!account) {
        return null;
      }

      const silentRequest: SilentRequest = {
        scopes: environment.azureAd.scopes,
        account: account
      };

      const response = await this.msalService.acquireTokenSilent(silentRequest).toPromise();
      return response?.accessToken || null;
    } catch (error) {
      console.error('Error al obtener token de acceso:', error);
      return null;
    }
  }

  /**
   * Obtiene el token JWT para la API del BFF
   */
  async getBffToken(): Promise<string | null> {
    if (!this.isBrowser) return null;
    
    const initialized = await this.msalInitService.ensureInitialized();
    if (!initialized) {
      console.error('MSAL not initialized, cannot get BFF token');
      return null;
    }
    
    try {
      const account = this.msalService.instance.getAllAccounts()[0];
      if (!account) {
        return null;
      }

      const silentRequest: SilentRequest = {
        scopes: environment.api.bffScopes,
        account: account
      };

      const response = await this.msalService.acquireTokenSilent(silentRequest).toPromise();
      return response?.accessToken || null;
    } catch (error) {
      console.error('Error al obtener token del BFF:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser || !this.msalInitService.initialized) return false;
    
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      return accounts && accounts.length > 0;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Obtiene la información del usuario actual
   */
  getCurrentUser(): AccountInfo | null {
    if (!this.isBrowser || !this.msalInitService.initialized) return null;
    
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      return accounts && accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene permisos de administrador
   * Esta lógica puede personalizarse según los roles de Azure AD
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    // Implementar lógica de roles según tu configuración de Azure AD
    // Por ejemplo, verificar claims o grupos del usuario
    return user?.username?.includes('admin') || false;
  }
}