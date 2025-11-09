/**
 * Analytics utilities for tracking user events
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  creatorId?: string;
  communityId?: string;
  courseId?: string;
  metadata?: Record<string, any>;
}

/**
 * Track an analytics event
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await addDoc(collection(db, 'analytics_events'), {
      ...event,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  } catch (error) {
    console.error('Failed to track analytics event:', error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

/**
 * Track community join attempt
 */
export function trackCommunityJoinAttempt(
  userId: string,
  communityId: string,
  accessType: string
): Promise<void> {
  return trackEvent({
    eventType: 'community_join_attempt',
    userId,
    communityId,
    metadata: { accessType },
  });
}

/**
 * Track successful community join
 */
export function trackCommunityJoinSuccess(
  userId: string,
  communityId: string,
  accessType: string
): Promise<void> {
  return trackEvent({
    eventType: 'community_join_success',
    userId,
    communityId,
    metadata: { accessType },
  });
}

/**
 * Track community join failure
 */
export function trackCommunityJoinFailure(
  userId: string,
  communityId: string,
  error: string
): Promise<void> {
  return trackEvent({
    eventType: 'community_join_failure',
    userId,
    communityId,
    metadata: { error },
  });
}

/**
 * Track course enrollment attempt
 */
export function trackCourseEnrollAttempt(
  userId: string,
  courseId: string,
  creatorId: string
): Promise<void> {
  return trackEvent({
    eventType: 'course_enroll_attempt',
    userId,
    courseId,
    creatorId,
  });
}

/**
 * Track successful course enrollment
 */
export function trackCourseEnrollSuccess(
  userId: string,
  courseId: string,
  creatorId: string
): Promise<void> {
  return trackEvent({
    eventType: 'course_enroll_success',
    userId,
    courseId,
    creatorId,
  });
}

/**
 * Track creator profile view
 */
export function trackCreatorProfileView(
  userId: string | undefined,
  creatorId: string
): Promise<void> {
  return trackEvent({
    eventType: 'creator_profile_view',
    userId,
    creatorId,
  });
}

/**
 * Track video play from creator profile
 */
export function trackVideoPlayFromProfile(
  userId: string | undefined,
  creatorId: string,
  videoId: string
): Promise<void> {
  return trackEvent({
    eventType: 'video_play_from_profile',
    userId,
    creatorId,
    metadata: { videoId },
  });
}
