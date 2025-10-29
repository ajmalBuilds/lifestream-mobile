import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "@/navigation/AppNavigator";
import "./global.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuthStore } from "@/store/authStore";
import { socketService } from "@/services/socketService";

export default function App() {
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <>
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
        <StatusBar 
        backgroundColor="#ffffff" 
        barStyle="dark-content" 
        translucent={false}
      />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
    </>
  );
}
