import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity } from '@/store/activityStore';
import { formatRelativeTime } from '@/utils/timeUtils';
import { 
  Bell, 
  CheckCircle, 
  MapPin, 
  MessageCircle, 
  User,
  Calendar,
  Droplets,
  Shield
} from 'lucide-react-native';

interface RecentActivityCardProps {
  activity: Activity;
  onPress?: (activity: Activity) => void;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activity, onPress }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'request_created':
        return <Bell size={20} color="#2962ff" />;
      case 'request_fulfilled':
        return <CheckCircle size={20} color="#059669" />;
      case 'donor_matched':
        return <User size={20} color="#d97706" />;
      case 'donation_scheduled':
        return <Calendar size={20} color="#7c3aed" />;
      case 'donation_completed':
        return <Droplets size={20} color="#dc2626" />;
      case 'message_received':
        return <MessageCircle size={20} color="#2563eb" />;
      case 'profile_updated':
        return <Shield size={20} color="#6b7280" />;
      case 'location_shared':
        return <MapPin size={20} color="#ea580c" />;
      default:
        return <Bell size={20} color="#6b7280" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'request_fulfilled':
      case 'donation_completed':
        return '#059669'; // Green for success
      case 'donor_matched':
      case 'donation_scheduled':
        return '#d97706'; // Orange for matches
      case 'request_created':
        return '#2962ff'; // Blue for requests
      case 'message_received':
        return '#2563eb'; // Blue for messages
      default:
        return '#6b7280'; // Gray for others
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !activity.read && styles.unreadContainer,
        onPress && styles.pressable
      ]}
      onPress={() => onPress?.(activity)}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getActivityIcon(activity.type)}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.message}>{activity.message}</Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(activity.timestamp)}
          </Text>
        </View>

        {!activity.read && (
          <View style={[styles.unreadDot, { backgroundColor: getActivityColor(activity.type) }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  unreadContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#2962ff',
  },
  pressable: {

  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
});

export default RecentActivityCard;