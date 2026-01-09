import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { useRelativeTime } from "@/hooks/useRelativeTime";
import {
  ChevronRight,
  CircleCheckBig,
  Timer,
  Clock,
  CheckCircle2,
  MessageSquare,
  Droplet,
  MapPin,
} from "lucide-react-native";

interface UserRequestsCardProps {
  status: string;
  bloodType: string;
  patientName: string;
  hospital: string;
  createdAt: string;
  onPress?: () => void;
}

const UserRequestsCard: React.FC<UserRequestsCardProps> = ({
  status,
  bloodType,
  patientName,
  hospital,
  createdAt,
  onPress,
}) => {
  const relativeTime = useRelativeTime(createdAt, 30000);

  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return {
          gradient: ["#fbbf24", "#f59e0b"] as const,
          bgColor: "#fef3c7",
          textColor: "#d97706",
          icon: <Timer size={20} color="#d97706" strokeWidth={2.5} />,
          label: "Active",
        };
      case "fulfilled":
        return {
          gradient: ["#34d399", "#10b981"] as const,
          bgColor: "#d1fae5",
          textColor: "#059669",
          icon: <CircleCheckBig size={20} color="#059669" strokeWidth={2.5} />,
          label: "Fulfilled",
        };
      case "pending":
        return {
          gradient: ["#60a5fa", "#3b82f6"] as const,
          bgColor: "#dbeafe",
          textColor: "#2563eb",
          icon: <Clock size={20} color="#2563eb" strokeWidth={2.5} />,
          label: "Pending",
        };
      case "accepted":
        return {
          gradient: ["#a78bfa", "#8b5cf6"] as const,
          bgColor: "#ede9fe",
          textColor: "#7c3aed",
          icon: <CheckCircle2 size={20} color="#7c3aed" strokeWidth={2.5} />,
          label: "Accepted",
        };
      case "responded":
        return {
          gradient: ["#fb923c", "#f97316"] as const,
          bgColor: "#fed7aa",
          textColor: "#ea580c",
          icon: <MessageSquare size={20} color="#ea580c" strokeWidth={2.5} />,
          label: "Responded",
        };
      default:
        return {
          gradient: ["#9ca3af", "#6b7280"] as const,
          bgColor: "#f3f4f6",
          textColor: "#4b5563",
          icon: <Timer size={20} color="#4b5563" strokeWidth={2.5} />,
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top Section with Status */}
      <View style={styles.topSection}>
        <View style={styles.leftContent}>
          {/* Status Icon with Gradient */}
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            {config.icon}
          </LinearGradient>

          {/* Blood Type and Patient Info */}
          <View style={styles.infoContainer}>
            <View style={styles.bloodTypeRow}>
              <Droplet size={16} color="#dc2626" fill="#dc2626" />
              <Text style={styles.bloodTypeText}>{bloodType}</Text>
              <View style={styles.separator} />
              <Text style={styles.bloodLabel}>Blood</Text>
            </View>
            <View style={styles.patientRow}>
              <Text style={styles.patientLabel}>Patient:</Text>
              <Text style={styles.patientName} numberOfLines={1}>
                {patientName.slice(0, 20)}
                {patientName.length > 20 ? "..." : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
          <View style={[styles.statusDot, { backgroundColor: config.textColor }]} />
          <Text style={[styles.statusText, { color: config.textColor }]}>
            {config.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Bottom Section with Location and Time */}
      <View style={styles.bottomSection}>
        <View style={styles.detailsRow}>
          <View style={styles.locationContainer}>
            <View style={styles.locationIconWrapper}>
              <MapPin size={14} color="#64748b" />
            </View>
            <Text style={styles.hospitalText} numberOfLines={1}>
              {hospital}
            </Text>
          </View>
          <View style={styles.timeContainer}>
            <View style={styles.timeDot} />
            <Text style={styles.timeText}>{relativeTime}</Text>
          </View>
        </View>
        
        {/* Action Indicator */}
        <View style={styles.actionIndicator}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <View style={styles.arrowContainer}>
            <ChevronRight size={18} color="#64748b" strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    gap: 6,
  },
  bloodTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bloodTypeText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  bloodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  patientLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  patientName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 16,
  },
  bottomSection: {
    padding: 16,
    paddingTop: 12,
    gap: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  locationIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  hospitalText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    flex: 1,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  timeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#94a3b8",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  actionIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4f46e5",
    letterSpacing: 0.2,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserRequestsCard;