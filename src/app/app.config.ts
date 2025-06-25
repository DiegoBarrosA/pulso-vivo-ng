import { ApplicationConfig, provideZoneChangeDetection, PLATFORM_ID, inject, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { isPlatformBrowser, registerLocaleData } from '@angular/common';
import { BrowserCacheLocation, IPublicClientApplication, InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalService, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalInterceptorConfiguration, MsalInterceptor } from '@azure/msal-angular';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { environment } from '../environments/environment';

// Register Spanish locale
registerLocaleData(localeEs, 'es');

// MSAL Configuration
export function MSALInstanceFactory(): IPublicClientApplication {
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformBrowser(platformId)) {
    try {
      const msalInstance = new PublicClientApplication({
        auth: {
          clientId: environment.azureAd.clientId,
          authority: environment.azureAd.authority,
          redirectUri: environment.azureAd.redirectUri,
          postLogoutRedirectUri: environment.azureAd.postLogoutRedirectUri,
          navigateToLoginRequestUrl: environment.azureAd.navigateToLoginRequestUrl,
          clientCapabilities: environment.azureAd.clientCapabilities,
          knownAuthorities: environment.azureAd.knownAuthorities,
          cloudDiscoveryMetadata: environment.azureAd.cloudDiscoveryMetadata,
          authorityMetadata: environment.azureAd.authorityMetadata
        },
        cache: {
          cacheLocation: BrowserCacheLocation.LocalStorage,
          storeAuthStateInCookie: false,
          secureCookies: false
        },
        system: {
          loggerOptions: {
            loggerCallback: (level: any, message: string, containsPii: boolean) => {
              if (environment.app.enableLogging && !containsPii) {
                console.log(`[MSAL] ${message}`);
              }
            },
            piiLoggingEnabled: false,
            logLevel: environment.app.enableLogging ? 2 : 0 // Info level when logging enabled
          },
          // Custom token validation for B2C issuer handling
          tokenRenewalOffsetSeconds: 300,
          iframeHashTimeout: 6000,
          loadFrameTimeout: 0
        }
      });
      
      // Initialize immediately with B2C-specific error handling
      msalInstance.initialize().then(() => {
        console.log('[MSAL] Instance initialized successfully');
        
        // Handle B2C issuer validation if needed
        if ((environment.azureAd as any).issuerValidation?.acceptedIssuers) {
          console.log('[MSAL] B2C issuer validation configured');
          console.log('[MSAL] Accepted issuers:', (environment.azureAd as any).issuerValidation.acceptedIssuers);
        }
      }).catch(error => {
        console.error('Error initializing MSAL:', error);
        
        // B2C specific error handling
        if (error.message?.includes('authority') || error.message?.includes('issuer')) {
          console.error('[MSAL B2C] Authority/Issuer validation error - check B2C configuration');
          console.error('[MSAL B2C] Current authority:', environment.azureAd.authority);
          console.error('[MSAL B2C] validateAuthority setting:', (environment.azureAd as any).validateAuthority);
        }
      });
      
      return msalInstance;
    } catch (error) {
      console.error('Error creating MSAL instance:', error);
      throw error;
    }
  } else {
    // Return a mock instance for SSR
    return {
      initialize: () => Promise.resolve(),
      getAllAccounts: () => [],
      getAccountByHomeId: () => null,
      getAccountByLocalId: () => null,
      getAccountByUsername: () => null,
      acquireTokenSilent: () => Promise.reject('SSR mode'),
      acquireTokenPopup: () => Promise.reject('SSR mode'),
      acquireTokenRedirect: () => Promise.reject('SSR mode'),
      loginPopup: () => Promise.reject('SSR mode'),
      loginRedirect: () => Promise.reject('SSR mode'),
      logout: () => Promise.reject('SSR mode'),
      logoutRedirect: () => Promise.reject('SSR mode'),
      logoutPopup: () => Promise.reject('SSR mode'),
      ssoSilent: () => Promise.reject('SSR mode'),
      addEventCallback: () => '',
      removeEventCallback: () => {},
      getConfiguration: () => ({}),
      getLogger: () => null,
      setLogger: () => {},
      initializeWrapperLibrary: () => {},
      setNavigationClient: () => {},
      getTokenCache: () => ({} as any),
      clearCache: () => Promise.resolve(),
      setActiveAccount: () => {},
      getActiveAccount: () => null,
      hydrateCache: () => Promise.resolve(),
      handleRedirectPromise: () => Promise.resolve(null)
    } as any;
  }
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.azureAd.scopes
    }
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', environment.azureAd.scopes);
  protectedResourceMap.set(`${environment.api.baseUrl}/*`, environment.api.bffScopes);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: LOCALE_ID,
      useValue: 'es'
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
      deps: [PLATFORM_ID]
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalInterceptor
  ]
};
