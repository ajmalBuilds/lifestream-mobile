import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMapStore, MapRequest } from '@/store/mapStore';
import { useLocationStore } from '@/store/locationStore';
import { requestAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime } from '@/utils/timeUtils';
import { 
  Filter, 
  Navigation, 
  MapPin, 
  Droplets, 
  Clock, 
  Phone,
  AlertTriangle,
  X,
  Target,
  Compass
} from 'lucide-react-native';

type MapScreenNavigationProp = StackNavigationProp<any, 'Map'>;

interface Props {
  navigation: MapScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const MapScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    requests, 
    selectedRequest, 
    isLoading, 
    filters,
    setRequests, 
    setSelectedRequest, 
    setLoading,
    updateFilters,
    clearFilters
  } = useMapStore();
  
  const { currentLocation } = useLocationStore();
  const { user } = useAuthStore();
  const webViewRef = useRef<WebView>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Generate HTML for OpenStreetMap
  const generateMapHTML = () => {
    const markers = requests.filter(request => {
      if (filters.bloodType && request.blood_type !== filters.bloodType) return false;
      if (filters.urgency && request.urgency !== filters.urgency) return false;
      return true;
    }).map(request => ({
      id: request.id,
      lat: request.latitude,
      lng: request.longitude,
      title: request.patient_name,
      bloodType: request.blood_type,
      urgency: request.urgency,
      color: getMarkerColor(request.urgency),
      hospital: request.hospital,
      units: request.units_needed,
      createdAt: request.created_at
    }));

    const userLocation = currentLocation ? {
      lat: currentLocation.latitude,
      lng: currentLocation.longitude
    } : { lat: 17.3841, lng: 78.4564 }; // Default to Hyderabad

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
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: white;
              font-weight: bold;
              font-family: -apple-system, sans-serif;
            }
            .leaflet-popup-content {
              font-family: -apple-system, sans-serif;
              min-width: 180px;
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
            .popup-urgency {
              color: #dc2626;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map;
            let userMarker;
            let requestMarkers = [];
            
            function initMap() {
              // Initialize map
              map = L.map('map', {
                zoomControl: false,
                attributionControl: true,
                scrollWheelZoom: false,
                doubleClickZoom: true,
                dragging: true,
                tap: false
              }).setView([${userLocation.lat}, ${userLocation.lng}], 13);
              
              // Add OpenStreetMap tiles
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
              }).addTo(map);
              
              // Add user location marker
              userMarker = L.marker([${userLocation.lat}, ${userLocation.lng}], {
                icon: L.divIcon({
                  className: 'user-marker',
                  html: '<div style="width: 20px; height: 20px; background: #2196F3; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })
              }).addTo(map);
              
              userMarker.bindPopup('<div class="popup-title">Your Location</div>');
              
              // Notify React Native that map is ready
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
            }
            
            function addMarkers(markersData) {
              // Clear existing markers
              requestMarkers.forEach(marker => map.removeLayer(marker));
              requestMarkers = [];
              
              // Add new markers
              markersData.forEach(marker => {
                const icon = L.divIcon({
                  className: 'request-marker',
                  html: '<div style="width: 28px; height: 28px; background: ' + marker.color + '; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; font-weight: bold;">' + 
                        marker.bloodType.replace(/[+-]/g, '') + '</div>',
                  iconSize: [32, 32],
                  iconAnchor: [16, 16]
                });
                
                const newMarker = L.marker([marker.lat, marker.lng], { icon: icon }).addTo(map);
                
                // Create popup content
                const popupContent = 
                  '<div style="padding: 8px;">' +
                  '<div class="popup-title">' + marker.title + '</div>' +
                  '<div class="popup-info"><strong>Blood Type:</strong> <span class="popup-urgency">' + marker.bloodType + '</span></div>' +
                  '<div class="popup-info"><strong>Urgency:</strong> ' + marker.urgency.charAt(0).toUpperCase() + marker.urgency.slice(1) + '</div>' +
                  '<div class="popup-info"><strong>Hospital:</strong> ' + marker.hospital + '</div>' +
                  '<div class="popup-info"><strong>Units:</strong> ' + marker.units + '</div>' +
                  '</div>';
                
                newMarker.bindPopup(popupContent);
                
                // Handle marker click
                newMarker.on('click', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerClick',
                    id: marker.id
                  }));
                });
                
                requestMarkers.push(newMarker);
              });
              
              // Fit bounds to show all markers if there are any
              if (requestMarkers.length > 0) {
                const markerGroup = new L.FeatureGroup(requestMarkers);
                map.fitBounds(markerGroup.getBounds().pad(0.1));
              }
            }
            
            function centerMap(lat, lng) {
              map.setView([lat, lng], 14);
              userMarker.setLatLng([lat, lng]);
            }
            
            // Initialize when page loads
            document.addEventListener('DOMContentLoaded', initMap);
            
            // Handle messages from React Native
            window.addEventListener('message', function(event) {
              try {
                const data = JSON.parse(event.data);
                switch(data.type) {
                  case 'centerMap':
                    if (data.lat && data.lng) {
                      centerMap(data.lat, data.lng);
                    }
                    break;
                  case 'updateMarkers':
                    if (data.markers) {
                      addMarkers(data.markers);
                    }
                    break;
                }
              } catch (error) {
                console.error('Error handling message:', error);
              }
            });
          </script>
        </body>
      </html>
    `;
  };

  // Fetch nearby requests
  const fetchNearbyRequests = async () => {
    if (!currentLocation) {
      Alert.alert('Location Required', 'Please enable location services to see nearby requests.');
      return;
    }

    setLoading(true);
    try {
      const response = await requestAPI.getNearbyRequests(
        currentLocation.latitude,
        currentLocation.longitude,
        filters.maxDistance,
      );

      const mappedRequests: MapRequest[] = response.data.data.requests.map((req: any) => ({
        ...req,
        latitude: req.latitude || req.lat,
        longitude: req.longitude || req.lng,
      }));
      
      setRequests(mappedRequests);
      
      // Update WebView markers
      updateWebViewMarkers(mappedRequests);

    } catch (error) {
      console.error('Error fetching map requests:', error);
      Alert.alert('Error', 'Failed to load nearby requests.');
    } finally {
      setLoading(false);
    }
  };

  // Center map on user location
  const centerOnUserLocation = () => {
    if (currentLocation && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'centerMap',
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      }));
    }
  };

  // Update WebView with filtered markers
  const updateWebViewMarkers = (requestsList: MapRequest[]) => {
    if (!webViewRef.current || !mapReady) return;

    const filteredMarkers = requestsList.filter(request => {
      if (filters.bloodType && request.blood_type !== filters.bloodType) return false;
      if (filters.urgency && request.urgency !== filters.urgency) return false;
      return true;
    }).map(request => ({
      id: request.id,
      lat: request.latitude,
      lng: request.longitude,
      title: request.patient_name,
      bloodType: request.blood_type,
      urgency: request.urgency,
      color: getMarkerColor(request.urgency),
      hospital: request.hospital,
      units: request.units_needed,
      createdAt: request.created_at
    }));

    webViewRef.current.postMessage(JSON.stringify({
      type: 'updateMarkers',
      markers: filteredMarkers
    }));
  };

  // Handle marker click from WebView
  const handleMarkerClick = (requestId: number) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
    }
  };

  // Handle WebView messages
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch(data.type) {
        case 'mapReady':
          setMapReady(true);
          // Initial markers update
          updateWebViewMarkers(requests);
          break;
        
        case 'markerClick':
          handleMarkerClick(data.id);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Get marker color based on urgency
  const getMarkerColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  // Fetch requests on mount and when filters change
  useEffect(() => {
    fetchNearbyRequests();
  }, [currentLocation, filters]);

  // Update WebView markers when requests or filters change
  useEffect(() => {
    if (mapReady && requests.length > 0) {
      updateWebViewMarkers(requests);
    }
  }, [requests, filters, mapReady]);

  return (
    <View style={styles.container}>
      {/* WebView Map */}
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={handleWebViewMessage}
        onLoadEnd={() => setMapReady(true)}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#D30000" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        originWhitelist={['*']}
        mixedContentMode="always"
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingRequestsOverlay}>
          <ActivityIndicator size="large" color="#D30000" />
          <Text style={styles.loadingText}>Loading nearby requests...</Text>
        </View>
      )}

      {/* Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={centerOnUserLocation}
          disabled={!currentLocation}
        >
          <Target size={20} color={currentLocation ? "#374151" : "#9ca3af"} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersContent} nestedScrollEnabled={true}>
            {/* Blood Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Blood Type</Text>
              <View style={styles.filterOptions}>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', null].map((type) => (
                  <TouchableOpacity
                    key={type || 'all'}
                    style={[
                      styles.filterOption,
                      filters.bloodType === type && styles.filterOptionActive,
                    ]}
                    onPress={() => updateFilters({ bloodType: type })}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.bloodType === type && styles.filterOptionTextActive,
                    ]}>
                      {type || 'All Types'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Urgency Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Urgency</Text>
              <View style={styles.filterOptions}>
                {['critical', 'high', 'medium', 'low', null].map((urgency) => (
                  <TouchableOpacity
                    key={urgency || 'all'}
                    style={[
                      styles.filterOption,
                      filters.urgency === urgency && styles.filterOptionActive,
                    ]}
                    onPress={() => updateFilters({ urgency })}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.urgency === urgency && styles.filterOptionTextActive,
                    ]}>
                      {urgency ? getUrgencyText(urgency) : 'All'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>
                Max Distance: {filters.maxDistance} km
              </Text>
              <View style={styles.sliderContainer}>
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.distanceOptions}
                >
                  {[5, 10, 25, 50, 100].map((distance) => (
                    <TouchableOpacity
                      key={distance}
                      style={[
                        styles.distanceOption,
                        filters.maxDistance === distance && styles.distanceOptionActive,
                      ]}
                      onPress={() => updateFilters({ maxDistance: distance })}
                    >
                      <Text style={[
                        styles.distanceOptionText,
                        filters.maxDistance === distance && styles.distanceOptionTextActive,
                      ]}>
                        {distance}km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Clear Filters */}
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={() => {
                clearFilters();
                setShowFilters(false);
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Selected Request Details */}
      {selectedRequest && (
        <View style={styles.requestDetails}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedRequest(null)}
          >
            <X size={20} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.patientName}>{selectedRequest.patient_name}</Text>
          
          <View style={[styles.urgencyBadge, { backgroundColor: getMarkerColor(selectedRequest.urgency) }]}>
            <AlertTriangle size={14} color="white" />
            <Text style={styles.urgencyText}>
              {getUrgencyText(selectedRequest.urgency)} Urgency
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Droplets size={16} color="#dc2626" />
              <Text style={styles.detailText}>{selectedRequest.blood_type}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.detailText}>{selectedRequest.hospital}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.detailText}>
                {formatRelativeTime(selectedRequest.created_at)}
              </Text>
            </View>
          </View>

          <Text style={styles.unitsText}>
            {selectedRequest.units_needed} unit{selectedRequest.units_needed > 1 ? 's' : ''} needed
          </Text>

          {selectedRequest.distance && (
            <Text style={styles.distanceText}>
              {selectedRequest.distance.toFixed(1)} km away
            </Text>
          )}

          <View style={styles.actionButtons}>
            {selectedRequest.contact_number && (
              <TouchableOpacity 
                style={styles.callButton}
                onPress={() => {
                  // Implement phone call
                  if (Platform.OS !== 'web') {
                    // Use Linking.openURL(`tel:${selectedRequest.contact_number}`)
                  }
                }}
              >
                <Phone size={16} color="white" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => {
                // Open in maps app
                const url = Platform.select({
                  ios: `maps://?daddr=${selectedRequest.latitude},${selectedRequest.longitude}`,
                  android: `google.navigation:q=${selectedRequest.latitude},${selectedRequest.longitude}`,
                });
                // Use Linking.openURL(url)
              }}
            >
              <Navigation size={16} color="#D30000" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Requests Counter */}
      <View style={styles.requestsCounter}>
        <Text style={styles.requestsCounterText}>
          {requests.filter(r => {
            if (filters.bloodType && r.blood_type !== filters.bloodType) return false;
            if (filters.urgency && r.urgency !== filters.urgency) return false;
            return true;
          }).length} request{requests.length !== 1 ? 's' : ''} nearby
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingRequestsOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  headerControls: {
    position: 'absolute',
    top: 50,
    right: 16,
    gap: 12,
    zIndex: 100,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersPanel: {
    position: 'absolute',
    top: 110,
    right: 16,
    width: 280,
    maxHeight: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    padding: 16,
    zIndex: 100,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filtersContent: {
    maxHeight: 300,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  filterOptionActive: {
    backgroundColor: '#D30000',
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  distanceOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  distanceOptionActive: {
    backgroundColor: '#D30000',
  },
  distanceOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  distanceOptionTextActive: {
    color: 'white',
  },
  clearFiltersButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  requestDetails: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    paddingRight: 30,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  unitsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D30000',
    padding: 12,
    borderRadius: 8,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D30000',
    padding: 12,
    borderRadius: 8,
  },
  directionsButtonText: {
    color: '#D30000',
    fontSize: 14,
    fontWeight: '600',
  },
  requestsCounter: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
  },
  requestsCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

export default MapScreen;