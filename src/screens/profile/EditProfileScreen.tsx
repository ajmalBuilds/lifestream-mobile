import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import TwoStateToggleSwitch from "@/components/common/TwoStateToogleSwitch";
import Header from "@/components/common/Header";
import Dropdown from "@/components/common/Dropdown";
import { Droplets, MapPinPlusInside, Minus, Plus } from "lucide-react-native";
import { KeyboardAvoidingView } from "react-native";

export default function EditProfileScreen() {
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
      <Header title="Edit Profile" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          
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
    borderRadius: 12,
    display: "flex",
    flexDirection: "row",
    fontWeight: "600",
    justifyContent: "center",
    alignItems: "center",
  },
});
