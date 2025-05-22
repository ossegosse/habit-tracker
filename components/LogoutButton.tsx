// LogoutButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { signOut } from "@/services/firestore/auth-service";
import { router } from "expo-router";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/auth/Login");
    } catch (error: any) {
      alert("Logout failed: " + error.message);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout}>
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});