import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

const ActiveRequestsCardSkeleton: React.FC = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Urgency Badge Skeleton */}
        <Animated.View
          style={[styles.urgencyBadgeSkeleton, { opacity }]}
        />
        {/* Date Text Skeleton */}
        <Animated.View
          style={[styles.dateTextSkeleton, { opacity }]}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Details Section */}
      <View style={styles.details}>
        {/* Blood Type Row */}
        <View style={styles.detailRow}>
          <Animated.View
            style={[styles.labelSkeleton, { opacity }]}
          />
          <Animated.View
            style={[styles.valueSkeleton, { width: 50 }, { opacity }]}
          />
        </View>

        {/* Units Needed Row */}
        <View style={styles.detailRow}>
          <Animated.View
            style={[styles.labelSkeleton, { opacity }]}
          />
          <Animated.View
            style={[styles.valueSkeleton, { width: 30 }, { opacity }]}
          />
        </View>

        {/* Hospital Row */}
        <View style={styles.detailRow}>
          <Animated.View
            style={[styles.labelSkeleton, { opacity }]}
          />
          <Animated.View
            style={[styles.valueSkeleton, { width: 100 }, { opacity }]}
          />
        </View>
      </View>
    </View>
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
    borderLeftColor: "#e5e7eb",
    marginRight: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  urgencyBadgeSkeleton: {
    width: 80,
    height: 24,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
  dateTextSkeleton: {
    width: 60,
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
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
  labelSkeleton: {
    width: 80,
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  valueSkeleton: {
    height: 18,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
});

export default ActiveRequestsCardSkeleton;