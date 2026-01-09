import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";
import { locationService } from "@/services/locationService";
import { socketService } from "@/services/sockets/socketService";
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
  Navigation,
  AlertTriangle,
  Shield,
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
  const { currentLocation, isTracking, isLoading, updateLocation, permissionStatus } =
    useLocationStore();
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTogglingLocation, setIsTogglingLocation] = useState(false);

  useEffect(() => {
    initializeScreen();

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Sync local switch state with store tracking state
  useEffect(() => {
    setIsLocationEnabled(isTracking);
  }, [isTracking]);

  const initializeScreen = async () => {
    try {
      // Initialize socket connection
      socketService.connect();

      // Check current permission status
      const permissions = await locationService.checkPermissions();
      useLocationStore.getState().setPermissionStatus(permissions);

      // Set UI state based on permissions and tracking status
      const shouldBeEnabled = isTracking && permissions.foreground;
      setIsLocationEnabled(shouldBeEnabled);

      // If tracking was enabled but permissions are revoked, stop tracking
      if (isTracking && !permissions.foreground) {
        locationService.stopWatchingLocation();
        Alert.alert(
          "Location Permission Required",
          "Location permissions have been revoked. Please re-enable location tracking."
        );
      }

      // If tracking is enabled and permissions exist, restart watching
      if (isTracking && permissions.foreground) {
        const started = await locationService.startWatchingLocation();
        if (!started) {
          // Failed to restart, update state
          setIsLocationEnabled(false);
        }
      }
    } catch (error) {
      console.error("Error initializing screen:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLocationToggle = async (enabled: boolean) => {
    // Prevent multiple simultaneous toggle operations
    if (isTogglingLocation) {
      return;
    }

    setIsTogglingLocation(true);

    try {
      if (enabled) {
        const success = await enableLocationTracking();
        // State is updated by enableLocationTracking via store
        if (!success) {
          // Ensure switch reflects failure
          setIsLocationEnabled(false);
        }
      } else {
        await disableLocationTracking();
        // State is updated by disableLocationTracking via store
      }
    } finally {
      setIsTogglingLocation(false);
    }
  };

  const enableLocationTracking = async (): Promise<boolean> => {
    try {
      // Check existing permissions first
      let permissions = await locationService.checkPermissions();

      // Request permissions if not granted
      if (!permissions.foreground) {
        permissions = await locationService.requestPermissions();
        
        if (!permissions.foreground) {
          Alert.alert(
            "Location Permission Required",
            "LifeStream needs location access to help connect blood donors with recipients in emergencies. Please enable location permissions in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: async () => {
                  await locationService.openSettings();
                },
              },
            ]
          );
          return false;
        }
      }

      // Get initial location
      const location = await locationService.getCurrentLocation();
      if (location) {
        const address = await locationService.getAddressFromCoords(
          location.latitude,
          location.longitude
        );

        await updateLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          address,
        });
      }

      // Start continuous tracking
      const trackingStarted = await locationService.startWatchingLocation();

      if (trackingStarted) {
        Alert.alert(
          "Success",
          "Location tracking enabled. You will now appear on the emergency map."
        );
        return true;
      } else {
        throw new Error("Failed to start location tracking");
      }
    } catch (error) {
      console.error("Error enabling location tracking:", error);
      Alert.alert(
        "Error",
        "Failed to enable location tracking. Please try again."
      );
      return false;
    }
  };

  const disableLocationTracking = async () => {
    try {
      locationService.stopWatchingLocation();
      Alert.alert(
        "Location Tracking Disabled",
        "You will no longer appear on the emergency map."
      );
    } catch (error) {
      console.error("Error disabling location tracking:", error);
    }
  };

  const updateCurrentLocation = async () => {
    if (!permissionStatus.foreground) {
      Alert.alert(
        "Permission Required",
        "Please enable location tracking first.",
        [
          {
            text: "OK",
            onPress: () => {
              // Optionally suggest enabling tracking
              if (!isLocationEnabled) {
                Alert.alert(
                  "Enable Location Tracking?",
                  "Would you like to enable location tracking now?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Enable",
                      onPress: () => handleLocationToggle(true),
                    },
                  ]
                );
              }
            },
          },
        ]
      );
      return;
    }

    setIsUpdatingLocation(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        const address = await locationService.getAddressFromCoords(
          location.latitude,
          location.longitude
        );

        await updateLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          address,
        });

        Alert.alert("Success", "Location updated successfully!");
      } else {
        throw new Error("Could not get current location");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert("Error", "Failed to update location. Please try again.");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // Stop location tracking
          locationService.stopWatchingLocation();
          // Disconnect socket
          socketService.disconnect();
          // Logout
          logout();
        },
      },
    ]);
  };

  const formatLocation = (location: typeof currentLocation) => {
    if (!location) return "Not available";

    if (location.address) {
      return location.address.length > 30
        ? location.address.substring(0, 30) + "..."
        : location.address;
    }

    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const getLocationStatusText = () => {
    if (isLocationEnabled && permissionStatus.foreground) {
      return "Active";
    } else if (permissionStatus.foreground && !isLocationEnabled) {
      return "Permitted (Inactive)";
    } else {
      return "Disabled";
    }
  };

  const getLocationStatusColor = () => {
    if (isLocationEnabled && permissionStatus.foreground) {
      return "#059669"; // Green
    } else if (permissionStatus.foreground && !isLocationEnabled) {
      return "#d97706"; // Orange
    } else {
      return "#6b7280"; // Gray
    }
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
      label: "Location Status",
      value: getLocationStatusText(),
      icon: <MapPin color={getLocationStatusColor()} />,
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
        if (
          navigation.getState().routes.find((r) => r.name === "ChangePassword")
        ) {
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
        if (
          navigation
            .getState()
            .routes.find((r) => r.name === "NotificationSettings")
        ) {
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
    if (
      navigation.getState().routes.find((r) => r.name === "DonationHistory")
    ) {
      navigation.navigate("DonationHistory");
    } else {
      Alert.alert("Donation History", "View all your past donations");
    }
  };

  const handleEditProfile = () => {
    if (navigation.getState().routes.find((r) => r.name === "EditProfile")) {
      navigation.navigate("EditProfile");
    } else {
      Alert.alert("Coming Soon", "Profile editing is under development");
    }
  };

  if (isInitializing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#D30000" />
      </View>
    );
  }

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
          <Text style={styles.userType}>
            {user?.userType === "donor" ? "Blood Donor" : "Recipient"}
          </Text>
        </View>

        {/* Location Tracking Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color="#D30000" />
            <Text style={styles.cardTitle}>Location Services</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Enable Location Tracking</Text>
              <Text style={styles.toggleDescription}>
                {user?.userType === "donor"
                  ? "Allow recipients to find you during emergencies"
                  : "Help donors locate you when you need blood"}
              </Text>
            </View>
            <Switch
              value={isLocationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: "#e5e7eb", true: "#D30000" }}
              thumbColor={isLocationEnabled ? "#ffffff" : "#f3f4f6"}
              disabled={isLoading || isTogglingLocation}
            />
          </View>

          {/* Permission Status Indicator */}
          {permissionStatus.foreground && (
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionText}>
                ✓ Foreground permission granted
              </Text>
              {permissionStatus.background && (
                <Text style={styles.permissionText}>
                  ✓ Background permission granted
                </Text>
              )}
            </View>
          )}

          {currentLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Current Location:</Text>
              <Text style={styles.locationValue}>
                {formatLocation(currentLocation)}
              </Text>
              <Text style={styles.locationTimestamp}>
                Last updated:{" "}
                {new Date(currentLocation.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.outlineButton,
              (!isLocationEnabled || isUpdatingLocation) && styles.buttonDisabled,
            ]}
            onPress={updateCurrentLocation}
            disabled={isUpdatingLocation || !isLocationEnabled}
          >
            {isUpdatingLocation ? (
              <ActivityIndicator size="small" color="#D30000" />
            ) : (
              <>
                <Navigation size={16} color="#D30000" />
                <Text style={styles.outlineButtonText}>
                  Update Location Now
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!isLocationEnabled && (
            <View style={styles.warningBox}>
              <AlertTriangle size={16} color="#d97706" />
              <Text style={styles.warningText}>
                Location tracking is disabled.{" "}
                {user?.userType === "donor"
                  ? "You will not appear to recipients in need."
                  : "Donors cannot locate you during emergencies."}
              </Text>
            </View>
          )}
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
              <Text
                style={[
                  styles.detail,
                  detail.label === "Location Status" && {
                    color: getLocationStatusColor(),
                    fontWeight: "600",
                  },
                ]}
              >
                {detail.value}
              </Text>
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

        {/* Privacy & Security Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={20} color="#059669" />
            <Text style={styles.cardTitle}>Privacy & Security</Text>
          </View>

          <Text style={styles.privacyText}>
            • Your location is shared only when you enable tracking{"\n"}•
            Location data is encrypted and securely stored{"\n"}• You can
            disable tracking at any time{"\n"}• Only verified users can see your
            location
          </Text>
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
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 5,
  },
  userType: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 8,
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
    gap: 10,
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
    fontWeight: "500",
  },
  detail: {
    fontSize: 14,
    color: "#000",
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
    textAlign: "left",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "400",
    color: "gray",
    marginBottom: 5,
  },
  privacyLink: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#2196F3",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  permissionInfo: {
    backgroundColor: "#ecfdf5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 12,
    color: "#059669",
    marginBottom: 2,
  },
  locationInfo: {
    backgroundColor: "#F8F6F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
    marginBottom: 4,
  },
  locationTimestamp: {
    fontSize: 10,
    color: "#9ca3af",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D30000",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  outlineButtonText: {
    color: "#D30000",
    fontSize: 14,
    fontWeight: "600",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#d97706",
    lineHeight: 16,
  },
});

export default ProfileScreen;