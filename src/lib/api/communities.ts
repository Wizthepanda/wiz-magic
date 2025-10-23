/**
 * Community API Service (Phase 6)
 * API functions for community CRUD operations
 */

import { api } from './client';
import type {
  Community,
  Member,
  CreateCommunityPayload,
  UpdateCommunityPayload,
  JoinCommunityPayload,
  UpdateMemberRolePayload,
  CommunityFilter,
  ApiResponse,
} from '@/schemas/community';

/**
 * Fetch communities with optional filtering
 */
export const fetchCommunities = async (filter: CommunityFilter = 'all'): Promise<Community[]> => {
  const response = await api.get<Community[]>(`/communities?filter=${filter}`);
  return response.data || [];
};

/**
 * Fetch a single community by ID
 */
export const fetchCommunity = async (id: string): Promise<Community> => {
  const response = await api.get<Community>(`/communities/${id}`);
  if (!response.data) {
    throw new Error('Community not found');
  }
  return response.data;
};

/**
 * Fetch user's communities
 */
export const fetchUserCommunities = async (userId: string): Promise<Community[]> => {
  const response = await api.get<Community[]>(`/users/${userId}/communities`);
  return response.data || [];
};

/**
 * Create a new community
 */
export const createCommunity = async (payload: CreateCommunityPayload): Promise<Community> => {
  const response = await api.post<Community>('/communities', payload);
  if (!response.data) {
    throw new Error('Failed to create community');
  }
  return response.data;
};

/**
 * Update an existing community
 */
export const updateCommunity = async (payload: UpdateCommunityPayload): Promise<Community> => {
  const { id, ...data } = payload;
  const response = await api.put<Community>(`/communities/${id}`, data);
  if (!response.data) {
    throw new Error('Failed to update community');
  }
  return response.data;
};

/**
 * Delete a community
 */
export const deleteCommunity = async (id: string): Promise<void> => {
  await api.delete(`/communities/${id}`);
};

/**
 * Join a community
 */
export const joinCommunity = async (id: string, payload: JoinCommunityPayload): Promise<ApiResponse> => {
  return await api.post(`/communities/${id}/join`, payload);
};

/**
 * Leave a community
 */
export const leaveCommunity = async (id: string): Promise<void> => {
  await api.post(`/communities/${id}/leave`);
};

/**
 * Fetch community members
 */
export const fetchMembers = async (communityId: string): Promise<Member[]> => {
  const response = await api.get<Member[]>(`/communities/${communityId}/members`);
  return response.data || [];
};

/**
 * Update member role (promote/demote)
 */
export const updateMemberRole = async (payload: UpdateMemberRolePayload): Promise<Member> => {
  const { communityId, memberId, role } = payload;
  const response = await api.patch<Member>(`/communities/${communityId}/members/${memberId}`, { role });
  if (!response.data) {
    throw new Error('Failed to update member role');
  }
  return response.data;
};

/**
 * Remove a member from community
 */
export const removeMember = async (communityId: string, memberId: string): Promise<void> => {
  await api.delete(`/communities/${communityId}/members/${memberId}`);
};

// Mock data for development (fallback when API not available)
export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'sample-1',
    slug: 'soulscapes-nft',
    title: 'How We Launched "SoulScapes" NFT',
    description: 'Learn how we built and launched SoulScapes NFT from concept to 10k holders.',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
    avatarUrl: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=200&h=200&fit=crop',
    creatorId: 'creator-1',
    creatorName: 'Irfan Dean',
    type: 'public',
    monetization: {
      model: 'free_zaps',
      zapsAmount: 500,
      usdAmount: null,
    },
    stats: {
      members: 847,
      slotsAvailable: 1153,
      posts: 243,
      totalXP: 125000,
    },
    status: 'published',
    createdAt: new Date('2024-12-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_MEMBERS: Member[] = [
  {
    id: 'member-1',
    userId: 'creator-1',
    communityId: 'sample-1',
    name: 'Irfan Dean',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irfan',
    role: 'creator',
    xp: 15670,
    level: 45,
    joinedAt: new Date('2024-12-15').toISOString(),
    isOnline: true,
  },
  {
    id: 'member-2',
    userId: 'user-1',
    communityId: 'sample-1',
    name: 'Sarah Mitchell',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    role: 'moderator',
    xp: 9240,
    level: 32,
    joinedAt: new Date('2024-12-16').toISOString(),
    isOnline: true,
  },
];
