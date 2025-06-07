import React, { useEffect } from "react";
import { router, Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/services/auth-provider";
import { signOut } from "@/services/firestore/auth-service";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const { user, isLoading } = useAuth();

  // Custom header with logo
  const LogoHeader = () => (
    <View style={styles.logoContainer}>
      <Image
        source={require('@/assets/images/habittracker.png')}
        style={styles.headerLogo}
        resizeMode="contain"
      />
    </View>
  );

  // Custom logout button for header
  const LogoutIcon = () => (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={async () => {
        try {
          await signOut();
          router.replace("/auth/login");
        } catch (error: any) {
          console.error("Logout failed:", error.message);
        }
      }}
    >
      <Ionicons name="log-out-outline" size={24} color="white" />
    </TouchableOpacity>
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("./auth/login");
    }
  }, [isLoading, user]);
  
  if (isLoading || !user) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: themeColors.tabIconSelected,
          tabBarInactiveTintColor: themeColors.tabIconDefault,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 2,
          },
          tabBarStyle: {
            backgroundColor: themeColors.navBackground,
            borderTopColor: themeColors.border,
            height: 85,
            paddingBottom: 15,
            paddingTop: 10,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
          headerStyle: {
            backgroundColor: '#1b263b', // Dark blue header background
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            color: '#ffffff', // White text for contrast
          },
          headerTintColor: '#ffffff', // White tint for header elements
          headerShown: useClientOnlyValue(false, true),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "My Habits",
            headerTitle: () => <LogoHeader />,
            headerRight: () => <LogoutIcon />,
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={focused ? 32 : 28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create-habit"
          options={{
            title: "",
            tabBarIcon: () => null, // We'll render the floating button separately
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push('/create-habit-modal');
            },
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: "Statistics",
            headerTitle: () => <LogoHeader />,
            headerRight: () => <LogoutIcon />,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name="stats-chart-outline" 
                size={focused ? 32 : 28} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
      
      {/* Floating Create Button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { 
            backgroundColor: themeColors.tint,
            shadowColor: themeColors.tint,
          }
        ]}
        onPress={() => router.push('/create-habit-modal')}
        activeOpacity={0.8}
      >
        <View style={[styles.buttonInner, { backgroundColor: themeColors.tint }]}>
          <Ionicons name="add" size={30} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 225,
    height: 150,
    marginBottom: 10,
  },
  headerLogo: {
    width: 206.25,
    height: 131.25,
    tintColor: 'white', // Keep white logo for contrast against dark blue header
  },
  logoutButton: {
    padding: 8,
    marginRight: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 35, // Position it so it floats above the tab bar
    alignSelf: 'center',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  buttonInner: {
    width: 59,
    height: 59,
    borderRadius: 29.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
