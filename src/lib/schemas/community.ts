import { z } from "zod";

export const createCommunitySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120, "Title must be less than 120 characters"),
  tagline: z.string().max(140, "Tagline must be less than 140 characters").optional(),
  category: z.string().min(1, "Please select a category"),
  profileIcon: z.string().url("Please upload a valid profile icon").optional(),
  coverMedia: z.array(z.object({
    type: z.enum(["image", "youtube"]),
    url: z.string().url("Please enter a valid URL"),
    thumbnail: z.string().url("Please enter a valid thumbnail URL").optional()
  })).max(5, "Maximum 5 cover media items allowed"),
  shortDescription: z.string().min(10, "Description must be at least 10 characters").max(300, "Description must be less than 300 characters"),
  longDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
  privacy: z.enum(["public", "private", "invite"]),

  // Content fields
  linkedCourseId: z.string().optional(),
  linkedCourseName: z.string().optional(),
  modules: z.array(z.object({
    title: z.string(),
    type: z.enum(["video", "article"]),
    link: z.string().url().optional(),
    duration: z.string().optional()
  })).optional(),
  downloads: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional(),

  // Monetization fields
  pricingModel: z.enum(["free", "free-zaps", "usd", "zaps", "zaps-usd", "crypto"]),
  zapsRequired: z.number().int().nonnegative(),
  usdCoPay: z.number().nonnegative(),
  slotsAvailable: z.number().int().nonnegative().nullable(),
  subscriptionMonthly: z.number().nonnegative().optional(),
  splitPayEnabled: z.boolean().optional(),
  waitlistEnabled: z.boolean().optional(),
  accessWindow: z.string().optional(),

  // Reward Members fields
  offerZAPsToNewMembers: z.boolean().optional(),
  newMemberZAPsReward: z.number().int().nonnegative().optional(),

  // Crypto payment fields
  cryptoTypes: z.array(z.enum(["usdt", "btc", "usdc", "doge"])).optional(),
  cryptoAmount: z.string().optional(),

  // Publishing fields
  status: z.enum(["draft", "published", "scheduled"]),
  publishDate: z.date().optional()
}).refine((data) => {
  // If paid model is selected, at least one of zapsRequired or usdCoPay must be > 0
  if (data.zapsRequired > 0 || data.usdCoPay > 0) {
    return data.zapsRequired > 0 || data.usdCoPay > 0;
  }
  return true;
}, {
  message: "For paid communities, either ZAPS or USD co-pay must be greater than 0",
  path: ["zapsRequired"]
});

export type CreateCommunityForm = z.infer<typeof createCommunitySchema>;

// Step-specific schemas for validation
export const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120, "Title must be less than 120 characters"),
  tagline: z.string().max(140, "Tagline must be less than 140 characters").optional(),
  category: z.string().min(1, "Please select a category"),
  profileIcon: z.string().url("Please upload a valid profile icon").optional(),
  coverMedia: z.array(z.object({
    type: z.enum(["image", "youtube"]),
    url: z.string().url("Please enter a valid URL"),
    thumbnail: z.string().url("Please enter a valid thumbnail URL").optional()
  })).max(5, "Maximum 5 cover media items allowed").optional(),
  shortDescription: z.string().min(10, "Description must be at least 10 characters").max(300, "Description must be less than 300 characters"),
  longDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
  privacy: z.enum(["public", "private", "invite"])
});

export const step2Schema = z.object({
  linkedCourseId: z.string().optional(),
  linkedCourseName: z.string().optional(),
  modules: z.array(z.object({
    title: z.string(),
    type: z.enum(["video", "article"]),
    link: z.string().url().optional(),
    duration: z.string().optional()
  })).optional(),
  downloads: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional()
});

export const step3Schema = z.object({
  pricingModel: z.enum(["free", "free-zaps", "usd", "zaps", "zaps-usd", "crypto"]),
  zapsRequired: z.number().int().nonnegative(),
  usdCoPay: z.number().nonnegative(),
  slotsAvailable: z.number().int().nonnegative().nullable(),
  subscriptionMonthly: z.number().nonnegative().optional(),
  splitPayEnabled: z.boolean().optional(),
  waitlistEnabled: z.boolean().optional(),
  accessWindow: z.string().optional(),
  offerZAPsToNewMembers: z.boolean().optional(),
  newMemberZAPsReward: z.number().int().nonnegative().optional(),
  cryptoTypes: z.array(z.enum(["usdt", "btc", "usdc", "doge"])).optional(),
  cryptoAmount: z.string().optional()
});

export const step4Schema = z.object({
  status: z.enum(["draft", "published", "scheduled"]),
  publishDate: z.date().optional()
});

export type Step1Form = z.infer<typeof step1Schema>;
export type Step2Form = z.infer<typeof step2Schema>;
export type Step3Form = z.infer<typeof step3Schema>;
export type Step4Form = z.infer<typeof step4Schema>;

// Categories for dropdown
export const communityCategories = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI" },
  { value: "tech", label: "Tech" },
  { value: "music", label: "Music" },
  { value: "money", label: "Money" },
  { value: "health", label: "Health" },
  { value: "gaming", label: "Gaming" },
  { value: "movies", label: "Movies" },
  { value: "news", label: "News" },
  { value: "podcast", label: "Podcast" },
  { value: "art", label: "Art" },
  { value: "fashion", label: "Fashion" },
  { value: "relationships", label: "Relationships" },
  { value: "spirituality", label: "Spirituality" },
  { value: "self-improvement", label: "Self-improvement" }
] as const;

// Privacy options
export const privacyOptions = [
  { value: "public", label: "Public", description: "Anyone can find and join" },
  { value: "private", label: "Private", description: "Invite-only, hidden from search" },
  { value: "invite", label: "Invite-only", description: "Visible but requires approval" }
] as const;

// Access window options
export const accessWindowOptions = [
  { value: "lifetime", label: "Lifetime Access" },
  { value: "30days", label: "30 Days" },
  { value: "90days", label: "90 Days" },
  { value: "1year", label: "1 Year" }
] as const;