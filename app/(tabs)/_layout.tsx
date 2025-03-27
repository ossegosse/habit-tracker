import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router, Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
          title: "Habits",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={30}
              color="green"
            />
          ),
        }}
      />

      <Tabs.Screen
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
          /* tabBarButton: (props) => {
            return (
              <Pressable {...props} onPress={() => router.push("/modal")}>
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={40}
                  color="green"
                  style={{
                    opacity: props.accessibilityState?.selected ? 0.5 : 1,
                  }}
                />
              </Pressable>
            );
          }, */
        }}
      />

      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={30} color="green" />
          ),
        }}
      />
    </Tabs>
  );
}
