export const environment = {
  production: true,
  
  // Configuración de Azure AD
  azureAd: {
    clientId: 'your-production-azure-ad-client-id', // Reemplazar con tu Client ID de producción
    authority: 'https://login.microsoftonline.com/your-production-tenant-id', // Reemplazar con tu Tenant ID de producción
    redirectUri: 'https://your-production-domain.com',
    postLogoutRedirectUri: 'https://your-production-domain.com',
    scopes: ['user.read']
  },
  
  // Configuración del BFF API
  api: {
    baseUrl: 'https://your-production-bff-api-domain.com/api', // Reemplazar con la URL de tu BFF de producción
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    bffScopes: ['api://your-production-api-client-id/access_as_user'] // Reemplazar con el scope de tu BFF de producción
  },
  
  // Configuraciones de la aplicación
  app: {
    name: 'PulsoVivo',
    version: '1.0.0',
    companyName: 'PulsoVivo Medical Supplies',
    supportEmail: 'soporte@pulsovivo.com',
    enableLogging: false, // Deshabilitado en producción
    logLevel: 'error' // Solo errores en producción
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
    autoSaveInterval: 60000, // 1 minuto (más conservador en producción)
    exportFormats: ['csv', 'excel', 'pdf'],
    enableAuditLog: true,
    sessionTimeout: 1800000, // 30 minutos en producción (más seguro)
    maxFileUploadSize: 5242880 // 5MB en producción (más restrictivo)
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
    enablePushNotifications: true // Habilitado en producción
  }
};