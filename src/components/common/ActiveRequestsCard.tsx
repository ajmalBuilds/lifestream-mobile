import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ActiveRequestsCardProps {
  urgency: 'critical' | 'high' | 'medium' | 'low';
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
  onPress 
}) => {
  const getUrgencyColor = () => {
    switch (urgency) {
      case 'critical': return '#dc2626';
      case 'high': return '#FF6E00';
      case 'medium': return '#ffe135';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      style={[styles.container, { borderLeftColor: getUrgencyColor() }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.urgencyText, { color: getUrgencyColor() }]}>
          {urgency.toUpperCase()}
        </Text>
        <Text style={styles.dateText}>{createdAt}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.detailText}>
          Blood Type: <Text style={styles.detailValue}>{bloodType}</Text>
        </Text>
        <Text style={styles.detailText}>
          Units Needed: <Text style={styles.detailValue}>{unitsNeeded}</Text>
        </Text>
        <Text style={styles.detailText}>
          Hospital: <Text style={styles.detailValue}>{hospital}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 140,
    width: 250,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 3,
    marginRight: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  urgencyText: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 14,
    color: "#6b7280",
  },
  details: {
    // Removed 'gap' for better compatibility
  },
  detailText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: "600",
    color: "#1f2937",
  },
});

export default ActiveRequestsCard;