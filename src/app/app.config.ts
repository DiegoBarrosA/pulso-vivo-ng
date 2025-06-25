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
    return new PublicClientApplication({
      auth: {
        clientId: environment.azureAd.clientId,
        authority: environment.azureAd.authority,
        redirectUri: environment.azureAd.redirectUri,
        postLogoutRedirectUri: environment.azureAd.postLogoutRedirectUri
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: false
      }
    });
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
      hydrateCache: () => Promise.resolve()
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
