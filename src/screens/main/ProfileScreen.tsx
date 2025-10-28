import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';

type MainTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Profile: undefined;
};

type ProfileScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user ? user.name : ""}</Text>
        <Text style={styles.detailLabel}>Email: <Text style={styles.detail}>{user?.email}</Text></Text>
        <Text style={styles.detailLabel}>Blood Type: <Text style={styles.detail}>{user?.bloodType || 'Not specified'}</Text></Text>
        <Text style={styles.detailLabel}>User Type: <Text style={styles.detail}>{user?.userType}</Text></Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => console.log('Edit profile')}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 30,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#dc2626',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#6b7280',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;