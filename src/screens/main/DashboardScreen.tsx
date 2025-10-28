import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { StackNavigationProp } from '@react-navigation/stack';
import {
  History,
  MessageSquare,
  Plus,
  Search,
  User2,
} from "lucide-react-native";
import ActiveRequestsCard from "@/components/common/ActiveRequestsCard";
import RecentActivityCard from "@/components/common/RecentActivityCard";
import { useRoute } from "@react-navigation/native";

type RootStackParamList = {
  Main: undefined;
  CreateRequest: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Map: undefined;
  Profile: undefined;
};

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const quickActions = ["search", "history", "messages", "profile"];
  const router = useRoute();

  // const handleQuickAction = (action: string) => {
  //   let link: string;
  //   switch (action) {
  //     case "search":
  //       link = 'Map';
  //       break;
  //     case "history":
  //       link = 'Dashboard';
  //       break;
  //     case "messages":
  //       link = 'Dashboard';
  //       break;
  //     case "profile":
  //       link = 'Profile';
  //       break;
  //     default:
  //       link = '';
  //   }
  //   if (link) {
  //     navigation.navigate(link as keyof MainTabParamList);
  //   }
  // }
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.6} style={styles.btn1} onPress={() => navigation.navigate('CreateRequest')}>
          <Plus color={"white"} />
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
            Create New Request
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>Active Requests</Text>
        <ScrollView
          horizontal={true}
          style={{ marginBottom: 20, display: "flex", flexDirection: "row", paddingVertical: 5 }}

          showsHorizontalScrollIndicator={false}
        >
          <ActiveRequestsCard
            urgency="critical"
            createdAt="2 hrs ago"
            bloodType="A+"
            unitsNeeded={4}
            hospital="City Hospital"
          />
          <ActiveRequestsCard
            urgency="high"
            createdAt="2 hrs ago"
            bloodType="A+"
            unitsNeeded={4}
            hospital="City Hospital"
          />
          <ActiveRequestsCard
            urgency="medium"
            createdAt="2 hrs ago"
            bloodType="A+"
            unitsNeeded={4}
            hospital="City Hospital"
          />
          <ActiveRequestsCard
            urgency="low"
            createdAt="2 hrs ago"
            bloodType="A+"
            unitsNeeded={4}
            hospital="City Hospital"
          />
        </ScrollView>

        <View style={{ marginBottom: 20, paddingHorizontal: 5 , flexDirection: "row", display: "flex", justifyContent: "space-between" }}>
          {quickActions.map((action) => {
            let icon;
            let link: string;
            switch (action) {
              case "search":
                icon = <Search color="#023E8a" />;
                link = 'Map';
                break;
              case "history":
                icon = <History color="#023E8a" />;
                link = 'Dashboard';
                break;
              case "messages":
                icon = <MessageSquare color="#023E8a" />;
                link = 'Dashboard';
                break;
              case "profile":
                icon = <User2 color="#023E8a" />;
                link = 'Profile';
                break;
              default:
                icon = null;
            }
            return (
              <View key={action} style={{ display: "flex", flexDirection: 'column', justifyContent: 'center', alignItems: "center"}}>
              <TouchableOpacity
                key={action}
                style={styles.quickActionButton}
                onPress={() => {}}
              >
                {icon}
              </TouchableOpacity>
                <Text style={styles.quickActionText}>{action}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.title}>Recent Activity</Text>
        <View
          style={{
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <RecentActivityCard
            createdAt="2 min ago"
            id="997"
            type="success"
            message="Request for O+ fulfilled"
          />
          <RecentActivityCard
            createdAt="1 day ago"
            id="998"
            type="newDonorMatched"
            message="New donor matched for Request #5821"
          />
          <RecentActivityCard
            createdAt="2 days ago"
            id="999"
            type="scheduled"
            message="Donation scheduled with donor"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 22,
    fontWeight: 500,
    color: "#000",
    marginBottom: 20,
    textAlign: "left",
  },
  btn1: {
    marginBottom: 20,
    backgroundColor: "#2962ff",
    color: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    gap: 5,
    fontWeight: "600",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc2626",
  },
  emergencyButton: {
    backgroundColor: "#dc2626",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  emergencyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  quickActionButton: {
    backgroundColor: "#CAF0F8",
    width: 50,
    height: 50,
    borderRadius: '100%',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    color: '#000',
  },
  secondaryButton: {
    backgroundColor: "#1e40af",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreen;
