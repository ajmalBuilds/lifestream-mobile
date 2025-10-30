// DashboardScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  History,
  MessageSquare,
  Plus,
  Search,
  User2,
  Bell,
} from "lucide-react-native";
import ActiveRequestsCard from "@/components/common/ActiveRequestsCard";
import RecentActivityCard from "@/components/common/RecentActivityCard";
import { requestAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";
import { useActivityStore, Activity } from "@/store/activityStore";
import { activityService } from "@/services/ActivityService";

type RootStackParamList = {
  Main: undefined;
  CreateRequest: undefined;
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
  ActivityDetails: { activity: Activity };
  ActivityList: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Profile: undefined;
  Map: undefined;
  Messages: undefined;
};

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

interface ActiveRequest {
  id: string;
  urgency: "critical" | "high" | "medium" | "low";
  patient_name: string;
  created_at: string;
  blood_type: string;
  units_needed: number;
  hospital: string;
  latitude: number;
  longitude: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  route?: keyof MainTabParamList;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const { currentLocation } = useLocationStore();
  const { getRecentActivities, unreadCount, markAsRead } = useActivityStore();

  // Get recent activities from store - this returns Activity[] type
  const recentActivities = getRecentActivities(5);  

  useEffect(() => {
    fetchDashboardData();
    
    // Add sample activities if none exist
    if (recentActivities.length === 0) {
      addSampleActivities();
    }
  }, []);

  const fetchDashboardData = async () => {
    // Check location first
    if (!currentLocation?.latitude || !currentLocation?.longitude) {
      Alert.alert(
        "Location Required", 
        "Please enable location services to see nearby requests."
      );
      setActiveRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await requestAPI.getNearbyRequests(
        currentLocation.latitude, 
        currentLocation.longitude, 
        50, 
        user?.bloodType
      );

      const NearbyRequest = [...response.data.data.requests];
      setActiveRequests(NearbyRequest);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add sample activities for demonstration
  const addSampleActivities = () => {
    setTimeout(() => {
      activityService.requestCreated({
        requestId: "123",
        bloodType: user?.bloodType || "O+",
        units: 2,
        hospital: "City Hospital"
      });

      activityService.donorMatched({
        requestId: "123",
        bloodType: user?.bloodType || "O+",
        donorName: "John Smith",
        distance: 3.2
      });

      activityService.messageReceived({
        fromUser: "John Smith",
        message: "I can donate tomorrow at 2 PM",
        requestId: "123"
      });
    }, 1000);
  };

  const handleRequestPress = (request: any) => {
    navigation.navigate("RequestDetails", { 
      requestId: request.id,
      urgency: request.urgency,
      bloodType: request.blood_type,
      unitsNeeded: request.units_needed,
      patientName: request.requester_name,
      createdAt: request.created_at,
      hospital: request.hospital,
      latitude: request.latitude,
      longitude: request.longitude,
    });
  };

  const handleActivityPress = (activity: Activity) => {
    // Mark as read when pressed
    markAsRead(activity.id);
    navigation.navigate("ActivityDetails", { activity });
  };

  const handleViewAllActivities = () => {
    navigation.navigate("ActivityList");
  };

  const quickActions: QuickAction[] = [
    {
      id: "search",
      label: "Search",
      icon: <Search color="#023E8a" size={24} />,
      route: "Map",
    },
    {
      id: "history",
      label: "History",
      icon: <History color="#023E8a" size={24} />,
      route: "Requests",
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare color="#023E8a" size={24} />,
      route: "Messages",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User2 color="#023E8a" size={24} />,
      route: "Profile",
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2962ff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Create New Request Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.createButton}
          onPress={() => navigation.navigate("CreateRequest")}
        >
          <Plus color="white" size={20} />
          <Text style={styles.createButtonText}>Create New Request</Text>
        </TouchableOpacity>

        {/* Active Requests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Requests</Text>
            <Text style={styles.sectionCount}>{activeRequests.length}</Text>
          </View>

          {activeRequests.length > 0 ? (
            <ScrollView
              style={{ paddingVertical: 4}}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {activeRequests.map((request) => (
                <ActiveRequestsCard
                  key={request.id}
                  urgency={request.urgency}
                  createdAt={request.created_at}
                  bloodType={request.blood_type}
                  unitsNeeded={request.units_needed}
                  hospital={request.hospital}
                  onPress={() => handleRequestPress(request)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active requests nearby</Text>
              <Text style={styles.emptyStateSubtext}>
                Enable location to see requests in your area
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionWrapper}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionButton}>{action.icon}</View>
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            {recentActivities.length > 0 && (
              <TouchableOpacity onPress={handleViewAllActivities}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentActivities.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivities.map((activity) => (
                <RecentActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={handleActivityPress}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Bell size={32} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>
                Your activities will appear here
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  createButton: {
    backgroundColor: "#2962ff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#2962ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 14,
    color: "#2962ff",
    fontWeight: "600",
  },
  horizontalScrollContent: {
    paddingRight: 10,
  },
  emptyState: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "500",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#d1d5db",
    textAlign: "center",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  quickActionWrapper: {
    alignItems: "center",
    flex: 1,
  },
  quickActionButton: {
    backgroundColor: "#CAF0F8",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#023E8a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  activityList: {
    gap: 12,
  },
});

export default DashboardScreen;