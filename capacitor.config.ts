import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.whippetshine',
  appName: 'whippetshine',
  webDir: 'dist',
  server: {
    url: 'https://01c2f555-3daf-403b-8eca-39d03bb4a43e.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
