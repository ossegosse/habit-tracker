/**
 * Root Layout - Main application layout with theme and navigation setup.
 * 
 * Features:
 * - Font loading and splash screen management
 * - Theme provider setup (light/dark mode)
 * - Authentication context provider
 * - Error boundary for crash handling
 * - Navigation configuration
 */

import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider } from "@/services/auth-provider";
import { Provider as PaperProvider, MD3LightTheme as PaperLightTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { ErrorBoundary } from "@/components/ErrorBoundary";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === "dark" ? PaperDarkTheme : PaperLightTheme;
  const navTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PaperProvider theme={paperTheme}>  
        <ThemeProvider value={navTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="create-habit-modal" options={{ presentation: "modal", headerShown: false}} />
            <Stack.Screen name="edit-habit-modal" options={{ presentation: "modal", headerShown: false}} />
            <Stack.Screen 
              name="auth/login" 
              options={{ 
                headerShown: false
              }} 
            />
            <Stack.Screen 
              name="auth/register" 
              options={{ 
                headerShown: false
              }}
            />
        </Stack>
      </ThemeProvider>
      </PaperProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}