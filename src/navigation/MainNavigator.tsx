import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import DashboardScreen from '@/screens/main/DashboardScreen';
import MapScreen from '@/screens/main/RequestsScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import { House, MapPin, User, Bell, Menu } from 'lucide-react-native';

export type MainTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomHeader = ({ title, onNotificationPress, onMenuPress }: { 
  title: string; 
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40, // Add some top padding for status bar
    height: 100,
    backgroundColor: '#ffffff',
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'black' }}>{title}</Text>
    </View>
    
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={onNotificationPress} style={{ padding: 12, marginRight: 0 }}>
        <Bell color="black" size={26} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onMenuPress} style={{ padding: 12 }}>
        <Menu color="black" size={26} />
      </TouchableOpacity>
    </View>
  </View>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        header: ({ route, options }) => (
          <CustomHeader 
            title={options.title || route.name}
            onNotificationPress={() => console.log('Notifications pressed')}
            onMenuPress={() => console.log('Menu pressed')}
          />
        ),
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'LifeStream',
          tabBarIcon: ({ color, size }) => (
            <House color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Requests" 
        component={MapScreen}
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, size }) => (
            <MapPin color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;