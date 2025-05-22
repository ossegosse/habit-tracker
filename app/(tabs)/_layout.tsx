import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router, Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/services/auth-provider";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("./auth/login");
    }
  }, [isLoading, user]);
  
  if (isLoading || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tabIconSelected,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: themeColors.navBackground,
          borderTopColor: themeColors.border,
        },
        headerStyle: {
          backgroundColor: themeColors.header,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
          color: themeColors.text,
        },
        headerTintColor: themeColors.text,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Habits",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user-profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
