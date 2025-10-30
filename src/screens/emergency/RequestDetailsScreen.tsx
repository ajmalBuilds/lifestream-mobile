import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert 
} from "react-native";
import Header from "@/components/common/Header";
import { Droplets, PlusSquare, MapPin, Navigation, Clock, User } from "lucide-react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocationStore } from "@/store/locationStore";
import { locationService } from "@/services/locationService";
import { formatRelativeTime } from "@/utils/timeUtils";

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
  };
};

type RequestDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "RequestDetails"
>;
type RequestDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RequestDetails"
>;

interface Props {
  route: RequestDetailsScreenRouteProp;
  navigation: RequestDetailsScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const RequestDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { 
    requestId, 
    urgency, 
    bloodType, 
    patientName, 
    unitsNeeded, 
    createdAt, 
    hospital, 
    latitude, 
    longitude 
  } = route.params;
  
  const { currentLocation } = useLocationStore();
  const [address, setAddress] = useState<string>("");
  const [distance, setDistance] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  useEffect(() => {
    loadLocationData();
  }, []);

  const loadLocationData = async () => {
    try {
      setIsLoadingAddress(true);
      
      // Get address from coordinates
      const locationAddress = await locationService.getAddressFromCoords(latitude, longitude);
      setAddress(locationAddress);

      // Calculate distance if user location is available
      if (currentLocation) {
        const dist = locationService.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          latitude,
          longitude
        );
        setDistance(dist);
        setEstimatedTime(calculateEstimatedTime(dist));
      }
    } catch (error) {
      console.error("Error loading location data:", error);
      setAddress("Address not available");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const calculateEstimatedTime = (distance: number): string => {
    if (distance < 1) return "Less than 5 min walk";
    if (distance < 3) return "Approx. 10-15 min drive";
    if (distance < 5) return "Approx. 15-20 min drive";
    if (distance < 10) return "Approx. 20-30 min drive";
    return "Approx. 30+ min drive";
  };

  const getUrgencyColor = () => {
    switch (urgency) {
      case "low":
        return "#34D399"; // Green
      case "medium":
        return "#FBBF24"; // Yellow
      case "high":
        return "#F87171"; // Red
      case "critical":
        return "#D30000"; // Dark Red
      default:
        return "#6B7280"; // Gray
    }
  };

  const getUrgencyBackground = () => {
    switch (urgency) {
      case "low":
        return "#F0FDF4"; // Light Green
      case "medium":
        return "#FFFBEB"; // Light Yellow
      case "high":
        return "#FEF2F2"; // Light Red
      case "critical":
        return "#FEF2F2"; // Light Red
      default:
        return "#F9FAFB"; // Light Gray
    }
  };

  const getBloodTypeInAlphabetic = () => {
    switch (bloodType) {
      case "A+":
        return "A Positive (A+)";
      case "A-":
        return "A Negative (A-)";
      case "B+":
        return "B Positive (B+)";
      case "B-":
        return "B Negative (B-)";
      case "AB+":
        return "AB Positive (AB+)";
      case "AB-":
        return "AB Negative (AB-)";
      case "O+":
        return "O Positive (O+)";
      case "O-":
        return "O Negative (O-)";
      default:
        return "Unknown Blood Type";
    }
  };

  const handleAcceptRequest = () => {
    Alert.alert(
      "Accept Request",
      "You are about to accept this blood request. You will be connected with the requester.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          style: "default",
          onPress: () => {
            // Navigate to chat screen
            Alert.alert("Success", "Request accepted! Navigating to chat...");
          }
        }
      ]
    );
  };

  const handleNavigate = () => {
    Alert.alert(
      "Open in Maps",
      "Open this location in your maps app?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open Maps", 
          style: "default",
          onPress: () => {
            // Implementation for opening in maps app
            Alert.alert("Navigation", "Opening in maps app...");
          }
        }
      ]
    );
  };

  const mapRegion = {
    latitude: latitude,
    longitude: longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header title="Request Details" backgroundColor="#f8fafc" />
      
      {/* Main Request Card */}
      <View style={[styles.card]}>
        <View style={styles.cardTop}>
          <View style={[styles.circle, { backgroundColor: getUrgencyBackground() }]}>
            <Droplets color={getUrgencyColor()} size={24} />
          </View>
          <View style={styles.urgencyContent}>
            <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor() }]}>
              <Text style={styles.urgencyBadgeText}>
                {urgency?.toUpperCase() || "URGENT"}
              </Text>
            </View>
            <Text style={styles.bloodTypeTitle}>{getBloodTypeInAlphabetic()}</Text>
            <Text style={styles.unitsText}>{unitsNeeded} Units Needed</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          {patientName && (
            <View style={styles.detailRow}>
              <User size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>Patient:</Text>
              <Text style={styles.detailValue}>{patientName}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Droplets size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Blood Type:</Text>
            <Text style={[styles.detailValue, styles.bloodTypeValue]}>{bloodType}</Text>
          </View>

          {createdAt && (
            <View style={styles.detailRow}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>Requested:</Text>
              <Text style={styles.detailValue}>{formatRelativeTime(createdAt)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Map Card */}
      <View style={styles.card}>
        <View style={styles.mapHeader}>
          <MapPin size={20} color="#D30000" />
          <Text style={styles.mapTitle}>Request Location</Text>
        </View>
        
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              title={hospital}
              description={address}
              pinColor="#D30000"
            />
          </MapView>
          
          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
            <Navigation size={16} color="#FFFFFF" />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hospital Details Card */}
      <View style={styles.card}>
        <View style={styles.hospitalHeader}>
          <View style={[styles.circle, { borderRadius: 12, backgroundColor: "#FBEAE8" }]}>
            <PlusSquare size={24} color={"#D30000"} />
          </View>
          <View style={styles.hospitalInfo}>
            <Text style={styles.hospitalName}>{hospital}</Text>
            {isLoadingAddress ? (
              <ActivityIndicator size="small" color="#2962ff" style={styles.loadingIndicator} />
            ) : (
              <>
                <Text style={styles.distanceText}>
                  {distance > 0 ? `${distance.toFixed(1)} km away` : "Calculating distance..."}
                  {estimatedTime && ` (${estimatedTime})`}
                </Text>
                <Text style={styles.addressText}>{address}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptRequest}>
          <Text style={styles.acceptButtonText}>Accept Request & Start Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectButton}>
          <Text style={styles.rejectButtonText}>Cannot Donate This Time</Text>
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          Your information remains private until you accept the request.
        </Text>
      </View>
    </ScrollView>
  );
};

export default RequestDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  urgencyBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bloodTypeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  unitsText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
  },
  bloodTypeValue: {
    color: "#D30000",
    fontWeight: "700",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  navigateButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#D30000",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  navigateButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  hospitalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 14,
    color: "#2962FF",
    fontWeight: "500",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  loadingIndicator: {
    marginVertical: 8,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  acceptButton: {
    backgroundColor: "#D30000",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#D30000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  rejectButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  privacyText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 16,
  },
});