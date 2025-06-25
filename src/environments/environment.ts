export const environment = {
  production: false,
  
  // Configuración de Azure AD
  azureAd: {
    clientId: 'your-azure-ad-client-id', // Reemplazar con tu Client ID
    authority: 'https://login.microsoftonline.com/your-tenant-id', // Reemplazar con tu Tenant ID
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    scopes: ['user.read']
  },
  
  // Configuración del BFF API
  api: {
    baseUrl: 'https://your-bff-api-domain.com/api', // Reemplazar con la URL de tu BFF
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    bffScopes: ['api://your-api-client-id/access_as_user'] // Reemplazar con el scope de tu BFF
  },
  
  // Configuraciones de la aplicación
  app: {
    name: 'PulsoVivo',
    version: '1.0.0',
    companyName: 'PulsoVivo Medical Supplies',
    supportEmail: 'soporte@pulsovivo.com',
    enableLogging: true,
    logLevel: 'debug' // 'debug' | 'info' | 'warn' | 'error'
  },
  
  // Configuraciones de la tienda
  store: {
    itemsPerPage: 12,
    enableWishlist: true,
    enableReviews: true,
    defaultCurrency: 'EUR',
    currencySymbol: '€',
    enableInventoryAlerts: true,
    lowStockThreshold: 10
  },
  
  // Configuraciones de administración
  admin: {
    autoSaveInterval: 30000, // 30 segundos
    exportFormats: ['csv', 'excel', 'pdf'],
    enableAuditLog: true,
    sessionTimeout: 3600000, // 1 hora en milisegundos
    maxFileUploadSize: 10485760 // 10MB
  },
  
  // URLs de recursos externos
  external: {
    supportUrl: 'https://support.pulsovivo.com',
    documentationUrl: 'https://docs.pulsovivo.com',
    termsUrl: 'https://pulsovivo.com/terminos',
    privacyUrl: 'https://pulsovivo.com/privacidad'
  },
  
  // Configuraciones de características
  features: {
    enableReports: true,
    enableNotifications: true,
    enableDarkMode: false,
    enableMultiLanguage: false,
    enableOfflineMode: false,
    enablePushNotifications: false
  }
};