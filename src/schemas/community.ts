/**
 * Community Schemas (Phase 6)
 * Zod validation schemas for community-related data structures
 */

import { z } from 'zod';

// Monetization model schema
export const MonetizationSchema = z.object({
  model: z.enum(['free', 'free_zaps', 'usd', 'zaps', 'zaps_usd', 'crypto']),
  zapsAmount: z.number().nullable(),
  usdAmount: z.number().nullable(),
  crypto: z.array(z.string()).optional(),
});

// Community stats schema
export const CommunityStatsSchema = z.object({
  members: z.number(),
  slotsAvailable: z.number().nullable(),
  posts: z.number().optional(),
  totalXP: z.number().optional(),
});

// Main community schema
export const CommunitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable(),
  bannerUrl: z.string().url().nullable().or(z.literal('')),
  avatarUrl: z.string().url().nullable().or(z.literal('')),
  creatorId: z.string(),
  creatorName: z.string(),
  type: z.enum(['public', 'private', 'invite-only']),
  monetization: MonetizationSchema,
  stats: CommunityStatsSchema,
  status: z.enum(['published', 'draft']).default('draft'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Member role schema
export const MemberRoleSchema = z.enum(['creator', 'moderator', 'member']);

// Member schema
export const MemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  communityId: z.string(),
  name: z.string(),
  avatar: z.string().url().nullable(),
  role: MemberRoleSchema,
  xp: z.number().default(0),
  level: z.number().default(1),
  joinedAt: z.string(),
  isOnline: z.boolean().default(false),
});

// Reward tier schema
export const RewardTierSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  name: z.string(),
  xpRequired: z.number().min(0),
  rewards: z.array(z.string()),
  icon: z.string(),
  order: z.number(),
});

// API Response schemas
export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

export const ApiResponseSchema = z.union([ApiSuccessSchema, ApiErrorSchema]);

// Create/Update community payload schemas
export const CreateCommunitySchema = CommunitySchema.omit({
  id: true,
  creatorId: true,
  creatorName: true,
  createdAt: true,
  updatedAt: true,
  stats: true,
});

export const UpdateCommunitySchema = CommunitySchema.partial().extend({
  id: z.string(),
});

// Join community payload schema
export const JoinCommunitySchema = z.object({
  method: z.enum(['zaps', 'usd', 'zaps_usd', 'waitlist', 'free']),
  payload: z.any().optional(), // payment details, etc.
});

// Member action schemas
export const UpdateMemberRoleSchema = z.object({
  communityId: z.string(),
  memberId: z.string(),
  role: MemberRoleSchema,
});

// Community filters
export const CommunityFilterSchema = z.enum(['all', 'trending', 'mine', 'joined']);

// Paginated response schema
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasMore: z.boolean(),
  });

// Type exports
export type Community = z.infer<typeof CommunitySchema>;
export type Member = z.infer<typeof MemberSchema>;
export type MemberRole = z.infer<typeof MemberRoleSchema>;
export type RewardTier = z.infer<typeof RewardTierSchema>;
export type Monetization = z.infer<typeof MonetizationSchema>;
export type CommunityStats = z.infer<typeof CommunityStatsSchema>;
export type CreateCommunityPayload = z.infer<typeof CreateCommunitySchema>;
export type UpdateCommunityPayload = z.infer<typeof UpdateCommunitySchema>;
export type JoinCommunityPayload = z.infer<typeof JoinCommunitySchema>;
export type UpdateMemberRolePayload = z.infer<typeof UpdateMemberRoleSchema>;
export type CommunityFilter = z.infer<typeof CommunityFilterSchema>;
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
