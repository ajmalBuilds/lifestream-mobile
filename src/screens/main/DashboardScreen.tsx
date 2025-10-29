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
} from "lucide-react-native";
import ActiveRequestsCard from "@/components/common/ActiveRequestsCard";
import RecentActivityCard from "@/components/common/RecentActivityCard";

type RootStackParamList = {
  Main: undefined;
  CreateRequest: undefined;
  RequestDetails: { requestId: string };
  ActivityDetails: { activityId: string };
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
  createdAt: string;
  bloodType: string;
  unitsNeeded: number;
  hospital: string;
}

interface RecentActivity {
  id: string;
  createdAt: string;
  type: "success" | "newDonorMatched" | "scheduled";
  message: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  route?: keyof MainTabParamList;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API calls
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API response
      const mockActiveRequests: ActiveRequest[] = [
        {
          id: "1",
          urgency: "critical",
          createdAt: "2 hrs ago",
          bloodType: "A+",
          unitsNeeded: 4,
          hospital: "City Hospital",
        },
        {
          id: "2",
          urgency: "high",
          createdAt: "5 hrs ago",
          bloodType: "O-",
          unitsNeeded: 2,
          hospital: "General Hospital",
        },
        {
          id: "3",
          urgency: "medium",
          createdAt: "1 day ago",
          bloodType: "B+",
          unitsNeeded: 3,
          hospital: "Community Clinic",
        },
        {
          id: "4",
          urgency: "low",
          createdAt: "2 days ago",
          bloodType: "AB+",
          unitsNeeded: 1,
          hospital: "Health Center",
        },
      ];

      const mockRecentActivities: RecentActivity[] = [
        {
          id: "997",
          createdAt: "2 min ago",
          type: "success",
          message: "Request for O+ fulfilled",
        },
        {
          id: "998",
          createdAt: "1 day ago",
          type: "newDonorMatched",
          message: "New donor matched for Request #5821",
        },
        {
          id: "999",
          createdAt: "2 days ago",
          type: "scheduled",
          message: "Donation scheduled with donor",
        },
      ];

      setActiveRequests(mockActiveRequests);
      setRecentActivities(mockRecentActivities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPress = (requestId: string) => {
    // Navigate to request details
    navigation.navigate("RequestDetails", { requestId });
  };

  const handleActivityPress = (activityId: string) => {
    // Navigate to activity details
    navigation.navigate("ActivityDetails", { activityId });
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

  // const handleQuickAction = (action: QuickAction) => {
  //   if (action.route) {
  //     // Check if the route exists in navigation state
  //     const state = navigation.getState();
  //     const routeExists = state.routes.some((r) => r.name === action.route);

  //     if (routeExists || action.route === "Map" || action.route === "Messages") {
  //       // For tab navigation, you might need to use a different approach
  //       // This depends on your navigation structure
  //       Alert.alert("Navigation", `Navigating to ${action.label}`);
  //       // navigation.navigate(action.route); // Uncomment when routes are set up
  //     } else {
  //       Alert.alert("Coming Soon", `${action.label} feature is under development`);
  //     }
  //   }
  // };

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
                  createdAt={request.createdAt}
                  bloodType={request.bloodType}
                  unitsNeeded={request.unitsNeeded}
                  hospital={request.hospital}
                  // onPress={() => handleRequestPress(request.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active requests</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionWrapper}
              // onPress={() => handleQuickAction(action)}
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
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>

          {recentActivities.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivities.map((activity) => (
                <RecentActivityCard
                  key={activity.id}
                  id={activity.id}
                  createdAt={activity.createdAt}
                  type={activity.type}
                  message={activity.message}
                  // onPress={() => handleActivityPress(activity.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent activity</Text>
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
  horizontalScrollContent: {
    paddingRight: 10,
  },
  emptyState: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "500",
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