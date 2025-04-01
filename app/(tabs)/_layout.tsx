import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router, Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/services/auth-provider";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Habits",
          headerStyle: {
            backgroundColor: 'green',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={30}
              color="green"
            />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="create-habit"
        options={{
          title: "Create Habit",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={30}
              color="green"
            />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          headerStyle: {
            backgroundColor: 'green',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={30} color="green" />
          ),
        }}
      />
      <Tabs.Screen
        name="user-profile"
        options={{
          title: "Profile",
          headerStyle: {
            backgroundColor: 'green',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={30} color="green" />
          ),
        }}
      />
    </Tabs>

    
  );
}
