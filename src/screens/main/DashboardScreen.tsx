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
  Sparkles,
} from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import ActiveRequestsCard from "@/components/common/ActiveRequestsCard";
import ActiveRequestsCardSkeleton from "@/components/skelton/ActiveRequestsCard";
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
  gradient: readonly [string, string];
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const { user } = useAuthStore();
  const { currentLocation } = useLocationStore();
  const { getRecentActivities, unreadCount, markAsRead } = useActivityStore();

  const recentActivities = getRecentActivities(5);  

  useEffect(() => {
    fetchDashboardData();
    
    if (recentActivities.length === 0) {
      addSampleActivities();
    }
  }, []);

  const fetchDashboardData = async () => {
    if (!currentLocation?.latitude || !currentLocation?.longitude) {
      Alert.alert(
        "Location Required", 
        "Please enable location services to see nearby requests."
      );
      setActiveRequests([]);
      setIsLoadingRequests(false);
      return;
    }

    try {
      setIsLoadingRequests(true);
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
    } finally {
      setIsLoadingRequests(false);
    }
  };

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
    console.log("Blood Request Details :", request);
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
      icon: <Search color="#fff" size={22} />,
      route: "Map",
      gradient: ["#667eea", "#764ba2"] as const,
    },
    {
      id: "history",
      label: "History",
      icon: <History color="#fff" size={22} />,
      route: "Requests",
      gradient: ["#f093fb", "#f5576c"] as const,
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare color="#fff" size={22} />,
      route: "Messages",
      gradient: ["#4facfe", "#00f2fe"] as const,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User2 color="#fff" size={22} />,
      route: "Profile",
      gradient: ["#43e97b", "#38f9d7"] as const,
    },
  ];

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Hero Section with Gradient Button */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>Save a Life Today</Text>
                <Text style={styles.heroSubtitle}>Your blood donation can make a difference</Text>
              </View>
              <Sparkles color="#fff" size={32} style={styles.sparkleIcon} />
            </View>
          </LinearGradient>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.createButtonWrapper}
            onPress={() => navigation.navigate("CreateRequest")}
          >
            <LinearGradient
              colors={["#f093fb", "#f5576c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButton}
            >
              <View style={styles.plusIconContainer}>
                <Plus color="white" size={20} strokeWidth={3} />
              </View>
              <Text style={styles.createButtonText}>Create New Request</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Active Requests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIconWrapper}>
                <View style={styles.sectionIconBg} />
              </View>
              <Text style={styles.sectionTitle}>Active Requests</Text>
            </View>
            {!isLoadingRequests && activeRequests.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{activeRequests.length}</Text>
              </View>
            )}
          </View>

          {isLoadingRequests ? (
            <ScrollView
              style={styles.requestsScrollView}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              <ActiveRequestsCardSkeleton />
              <ActiveRequestsCardSkeleton />
              <ActiveRequestsCardSkeleton />
            </ScrollView>
          ) : activeRequests.length > 0 ? (
            <ScrollView
              style={styles.requestsScrollView}
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
              <View style={styles.emptyStateIconContainer}>
                <Search size={40} color="#c7d2fe" />
              </View>
              <Text style={styles.emptyStateText}>No active requests nearby</Text>
              <Text style={styles.emptyStateSubtext}>
                Enable location to see requests in your area
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions with Gradients */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionWrapper}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={action.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionButton}
                >
                  {action.icon}
                </LinearGradient>
                <Text style={styles.quickActionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.activityHeaderLeft}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconWrapper}>
                  <View style={[styles.sectionIconBg, { backgroundColor: "#fef3c7" }]} />
                </View>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
              </View>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            {recentActivities.length > 0 && (
              <TouchableOpacity onPress={handleViewAllActivities} style={styles.viewAllButton}>
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
              <View style={styles.emptyStateIconContainer}>
                <Bell size={40} color="#c7d2fe" />
              </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 28,
  },
  gradientBackground: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  sparkleIcon: {
    opacity: 0.9,
  },
  createButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#f5576c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  plusIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    padding: 4,
    marginRight: 12,
  },
  createButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIconWrapper: {
    position: "relative",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionIconBg: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 32,
    alignItems: "center",
  },
  countBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  activityHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  unreadBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewAllText: {
    fontSize: 15,
    color: "#4f46e5",
    fontWeight: "700",
  },
  requestsScrollView: {
    paddingVertical: 4,
  },
  horizontalScrollContent: {
    paddingRight: 10,
    paddingLeft: 4,
  },
  emptyState: {
    backgroundColor: "white",
    padding: 48,
    borderRadius: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#f1f5f9",
    borderStyle: "dashed",
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 17,
    color: "#64748b",
    fontWeight: "600",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    maxWidth: 240,
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionWrapper: {
    alignItems: "center",
    flex: 1,
  },
  quickActionButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  activityList: {
    gap: 12,
  },
});

export default DashboardScreen;