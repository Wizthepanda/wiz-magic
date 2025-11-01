/**
 * Community Categories Data Structure
 * Main Categories with their corresponding Sub Categories
 */

export const categoryOptions = {
  Tech: ["AI", "Programming", "Web Dev", "Web3", "Data", "Coding", "Software", "Robotics", "AR"],
  Money: ["Crypto", "Stocks", "Real Estate", "Trading", "Startup", "Crowdfunding", "Marketing", "E-commerce", "Freelance"],
  Design: ["Graphic", "UX/UI", "Art", "Animation", "Video", "Photography", "3D", "NFTs"],
  Health: ["Fitness", "Longevity", "Nutrition", "Wellness", "Yoga", "Mental Health", "Meditation", "Sleep"],
  "Self-Improvement": ["Productivity", "Motivation", "Mindset", "Public Speaking", "Leadership", "Creativity"],
  Education: ["Languages", "Online Learning", "Learning", "Teaching", "Research"],
  Gaming: ["Esports", "Game Dev", "Streaming", "VR", "Mobile"],
  Entertainment: ["Anime", "Animations", "Music", "Movies", "Sports", "Comedy", "Podcasting"],
  Lifestyle: ["Travel", "Cooking", "Fashion", "Parenting", "Home"],
  Social: ["Dating", "Networking", "Relationships", "Communication", "Social Skills", "Social Media"],
  DIY: ["Crafts", "Home Improvement", "Gardening", "Woodworking", "Repair", "3D Printing"]
} as const;

export type MainCategory = keyof typeof categoryOptions;
export type SubCategory = (typeof categoryOptions)[MainCategory][number];

// Helper function to get all main categories
export const getMainCategories = (): MainCategory[] => {
  return Object.keys(categoryOptions) as MainCategory[];
};

// Helper function to get sub categories for a main category
export const getSubCategories = (mainCategory: MainCategory): readonly string[] => {
  return categoryOptions[mainCategory] || [];
};

// Helper function to check if a sub category exists
export const isValidSubCategory = (mainCategory: MainCategory, subCategory: string): boolean => {
  return categoryOptions[mainCategory]?.includes(subCategory as any) || false;
};
