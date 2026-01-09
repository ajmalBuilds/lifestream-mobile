import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { WebView } from 'react-native-webview';
import Header from "@/components/common/Header";
import {
  Droplets,
  PlusSquare,
  MapPin,
  Navigation,
  Clock,
  User,
  ExternalLink,
} from "lucide-react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useLocationStore } from "@/store/locationStore";
import { locationService } from "@/services/locationService";
import { requestAPI } from "@/services/api";
import { formatRelativeTime } from "@/utils/timeUtils";
import { useAuth } from "@/contexts/AuthContext";

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
  ChatScreen: {
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

const { width } = Dimensions.get("window");

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
    longitude,
    isFromUserRequests,
  } = route.params;
  // const { user } = useAuth();
  const { currentLocation } = useLocationStore();
  const [address, setAddress] = useState<string>("");
  const [distance, setDistance] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isLoadingIfAlreadyResponded, setIsLoadingIfAlreadyResponded] = useState(true);
  const [hasResponded, setHasResponded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [requestResponses, setRequestResponses] = useState<any[]>([]);
  
  useEffect(() => {
    loadLocationData();
    checkIfAlreadyResponded();
    loadResponses();
  }, []);

  // Generate HTML for OpenStreetMap
  const generateMapHTML = () => {
    const userLocation = currentLocation ? {
      lat: currentLocation.latitude,
      lng: currentLocation.longitude
    } : null;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            * { margin: 0; padding: 0; }
            html, body, #map { 
              width: 100%; 
              height: 100%; 
              overflow: hidden;
            }
            .leaflet-marker-icon {
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: -apple-system, sans-serif;
            }
            .request-marker {
              background: #D30000;
              color: white;
              font-size: 14px;
              font-weight: bold;
            }
            .user-marker {
              background: #2196F3;
            }
            .leaflet-popup-content {
              font-family: -apple-system, sans-serif;
              min-width: 200px;
            }
            .popup-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
              color: #1f2937;
            }
            .popup-info {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map;
            
            function initMap() {
              // Initialize map centered on request location
              map = L.map('map', {
                zoomControl: false,
                attributionControl: true,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                dragging: false,
                tap: false,
                touchZoom: false,
                boxZoom: false,
                keyboard: false
              }).setView([${latitude}, ${longitude}], 15);
              
              // Add OpenStreetMap tiles
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
              }).addTo(map);
              
              // Add request marker
              const requestMarker = L.marker([${latitude}, ${longitude}], {
                icon: L.divIcon({
                  className: 'request-marker',
                  html: '<div style="width: 32px; height: 32px; background: #D30000; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; font-weight: bold;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg></div>',
                  iconSize: [38, 38],
                  iconAnchor: [19, 19]
                })
              }).addTo(map);
              
              requestMarker.bindPopup(
                '<div style="padding: 8px;">' +
                '<div class="popup-title">${hospital || "Hospital Location"}</div>' +
                '<div class="popup-info">Blood Request Location</div>' +
                '</div>'
              ).openPopup();
              
              // Add user marker if location is available
              ${userLocation ? `
                const userMarker = L.marker([${userLocation.lat}, ${userLocation.lng}], {
                  icon: L.divIcon({
                    className: 'user-marker',
                    html: '<div style="width: 24px; height: 24px; background: #2196F3; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                  })
                }).addTo(map);
                
                userMarker.bindPopup('<div style="padding: 8px;"><div class="popup-title">Your Location</div></div>');
                
                // Fit bounds to show both markers
                const bounds = L.latLngBounds(
                  [${latitude}, ${longitude}],
                  [${userLocation.lat}, ${userLocation.lng}]
                );
                map.fitBounds(bounds, { padding: [50, 50] });
              ` : ''}
              
              // Notify React Native that map is ready
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
            }
            
            // Initialize when page loads
            document.addEventListener('DOMContentLoaded', initMap);
          </script>
        </body>
      </html>
    `;
  };

  const checkIfAlreadyResponded = async () => {
    try{
      setIsLoadingIfAlreadyResponded(true);
      const response = await requestAPI.existingResponseOnArequest(requestId);
      if (response && (response.status === 200 || response.status === 201)) {
        const data = response.data.data;
       if(data.hasResponded) {
          setHasResponded(true);
          setIsLoadingIfAlreadyResponded(false);
        } else{
          setHasResponded(false);
          setIsLoadingIfAlreadyResponded(false);
        }
      }
    } catch (error) {
      console.error("Error checking existing response:", error);
    }
  };

  const loadLocationData = async () => {
    try {
      setIsLoadingAddress(true);

      // Get address from coordinates
      const locationAddress = await locationService.getAddressFromCoords(
        latitude,
        longitude
      );
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

  const loadResponses = async () => {
    try {
      const response = await requestAPI.getRequestResponses(requestId);
      if (response.status === 200 || response.status === 201) {
        const data = response.data.data;
        setRequestResponses(data.responses);
        console.log("Responses data:", data);
      }
    } catch (error) {
      console.error("Error loading responses:", error);
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

  const respondToRequest = async () => {
      try {
        const requestBody = {
          message: "I am available to donate blood.",
          available: true
        }
        const response = await requestAPI.respondToRequest(requestBody, requestId);
        if (response.status !== 200 && response.status !== 201) {
          throw new Error("Failed to accept the request.");
        }
        navigation.navigate("ChatScreen", {
          requestId,
          urgency,
          bloodType,
          patientName,
          unitsNeeded,
          createdAt,
          hospital,
          latitude,
          longitude,
          isFromUserRequests
        });
      } catch (error) {
        console.error(error);
      }
  };

  const handleAcceptRequest = () => {
      if(hasResponded || isFromUserRequests) {
        navigation.navigate("ChatScreen", {
          requestId,
          urgency,
          bloodType,
          patientName,
          unitsNeeded,
          createdAt,
          hospital,
          latitude,
          longitude,
          isFromUserRequests,
        });
      } else {
        Alert.alert(
          "Accept Request",
          "You are about to accept this blood request. You will be connected with the requester.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Accept",
              style: "default",
              onPress: respondToRequest
            },
          ]
        );
      }
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
            // Open in default maps app
            const url = Platform.select({
              ios: `maps://?q=${latitude},${longitude}&z=15`,
              android: `geo:${latitude},${longitude}?z=15&q=${latitude},${longitude}(${hospital || 'Hospital'})`,
            });
            
            if (url) {
              Linking.openURL(url).catch(() => {
                // Fallback to OpenStreetMap web
                Linking.openURL(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`);
              });
            } else {
              // Web fallback
              Linking.openURL(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`);
            }
          },
        },
      ]
    );
  };

  const handleOpenInBrowser = () => {
    const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
    Linking.openURL(url);
  };

  return (
    <>
      <Header title="Request Details" backgroundColor="#F8F6F6" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Request Card */}
        <View style={[styles.card]}>
          <View style={styles.cardTop}>
            <View
              style={[
                styles.circle,
                { backgroundColor: getUrgencyBackground() },
              ]}
            >
              <Droplets color={getUrgencyColor()} size={24} />
            </View>
            <View style={styles.urgencyContent}>
              <View
                style={[
                  styles.urgencyBadge,
                  { backgroundColor: getUrgencyColor() },
                ]}
              >
                <Text style={styles.urgencyBadgeText}>
                  {urgency?.toUpperCase() || "URGENT"}
                </Text>
              </View>
              <Text style={styles.bloodTypeTitle}>
                {getBloodTypeInAlphabetic()}
              </Text>
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
              <Text style={[styles.detailValue, styles.bloodTypeValue]}>
                {bloodType}
              </Text>
            </View>

            {createdAt && (
              <View style={styles.detailRow}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Requested:</Text>
                <Text style={styles.detailValue}>
                  {formatRelativeTime(createdAt)}
                </Text>
              </View>
            )}
          </View>
        </View>

        { isFromUserRequests && <View style={styles.card}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}>
            Connected Donors
          </Text>
          <View style={{ marginTop: 12, marginBottom: 12 }}>
            {requestResponses.length === 0 ? (
              <Text style={{ color: "#6B7280" }}>No donors connected yet.</Text>
            ) : (
              requestResponses.map((response) => (
                <View
                  key={response.id}
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#1F2937" }}>
                    {response.donor_name || "Anonymous Donor"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    {response.message}
                  </Text>
                </View>
              ))
            )}
          </View>
          <TouchableOpacity style={styles.acceptButton}><Text style={styles.acceptButtonText}>Confirm a Donor</Text></TouchableOpacity>
        </View>
}
        {/* Map Card with OpenStreetMap */}
        <View style={styles.card}>
          <View style={styles.mapHeader}>
            <MapPin size={20} color="#D30000" />
            <Text style={styles.mapTitle}>Request Location</Text>
            <TouchableOpacity 
              style={styles.externalLinkButton}
              onPress={handleOpenInBrowser}
            >
              <ExternalLink size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <WebView
              source={{ html: generateMapHTML() }}
              style={styles.map}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              onLoadEnd={() => setMapReady(true)}
              onMessage={() => {}} // Handle messages if needed
              renderLoading={() => (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator size="large" color="#D30000" />
                  <Text style={styles.mapLoadingText}>Loading map...</Text>
                </View>
              )}
              originWhitelist={['*']}
              mixedContentMode="always"
              setBuiltInZoomControls={false}
              setDisplayZoomControls={false}
              scrollEnabled={false}
            />

            <View style={styles.mapButtonsContainer}>
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={handleOpenInBrowser}
              >
                <Navigation size={16} color="#FFFFFF" />
                <Text style={styles.navigateButtonText}>Navigate</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.shareLocationButton}
                onPress={() => {
                  // Share location
                  Alert.alert("Share Location", "Location sharing feature");
                }}
              >
                <Text style={styles.shareLocationText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {!isLoadingAddress && address && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Address:</Text>
              <Text style={styles.addressText}>{address}</Text>
            </View>
          )}
        </View>

        {/* Hospital Details Card */}
        <View style={styles.card}>
          <View style={styles.hospitalHeader}>
            <View
              style={[
                styles.circle,
                { borderRadius: 12, backgroundColor: "#FBEAE8" },
              ]}
            >
              <PlusSquare size={24} color={"#D30000"} />
            </View>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{hospital}</Text>
              {isLoadingAddress ? (
                <ActivityIndicator
                  size="small"
                  color="#2962ff"
                  style={styles.loadingIndicator}
                />
              ) : (
                <>
                  <Text style={styles.distanceText}>
                    {distance > 0
                      ? `${distance.toFixed(1)} km away`
                      : "Calculating distance..."}
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
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptRequest}
          >
            <Text style={styles.acceptButtonText}>
              {isFromUserRequests ? 'Chat with Donors' : hasResponded ? 'Continue to Chat' : 'Accept Request & Start Chat'}
            </Text>
          </TouchableOpacity>

          {!isFromUserRequests && (
            <TouchableOpacity style={styles.rejectButton}>
              <Text style={styles.rejectButtonText}>Cannot Donate This Time</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.privacyText}>
            Your information remains private until you accept the request.
          </Text>
        </View>
      </ScrollView>
    </>
  );
};

export default RequestDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F6",
    paddingTop: 20,
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
    alignSelf: "flex-start",
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
    justifyContent: "space-between",
    marginBottom: 16,
  },
  externalLinkButton: {
    padding: 6,
    borderRadius: 6,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  mapButtonsContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  navigateButton: {
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
  shareLocationButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shareLocationText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
  addressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  addressLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
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