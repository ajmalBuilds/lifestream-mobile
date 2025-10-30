import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import TwoStateToggleSwitch from "@/components/common/TwoStateToogleSwitch";
import Header from "@/components/common/Header";
import Dropdown from "@/components/common/Dropdown";
import {
  Droplets,
  MapPinPlusInside,
  Minus,
  Plus,
  MapPin,
  Navigation,
  AlertTriangle,
} from "lucide-react-native";
import { KeyboardAvoidingView } from "react-native";
import { locationService } from "@/services/locationService";
import { useAuthStore } from "@/store/authStore";
import { requestAPI } from "@/services/api";

export default function CreateRequestScreen() {
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState("Blood");
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null);
  const [units, setUnits] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const handleToggle = (option: string) => {
    setSelectedType(option);
  };

  const bloodTypeOptions = [
    { label: "A+", value: "A+", icon: <Droplets color="#dc2626" size={20} /> },
    { label: "A-", value: "A-", icon: <Droplets color="#dc2626" size={20} /> },
    { label: "B+", value: "B+", icon: <Droplets color="#dc2626" size={20} /> },
    { label: "B-", value: "B-", icon: <Droplets color="#dc2626" size={20} /> },
    { label: "O+", value: "O+", icon: <Droplets color="#dc2626" size={20} /> },
    { label: "O-", value: "O-", icon: <Droplets color="#dc2626" size={20} /> },
    {
      label: "AB+",
      value: "AB+",
      icon: <Droplets color="#dc2626" size={20} />,
    },
    {
      label: "AB-",
      value: "AB-",
      icon: <Droplets color="#dc2626" size={20} />,
    },
  ];

  const urgencyOptions = [
    { label: "Critical", value: "critical" },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ];
  const useCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const hasPermission = await locationService.requestPermissions();

      if (!hasPermission) {
        Alert.alert(
          "Location Permission Required",
          "LifeStream needs location access to automatically fill your address. Please enable location permissions.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Enable", onPress: () => locationService.openSettings() },
          ]
        );
        return;
      }

      const location = await locationService.getCurrentLocation();
      if (location) {
        const fullAddress = await locationService.getAddressFromCoords(
          location.latitude,
          location.longitude
        );

        setCurrentLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          address: fullAddress,
        });

        setAddress(fullAddress);
      } else {
        throw new Error("Could not get current location");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Error",
        "Failed to get current location. Please enter address manually."
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const validateForm = (): boolean => {
    if (!bloodType) {
      Alert.alert("Error", "Please select blood type");
      return false;
    }

    if (!patientName.trim()) {
      Alert.alert("Error", "Please enter patient name");
      return false;
    }

    if (
      !patientAge.trim() ||
      isNaN(Number(patientAge)) ||
      Number(patientAge) <= 0
    ) {
      Alert.alert("Error", "Please enter valid patient age");
      return false;
    }

    if (!hospitalName.trim()) {
      Alert.alert("Error", "Please enter hospital/clinic name");
      return false;
    }

    if (!address.trim()) {
      Alert.alert("Error", "Please enter address");
      return false;
    }

    if (!contactNumber.trim() || contactNumber.length < 10) {
      Alert.alert("Error", "Please enter valid contact number");
      return false;
    }

    if (units < 1) {
      Alert.alert("Error", "Please select at least 1 unit");
      return false;
    }

    return true;
  };

  const handleCreateRequest = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const requestData = {
        patientName: patientName.trim(),
        bloodType,
        unitsNeeded: units,
        hospital: hospitalName.trim(),
        urgency: urgency,
        location: currentLocation
          ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }
          : undefined,
        additionalNotes: additionalNote.trim(),
        patientAge: parseInt(patientAge),
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        createdBy: user?.id,
        requestType: selectedType.toLowerCase(),
      };
      console.log("Request Data:", requestData);
      const response = await requestAPI.createRequest(requestData);

      console.log("API Response:", response.data);

      // Simulate API call

      Alert.alert(
        "Success",
        "Blood request created successfully! Donors in your area will be notified.",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setBloodType(null);
              setUrgency(null);
              setUnits(1);
              setPatientName("");
              setPatientAge("");
              setHospitalName("");
              setAddress("");
              setContactNumber("");
              setAdditionalNote("");
              setCurrentLocation(null);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creating request:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header title="Create Request" backgroundColor="#ffffff" />
      <KeyboardAwareScrollView
        style={styles.container}
        showsVerticalScrollIndicator={true}
        extraScrollHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.heading}>Request Type</Text>
        <TwoStateToggleSwitch selected={selectedType} onToggle={handleToggle} />

        {/* Blood Type Dropdown */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Blood Type *</Text>
          <Dropdown
            options={bloodTypeOptions}
            selectedValue={bloodType}
            onSelect={setBloodType}
            placeholder="Select blood type"
            accentColor="#D30000"
          />
        </View>
        {/* Urgency Dropdown */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Urgency*</Text>
          <Dropdown
            options={urgencyOptions}
            selectedValue={urgency}
            onSelect={setUrgency}
            placeholder="Select urgency level"
            accentColor="#D30000"
          />
        </View>

        {/* Quantity Input & Label */}
        <View>
          <Text style={styles.label}>Quantity (Units) *</Text>
          <View style={styles.quantityInput}>
            <MapPinPlusInside
              color={"#2962ff"}
              style={{
                transform: [{ rotate: "180deg" }],
                width: 30,
                height: 30,
              }}
            />
            <View
              style={{
                marginLeft: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
              }}
            >
              <TouchableOpacity
                style={styles.circle}
                onPress={() => setUnits(units > 1 ? units - 1 : 1)}
                disabled={units <= 1}
              >
                <Minus
                  fontWeight={700}
                  style={{ width: 30, height: 30 }}
                  color={units <= 1 ? "#CCCCCC" : "#000000"}
                />
              </TouchableOpacity>
              <View style={{ minWidth: 45, alignItems: "center" }}>
                <Text style={{ fontSize: 26, fontWeight: "500" }}>{units}</Text>
              </View>
              <TouchableOpacity
                style={styles.circle}
                onPress={() => setUnits(units + 1)}
              >
                <Plus fontWeight={700} style={{ width: 30, height: 30 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.heading}>Patient Details</Text>

        <Text style={styles.label}>Patient Name *</Text>
        <TextInput
          placeholder="Enter patient name"
          style={styles.textInput}
          value={patientName}
          onChangeText={setPatientName}
        />

        <Text style={styles.label}>Patient Age *</Text>
        <TextInput
          placeholder="Enter patient age"
          value={patientAge}
          onChangeText={setPatientAge}
          style={styles.textInput}
          keyboardType="number-pad"
          maxLength={3}
        />

        <Text style={styles.heading}>Location & Contact</Text>

        <Text style={styles.label}>Hospital/Clinic Name *</Text>
        <TextInput
          placeholder="e.g City Hospital"
          style={styles.textInput}
          value={hospitalName}
          onChangeText={setHospitalName}
        />

        <Text style={styles.label}>Address *</Text>
        <View style={styles.locationHeader}>
          <Text style={styles.locationSubtitle}>
            Enter Location or use current Location
          </Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={useCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <ActivityIndicator size="small" color="#D30000" />
            ) : (
              <>
                <Navigation size={16} color="#D30000" />
                <Text style={styles.locationButtonText}>Use Current</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Enter full address with landmarks"
          value={address}
          onChangeText={setAddress}
          style={styles.textInput}
          multiline
          numberOfLines={2}
        />

        {currentLocation && (
          <View style={styles.locationInfo}>
            <MapPin size={14} color="#059669" />
            <Text style={styles.locationInfoText}>
              Location detected: {currentLocation.address.substring(0, 50)}...
            </Text>
          </View>
        )}

        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          placeholder="e.g +91 9879879870"
          style={styles.textInput}
          value={contactNumber}
          keyboardType="phone-pad"
          onChangeText={setContactNumber}
          maxLength={15}
        />

        <Text style={styles.label}>Additional Note (Optional)</Text>
        <TextInput
          placeholder="Add any specific instructions or patient context..."
          style={[styles.notes, { height: 100, textAlignVertical: "top" }]}
          numberOfLines={4}
          multiline={true}
          value={additionalNote}
          onChangeText={setAdditionalNote}
        />

        {/* Required Fields Notice */}
        <View style={styles.requiredNotice}>
          <AlertTriangle size={14} color="#d97706" />
          <Text style={styles.requiredNoticeText}>
            Fields marked with * are required
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.btn1, isLoading && styles.btnDisabled]}
          onPress={handleCreateRequest}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
              Create New Request
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    // paddingVertical: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  quantityInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 20,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eeeeee",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  notes: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  btn1: {
    marginBottom: 40,
    backgroundColor: "#D30000",
    color: "white",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    display: "flex",
    flexDirection: "row",
    fontWeight: "600",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  locationSubtitle: {
    fontSize: 14,
    color: "gray",
    flex: 1,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFE4E6",
    borderRadius: 8,
  },
  locationButtonText: {
    color: "#D30000",
    fontSize: 12,
    fontWeight: "600",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 20,
  },
  locationInfoText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
    flex: 1,
  },
  requiredNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  requiredNoticeText: {
    fontSize: 12,
    color: "#d97706",
    fontWeight: "500",
  },
});
