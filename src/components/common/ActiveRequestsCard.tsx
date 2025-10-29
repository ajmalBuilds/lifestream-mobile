// ActiveRequestsCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ActiveRequestsCardProps {
  urgency: "critical" | "high" | "medium" | "low";
  createdAt: string;
  bloodType: string;
  unitsNeeded: number;
  hospital: string;
  onPress?: () => void;
}

const ActiveRequestsCard: React.FC<ActiveRequestsCardProps> = ({
  urgency,
  createdAt,
  bloodType,
  unitsNeeded,
  hospital,
  onPress,
}) => {
  const getUrgencyColor = (): string => {
    const colors = {
      critical: "#dc2626",
      high: "#FF6E00",
      medium: "#F59E0B",
      low: "#65a30d",
    };
    return colors[urgency];
  };

  const getUrgencyLabel = (): string => {
    const labels = {
      critical: "CRITICAL",
      high: "HIGH",
      medium: "MEDIUM",
      low: "LOW",
    };
    return labels[urgency];
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, { borderLeftColor: getUrgencyColor() }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.urgencyBadge,
            { backgroundColor: `${getUrgencyColor()}15` },
          ]}
        >
          <Text style={[styles.urgencyText, { color: getUrgencyColor() }]}>
            {getUrgencyLabel()}
          </Text>
        </View>
        <Text style={styles.dateText}>{createdAt}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Blood Type</Text>
          <Text style={[styles.detailValue, styles.bloodTypeValue]}>
            {bloodType}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Units Needed</Text>
          <Text style={styles.detailValue}>{unitsNeeded}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hospital</Text>
          <Text style={[styles.detailValue, styles.hospitalValue]} numberOfLines={1}>
            {hospital}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: 260,
    minHeight: 160,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    marginRight: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginBottom: 12,
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  bloodTypeValue: {
    color: "#dc2626",
    fontSize: 16,
  },
  hospitalValue: {
    maxWidth: 140,
    textAlign: "right",
  },
});

export default ActiveRequestsCard;