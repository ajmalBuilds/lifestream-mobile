import { CircleCheck, Timer, UserPlus, UserPlus2 } from "lucide-react-native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface RecentActivityCardProps {
  id: string;
  createdAt: string;
  type: "success" | "newDonorMatched" | "scheduled";
  message: string;
  onPress?: () => void;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  id,
  createdAt,
  type,
  message,
  onPress,
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#CCE7C9";
      case "newDonorMatched":
        return "#CAF0F8";
      case "scheduled":
        return "#CAF0F8";
      default:
        return "#90ee90";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#32cd32";//00FF00
      case "newDonorMatched":
        return "#023E8a";
      case "scheduled":
        return "#023E8a";
      default:
        return "#32cd32";
    }
  };
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CircleCheck color={getIconColor()} style={styles.icon} />;
      case "newDonorMatched":
        return <UserPlus2 color={getIconColor()} style={styles.icon}  />;
      case "scheduled":
        return <Timer color={getIconColor()} style={styles.icon}  />;
      default:
        return <CircleCheck color={getIconColor()} style={styles.icon}  />;
    }
  };
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 15,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[styles.iconBadge, { backgroundColor: getBackgroundColor() }]}
      >
        {getIcon()}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{message}</Text>
        <Text style={{ color: "gray" }}>{createdAt}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  iconBadge: {
    width: 45,
    height: 45,
    borderRadius: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {},
});

export default RecentActivityCard;
