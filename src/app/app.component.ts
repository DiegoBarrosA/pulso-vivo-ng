import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MsalInitService } from './services/msal-init.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements OnInit {
  title = 'pulso-vivo-ng';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private msalInitService: MsalInitService) {}

  async ngOnInit(): Promise<void> {
    if (this.isBrowser) {
      try {
        // Ensure MSAL is initialized
        const initialized = await this.msalInitService.ensureInitialized();
        
        if (initialized) {
          console.log('✅ PulsoVivo: MSAL initialized successfully');
          // Log diagnostic information
          this.msalInitService.logDiagnosticInfo();
        } else {
          console.warn('⚠️ PulsoVivo: MSAL initialization failed');
        }
      } catch (error) {
        console.error('❌ PulsoVivo: Error during MSAL initialization:', error);
      }
    }
  }
}
