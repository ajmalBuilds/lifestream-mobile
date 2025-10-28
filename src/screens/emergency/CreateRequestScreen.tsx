import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import TwoStateToggleSwitch from "@/components/common/TwoStateToogleSwitch";
import Header from "@/components/common/Header";
import Dropdown from "@/components/common/Dropdown";
import {
  Droplets,
  Heart,
  Zap,
  Users,
  MapPinPlusInside,
  Minus,
  Plus,
} from "lucide-react-native";
import { KeyboardAvoidingView } from "react-native";

export default function CreateRequestScreen() {
  const [selectedType, setSelectedType] = useState("Blood");
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [units, setUnits] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");
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

  return (
    <>
      <Header title="Create Request" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
      >
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100}>
          <Text style={styles.heading}>Request Type</Text>
          <TwoStateToggleSwitch selected={selectedType} onToggle={handleToggle} />

          {/* Blood Type Dropdown */}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Blood Type</Text>
            <Dropdown
              options={bloodTypeOptions}
              selectedValue={bloodType}
              onSelect={setBloodType}
              placeholder="Select blood type"
              accentColor="#D30000"
            />
          </View>

          {/* Quantity Input & Label */}
          <View>
            <Text style={styles.label}>Quantity (Units)</Text>
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
                >
                  <Minus fontWeight={700} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
                <View style={{ minWidth: 45, alignItems: "center" }}>
                  <Text style={{ fontSize: 26, fontWeight: "500" }}>
                    {units}
                  </Text>
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

          <Text style={styles.label}>Patient Name</Text>
          <TextInput
            placeholder="Enter patient name"
            style={styles.textInput}
            value={patientName}
            onChangeText={setPatientName}
          />

          <Text style={styles.label}>Patient Age</Text>
          <TextInput
            placeholder="Enter patient name"
            value={patientAge}
            onChangeText={setPatientAge}
            style={styles.textInput}
            keyboardType="number-pad"
          />
          <Text style={styles.heading}>Location & Contact</Text>

          <Text style={styles.label}>Hospital/Clinic Name</Text>
          <TextInput
            placeholder="e.g City Hospital"
            style={styles.textInput}
            value={hospitalName}
            onChangeText={setHospitalName}
          />

          <Text style={styles.label}>Address</Text>
          <Text style={{ fontSize: 16, color: "gray", marginBottom: 5 }}>
            Enter Location or use current Location
          </Text>
          <TextInput
            placeholder="Enter Address"
            value={address}
            onChangeText={setAddress}
            style={styles.textInput}
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            placeholder="e.g +91 9879879870"
            style={styles.textInput}
            value={contactNumber}
            keyboardType="phone-pad"
            numberOfLines={1}
            onChangeText={setContactNumber}
          />

          <Text style={styles.label}>Additional Note(Optional)</Text>
          <TextInput
            placeholder="Add any specific instructions or patient context..."
            style={[styles.notes, { height: 100, textAlignVertical: "top" }]}
            numberOfLines={4}
            multiline={true}
            value={additionalNote}
            onChangeText={setAdditionalNote}
          />

          <TouchableOpacity activeOpacity={0.6} style={styles.btn1}>
            <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
              Create New Request
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 10,
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
    borderRadius: "50%",
    backgroundColor: "#eeeeee",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 18,
  },
  notes: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 18,
  },
  btn1: {
    marginBottom: 100,
    backgroundColor: "#D30000",
    color: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    display: "flex",
    flexDirection: "row",
    fontWeight: "600",
    justifyContent: "center",
    alignItems: "center",
  },
});
