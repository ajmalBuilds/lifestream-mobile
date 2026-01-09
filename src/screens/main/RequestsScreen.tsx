import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { requestAPI } from "@/services/api";
import { SearchIcon } from "lucide-react-native";
import UserRequestsCard from "@/components/common/UserRequestsCard";
import UserRequestsCardSkeleton from "@/components/skelton/UserRequestsCard";

type MainTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Profile: undefined;
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
    isFromUserRequests?: boolean;
  };
};

type RequestsScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  "Requests"
>;

interface Props {
  navigation: RequestsScreenNavigationProp;
}

const RequestsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filerCategories = ["All", "Active", "Pending", "Accepted", "Responded"];
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    setLoading(true);
    try {
      const response = await requestAPI.userRequests();
      const requests = response.data.data.requests;
      setUserRequests(requests);
      console.log("User Requests :", requests);
      setFilteredRequests(requests);
    } catch (error) {
      console.error("Error fetching user requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPress = (category: string) => {
    setSelectedFilter(category);
  };

  useEffect(() => {
    if (selectedFilter === "All") {
      setFilteredRequests(userRequests);
    } else {
      const filter = userRequests.filter(
        (request: any) =>
          request.status.toLowerCase() === selectedFilter.toLowerCase()
      );
      setFilteredRequests(filter);
    }
  }, [selectedFilter, userRequests]);

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
      isFromUserRequests: true,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <SearchIcon size={24} color="#000" />
          <TextInput
            placeholder="Search by patient or Id"
            style={styles.searchBoxInput}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
      >
        {filerCategories.map((category, index) => {
          const isSelected = category === selectedFilter;
          return (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: isSelected ? "#2962ff" : "#ffffff",
                paddingHorizontal: 10,
                borderRadius: 10,
                marginRight: 10,
                height: 35,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => handleFilterPress(category)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: isSelected ? "#fff" : "#000",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 10, display: "flex", width: "100%" }}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
          paddingBottom: 180,
          paddingTop: 10,
          paddingHorizontal: 10,
        }}
      >
        {loading ? (
          <>
            <UserRequestsCardSkeleton />
            <UserRequestsCardSkeleton />
            <UserRequestsCardSkeleton />
          </>
        ) : filteredRequests.length === 0 ? (
          <View
            style={{
              width: "100%",
              minHeight: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>
              No {selectedFilter} request
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
            <UserRequestsCard
              key={request.id}
              status={request.status}
              bloodType={request.blood_type}
              createdAt={request.created_at}
              hospital={request.hospital}
              patientName={request.patient_name}
              onPress={() => handleRequestPress(request)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#F8F6F6",
  },
  searchContainer: {
    flexDirection: "row",
    width: "100%",
    height: 50,
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 15,
    width: "95%",
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchBoxInput: {
    fontSize: 16,
    marginLeft: 10,
  },
  filterBar: {
    marginTop: 0,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
});

export default RequestsScreen;