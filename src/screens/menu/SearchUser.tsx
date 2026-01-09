import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    LayoutAnimation,
  } from "react-native";
  import React, { useEffect, useRef, useState } from "react";
  import Header from "@/components/common/Header";
  import { RouteProp } from "@react-navigation/native";
  import { StackNavigationProp } from "@react-navigation/stack";
  import { SendHorizonal, RefreshCw, Check, ChevronDownCircle, ChevronUpCircle, ChevronDown, ChevronUp, Trash2, Copy, EllipsisVertical, X } from "lucide-react-native";
  import { useChatStore } from "@/store/chatStore";
  import { useAuthStore } from "@/store/authStore";
  
  type RootStackParamList = {
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
      isFromUserRequests: boolean;
    };
    SearchUsersScreen: {
      requestId: string;
      urgency?: string;
      bloodType?: string;
      patientName?: string;
      unitsNeeded?: number;
      createdAt?: string;
      hospital?: string;
      latitude: number;
      longitude: number;
      isFromUserRequests: boolean;
    };
  };
  
  type SearchUsersScreenRouteProp = RouteProp<RootStackParamList, "SearchUsersScreen">;
  type SearchUsersScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "SearchUsersScreen"
  >;
  
  interface Props {
    route: SearchUsersScreenRouteProp;
    navigation: SearchUsersScreenNavigationProp;
  }
  
  const SearchUsersScreen: React.FC<Props> = ({ route, navigation }) => {
  
    return (
      <>
      </>
    );
  };
  
  export default SearchUsersScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8F6F6",
    }
  });
  