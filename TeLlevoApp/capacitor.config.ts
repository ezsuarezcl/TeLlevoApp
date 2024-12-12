import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'parcial-crud',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    Camera: {
      permissions: {
        android: ['android.permission.CAMERA'],
        ios: ['NSCameraUsageDescription'],
      },
    },
  },
};

export default config;
