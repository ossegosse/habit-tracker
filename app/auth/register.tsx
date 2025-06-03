import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { registerUser } from "@/services/firestore/auth-service";
import Colors from '@/constants/Colors';
import { useColorScheme } from "@/components/useColorScheme";


export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          backgroundColor: themeColors.authbackground,
        },
        logo: {
          width: 300,
          height: 200,
          alignSelf: 'center',
          marginTop: 40,
          color: themeColors.text,
        },
        title: {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          marginTop: 100,
          textAlign: 'center',
          color: themeColors.tint,
        },
        input: {
          borderWidth: 1,
          borderColor: themeColors.tint,
          padding: 10,
          fontSize: 16,
          borderRadius: 6,
          marginBottom: 12,
          color: themeColors.tint,
          backgroundColor: themeColors.background,
        },
        button: {
          backgroundColor: themeColors.tint,
          padding: 15,
          borderRadius: 6,
          alignItems: 'center',
          marginTop: 10,
        },
        buttonText: {
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
        },
        link: {
          color: themeColors.tint,
          textAlign: 'center',
          marginTop: 20,
        }
      });

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(email, password);
      Alert.alert('Success', 'Account created successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('@/assets/images/habittracker.png')} />
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating account...' : 'Register'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => router.push('/auth/login')}
      >
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

/* const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    color: 'green',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    marginBottom: 12,
    color: 'white',
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: 'green',
    textAlign: 'center',
    marginTop: 20,
  }
}); */