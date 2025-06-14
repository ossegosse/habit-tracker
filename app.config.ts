import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

// In SDK 46 and lower, use `ExpoConfig` instead of `ExpoConfig`
const config: ExpoConfig = {
  name: "HabitTracker",
  slug: "habit-tracker",
  scheme: "habittracker",
  // ... other expo config settings

  plugins: [
    "expo-router"
  ],
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
  },
};

export default config;