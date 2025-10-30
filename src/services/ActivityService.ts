import { useActivityStore, ActivityType } from '@/store/activityStore';

export class ActivityService {
  private static instance: ActivityService;

  static getInstance(): ActivityService {
    if (!ActivityService.instance) {
      ActivityService.instance = new ActivityService();
    }
    return ActivityService.instance;
  }

  // Activity creators for different events
  requestCreated(requestData: {
    requestId: string;
    bloodType: string;
    units: number;
    hospital: string;
  }) {
    useActivityStore.getState().addActivity({
      type: 'request_created',
      title: 'Request Created',
      message: `Your request for ${requestData.bloodType} (${requestData.units} units) at ${requestData.hospital} has been published`,
      metadata: requestData,
    });
  }

  requestFulfilled(requestData: {
    requestId: string;
    bloodType: string;
    units: number;
    donorName: string;
  }) {
    useActivityStore.getState().addActivity({
      type: 'request_fulfilled',
      title: 'Request Fulfilled! 🎉',
      message: `Your request for ${requestData.bloodType} has been fulfilled by ${requestData.donorName}`,
      metadata: requestData,
    });
  }

  donorMatched(requestData: {
    requestId: string;
    bloodType: string;
    donorName: string;
    distance: number;
  }) {
    useActivityStore.getState().addActivity({
      type: 'donor_matched',
      title: 'Donor Matched',
      message: `${requestData.donorName} is available to donate ${requestData.bloodType} (${requestData.distance.toFixed(1)}km away)`,
      metadata: requestData,
    });
  }

  donationScheduled(appointmentData: {
    requestId: string;
    donorName: string;
    hospital: string;
    scheduledTime: string;
  }) {
    useActivityStore.getState().addActivity({
      type: 'donation_scheduled',
      title: 'Donation Scheduled',
      message: `Donation scheduled with ${appointmentData.donorName} at ${appointmentData.hospital}`,
      metadata: appointmentData,
    });
  }

  donationCompleted(donationData: {
    requestId: string;
    donorName: string;
    units: number;
  }) {
    useActivityStore.getState().addActivity({
      type: 'donation_completed',
      title: 'Donation Completed',
      message: `${donationData.donorName} successfully donated ${donationData.units} units`,
      metadata: donationData,
    });
  }

  messageReceived(messageData: {
    fromUser: string;
    message: string;
    requestId?: string;
  }) {
    useActivityStore.getState().addActivity({
      type: 'message_received',
      title: 'New Message',
      message: `New message from ${messageData.fromUser}: ${messageData.message}`,
      metadata: messageData,
    });
  }

  profileUpdated(updateData: {
    field: string;
    oldValue?: string;
    newValue: string;
  }) {
    useActivityStore.getState().addActivity({
      type: 'profile_updated',
      title: 'Profile Updated',
      message: `Your ${updateData.field} has been updated${updateData.oldValue ? ` from ${updateData.oldValue}` : ''} to ${updateData.newValue}`,
      metadata: updateData,
    });
  }

  locationShared(locationData: {
    enabled: boolean;
    address: string;
  }) {
    useActivityStore.getState().addActivity({
      type: 'location_shared',
      title: `Location ${locationData.enabled ? 'Shared' : 'Disabled'}`,
      message: locationData.enabled 
        ? `Your location is now visible to nearby users (${locationData.address})`
        : 'Your location is no longer shared',
      metadata: locationData,
    });
  }
}

export const activityService = ActivityService.getInstance();