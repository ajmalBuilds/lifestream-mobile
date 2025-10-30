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
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMapStore, MapRequest } from '@/store/mapStore';
import { useLocationStore } from '@/store/locationStore';
import { mapAPI, requestAPI } from '@/services/api';
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
  X
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
    mapRegion, 
    isLoading, 
    filters,
    setRequests, 
    setSelectedRequest, 
    setMapRegion, 
    setLoading,
    updateFilters 
  } = useMapStore();
  
  const { currentLocation } = useLocationStore();
  const { user } = useAuthStore();
  const mapRef = useRef<MapView>(null);
  const [showFilters, setShowFilters] = useState(false);

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

      // Transform the response to include coordinates
      const mappedRequests: MapRequest[] = response.data.data.requests.map((req: any) => ({
        ...req,
        latitude: req.latitude || req.lat,
        longitude: req.longitude || req.lng,
      }));
      setRequests(mappedRequests);

      // Center map on user location if no region is set
      if (requests.length === 0) {
        setMapRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error('Error fetching map requests:', error);
      Alert.alert('Error', 'Failed to load nearby requests.');
    } finally {
      setLoading(false);
    }
  };

  // Center map on user location
  const centerOnUserLocation = () => {
    if (currentLocation && mapRef.current) {
      const region: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // Handle marker press
  const handleMarkerPress = (request: MapRequest) => {
    setSelectedRequest(request);
  };

  // Filter requests based on active filters
  const filteredRequests = requests.filter(request => {
    if (filters.bloodType && request.blood_type !== filters.bloodType) {
      return false;
    }
    if (filters.urgency && request.urgency !== filters.urgency) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    fetchNearbyRequests();
  }, [currentLocation, filters]);

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

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={setMapRegion}
      >
        {/* User Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            description="You are here"
            pinColor="#2196F3"
          />
        )}

        {/* Request Markers */}
        {filteredRequests.map((request) => (
          <Marker
            key={request.id}
            coordinate={{
              latitude: request.latitude,
              longitude: request.longitude,
            }}
            onPress={() => handleMarkerPress(request)}
            pinColor={getMarkerColor(request.urgency)}
          />
        ))}
      </MapView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D30000" />
          <Text style={styles.loadingText}>Loading nearby requests...</Text>
        </View>
      )}

      {/* Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={centerOnUserLocation}
        >
          <Navigation size={20} color="#374151" />
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

            {/* Urgency Filter */}
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

            {/* Distance Filter */}
            <Text style={styles.filterLabel}>
              Distance: {filters.maxDistance} km
            </Text>
            <View style={styles.sliderContainer}>
              <ScrollView 
                horizontal
                nestedScrollEnabled={true}
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

            {/* Clear Filters */}
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={() => {
                useMapStore.getState().clearFilters();
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
          
          <View style={styles.urgencyBadge}>
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
            <TouchableOpacity style={styles.callButton}>
              <Phone size={16} color="white" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.directionsButton}>
              <Navigation size={16} color="#D30000" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Requests Counter */}
      <View style={styles.requestsCounter}>
        <Text style={styles.requestsCounterText}>
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} nearby
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
  },
  headerControls: {
    position: 'absolute',
    top: 50,
    right: 16,
    gap: 12,
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
    gap: 8,
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'nowrap',
    justifyContent: 'center',
    height: 30
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
  distanceLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  clearFiltersButton: {
    marginTop: 16,
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
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
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
  },
  requestsCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

export default MapScreen;