import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { useAuthStore } from "../store/authStore";
import CreateRequest from "@/screens/emergency/CreateRequestScreen";
import EditProfile from "@/screens/profile/EditProfileScreen";
import RequestDetails from "@/screens/emergency/RequestDetailsScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  RequestDetails: { 
    requestId: string; 
    urgency?: string; 
    bloodType?: string; 
    patientName?: string; 
    unitsNeeded?: number;
    createdAt?: string;
    hospital?: string;
    latitude: number;
    longitude: number;
  };
  EditProfile: undefined;
  CreateRequest: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="CreateRequest" component={CreateRequest} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="RequestDetails" component={RequestDetails} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
