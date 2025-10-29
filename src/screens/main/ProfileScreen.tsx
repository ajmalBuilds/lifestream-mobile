import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuthStore } from "@/store/authStore";
import {
  Bell,
  ChevronRight,
  Droplets,
  History,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Lock,
} from "lucide-react-native";

type RootStackParamList = {
  Main: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  DonationHistory: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

interface PersonalDetail {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface DonationRecord {
  date: string;
  units: number;
  location: string;
  type: string;
}

interface Setting {
  label: string;
  color: string;
  icon: React.ReactNode;
  onPress: () => void;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const userPersonalDetails: PersonalDetail[] = [
    {
      label: "Blood Type",
      value: user?.bloodType || "Not specified",
      icon: <Droplets color="#D30000" />,
    },
    {
      label: "Email",
      value: user?.email || "Not specified",
      icon: <Mail color="#D30000" />,
    },
    {
      label: "Phone Number",
      value: user?.phone || "Not specified",
      icon: <Phone color="#D30000" />,
    },
    {
      label: "Location",
      value: "Not specified",
      icon: <MapPin color="#D30000" />,
    },
  ];

  // TODO: Replace with actual donation history from API
  const donationHistory: DonationRecord[] = [
    {
      date: "Feb 20, 2024",
      units: 2,
      location: "City Hospital",
      type: "Blood",
    },
    {
      date: "May 15, 2023",
      units: 1,
      location: "Downtown Clinic",
      type: "Platelets",
    },
    {
      date: "Apr 10, 2023",
      units: 3,
      location: "General Hospital",
      type: "Blood",
    },
    {
      date: "Jan 5, 2023",
      units: 1,
      location: "Health Center",
      type: "Blood",
    },
  ];

  const settings: Setting[] = [
    {
      label: "Change Password",
      color: "#000000",
      icon: <Lock color="#6BABFF" />,
      onPress: () => {
        if (navigation.getState().routes.find(r => r.name === 'ChangePassword')) {
          navigation.navigate("ChangePassword");
        } else {
          Alert.alert("Coming Soon", "This feature is under development");
        }
      },
    },
    {
      label: "Manage Notification",
      color: "#000000",
      icon: <Bell color="#6BABFF" />,
      onPress: () => {
        if (navigation.getState().routes.find(r => r.name === 'NotificationSettings')) {
          navigation.navigate("NotificationSettings");
        } else {
          Alert.alert("Coming Soon", "This feature is under development");
        }
      },
    },
    {
      label: "Log Out",
      color: "#D30000",
      icon: <LogOut color="#D30000" />,
      onPress: handleLogout,
    },
  ];

  const isNotLastIndex = (index: number, array: any[]): 0 | 1 => {
    return index === array.length - 1 ? 0 : 1;
  };

  const handleViewAllHistory = () => {
    if (navigation.getState().routes.find(r => r.name === 'DonationHistory')) {
      navigation.navigate("DonationHistory");
    } else {
      Alert.alert("Donation History", "View all your past donations");
    }
  };

  const handleEditProfile = () => {
    if (navigation.getState().routes.find(r => r.name === 'EditProfile')) {
      navigation.navigate("EditProfile");
    } else {
      Alert.alert("Coming Soon", "Profile editing is under development");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.userProfilePicCard}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Pencil color="white" size={20} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.name || "User"}</Text>
        </View>

        {/* Personal Details */}
        <View style={styles.card}>
          <Text style={styles.title}>Personal Details</Text>
          {userPersonalDetails.map((detail, index) => (
            <View
              key={index}
              style={[
                styles.listItem,
                {
                  borderBottomWidth: isNotLastIndex(index, userPersonalDetails),
                },
              ]}
            >
              <View style={styles.listItemLeft}>
                <View style={styles.iconCircle}>{detail.icon}</View>
                <Text style={styles.label}>{detail.label}</Text>
              </View>
              <Text style={styles.detail}>{detail.value}</Text>
            </View>
          ))}
        </View>

        {/* Donation History */}
        <View style={[styles.card, styles.historyCard]}>
          <View style={styles.historyHeader}>
            <Text style={[styles.title, styles.noMargin]}>
              Donation History
            </Text>
            <Text style={[styles.detail, styles.totalText]}>
              Total: {donationHistory.length}
            </Text>
          </View>

          {donationHistory.slice(0, 3).map((donation, index) => (
            <View
              key={index}
              style={[
                styles.listItem,
                {
                  borderBottomWidth: isNotLastIndex(
                    index,
                    donationHistory.slice(0, 3)
                  ),
                },
              ]}
            >
              <View style={[styles.listItemLeft, styles.donationItem]}>
                <View style={styles.iconCircle}>
                  <History color="#D30000" />
                </View>
                <View>
                  <Text style={styles.label}>{donation.location}</Text>
                  <Text style={styles.detail}>{donation.type}</Text>
                </View>
              </View>
              <Text style={styles.detail}>{donation.date}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={handleViewAllHistory}
          >
            <Text style={styles.viewAllButtonText}>View All History</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={[styles.card, styles.settingsCard]}>
          <Text style={styles.title}>Account Settings</Text>
          {settings.map((setting, index) => (
            <TouchableOpacity
              key={index}
              onPress={setting.onPress}
              style={[
                styles.listItem,
                {
                  borderBottomWidth: isNotLastIndex(index, settings),
                },
              ]}
            >
              <View style={styles.listItemLeft}>
                <View style={styles.iconCircle}>{setting.icon}</View>
                <Text style={[styles.label, { color: setting.color }]}>
                  {setting.label}
                </Text>
              </View>
              {isNotLastIndex(index, settings) === 1 && (
                <ChevronRight color="#9CA3AF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyText}>
            Your personal and medical data information is kept safe.
          </Text>
          <TouchableOpacity>
            <Text style={styles.privacyLink}>Read our Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 50,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  userProfilePicCard: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D30000",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: "75%",
    top: "75%",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderRadius: 10,
    marginBottom: 25,
  },
  historyCard: {
    paddingBottom: 20,
  },
  settingsCard: {
    marginBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  noMargin: {
    marginBottom: 0,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalText: {
    marginBottom: 0,
    fontWeight: "600",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#e5e7eb",
    paddingVertical: 15,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  donationItem: {
    maxWidth: "45%",
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#000",
    fontWeight: "700",
  },
  detail: {
    fontSize: 14,
    color: "#000",
    marginBottom: 5,
    fontWeight: "400",
  },
  viewAllButton: {
    backgroundColor: "#FFDEDB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  viewAllButtonText: {
    color: "#D30000",
    fontSize: 16,
    fontWeight: "600",
  },
  privacyNotice: {
    alignItems: "center",
  },
  privacyText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "gray",
    marginBottom: 5,
  },
  privacyLink: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#2196F3",
  },
});

export default ProfileScreen;