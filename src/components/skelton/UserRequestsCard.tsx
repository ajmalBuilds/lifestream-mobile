import {
    View,
    StyleSheet,
    Animated,
    Easing,
  } from "react-native";
  import React, { useEffect, useRef } from "react";
  
  const UserRequestsCardSkeleton: React.FC = () => {
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
        {/* Top */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 15 }}>
            {/* Icon Circle Skeleton */}
            <Animated.View
              style={[
                styles.iconCircle,
                styles.skeleton,
                { opacity },
              ]}
            />
            
            {/* Text Content Skeleton */}
            <View style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Animated.View
                style={[
                  styles.skeletonText,
                  { width: 100, height: 16 },
                  { opacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.skeletonText,
                  { width: 130, height: 14 },
                  { opacity },
                ]}
              />
            </View>
            
            {/* Status Badge Skeleton */}
            <Animated.View
              style={[
                styles.statusBadgeSkeleton,
                { opacity },
              ]}
            />
          </View>
        </View>
  
        {/* Bottom */}
        <View
          style={{
            paddingVertical: 15,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
            <Animated.View
              style={[
                styles.skeletonText,
                { width: 120, height: 14 },
                { opacity },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonText,
                { width: 80, height: 14 },
                { opacity },
              ]}
            />
          </View>
          
          {/* Chevron Skeleton */}
          <Animated.View
            style={[
              styles.chevronSkeleton,
              { opacity },
            ]}
          />
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      display: "flex",
      flexDirection: "column",
      width: "90%",
      paddingVertical: 15,
      paddingHorizontal: 15,
      backgroundColor: "#ffffff",
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    skeleton: {
      backgroundColor: "#e5e7eb",
    },
    skeletonText: {
      backgroundColor: "#e5e7eb",
      borderRadius: 4,
    },
    statusBadgeSkeleton: {
      width: 70,
      height: 28,
      backgroundColor: "#e5e7eb",
      borderRadius: 20,
    },
    chevronSkeleton: {
      width: 26,
      height: 26,
      backgroundColor: "#e5e7eb",
      borderRadius: 4,
    },
  });
  
  export default UserRequestsCardSkeleton;