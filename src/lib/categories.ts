// Category and Subcategory Data Structure
// Used across the platform for consistent categorization

export interface Category {
  value: string;
  label: string;
  subcategories: string[];
}

export const CATEGORY_SUBCATEGORY_MAP: Record<string, string[]> = {
  tech: ['AI', 'Programming', 'Web Dev', 'Web3', 'Data', 'Coding', 'Software', 'Robotics', 'AR'],
  money: ['Crypto', 'Stocks', 'Real Estate', 'Trading', 'Startup', 'Crowdfunding', 'Marketing', 'E-commerce', 'Freelance'],
  design: ['Graphic', 'UX/UI', 'Art', 'Animation', 'Video', 'Photography', '3D', 'NFTs'],
  health: ['Fitness', 'Longevity', 'Nutrition', 'Wellness', 'Yoga', 'Mental Health', 'Meditation', 'Sleep'],
  'self-improvement': ['Productivity', 'Motivation', 'Mindset', 'Public Speaking', 'Leadership', 'Creativity'],
  education: ['Languages', 'Online Learning', 'Learning', 'Teaching', 'Research'],
  gaming: ['Esports', 'Game Dev', 'Streaming', 'VR', 'Mobile'],
  entertainment: ['Anime', 'Animations', 'Music', 'Movies', 'Sports', 'Comedy', 'Podcasting'],
  lifestyle: ['Travel', 'Cooking', 'Fashion', 'Parenting', 'Home'],
  social: ['Dating', 'Networking', 'Relationships', 'Communication', 'Social Skills', 'Social Media'],
  diy: ['Crafts', 'Home Improvement', 'Gardening', 'Woodworking', 'Repair', '3D Printing']
};

export const CATEGORIES: Category[] = [
  { value: 'tech', label: 'Tech', subcategories: CATEGORY_SUBCATEGORY_MAP.tech },
  { value: 'money', label: 'Money', subcategories: CATEGORY_SUBCATEGORY_MAP.money },
  { value: 'design', label: 'Design', subcategories: CATEGORY_SUBCATEGORY_MAP.design },
  { value: 'health', label: 'Health', subcategories: CATEGORY_SUBCATEGORY_MAP.health },
  { value: 'self-improvement', label: 'Self Improvement', subcategories: CATEGORY_SUBCATEGORY_MAP['self-improvement'] },
  { value: 'education', label: 'Education', subcategories: CATEGORY_SUBCATEGORY_MAP.education },
  { value: 'gaming', label: 'Gaming', subcategories: CATEGORY_SUBCATEGORY_MAP.gaming },
  { value: 'entertainment', label: 'Entertainment', subcategories: CATEGORY_SUBCATEGORY_MAP.entertainment },
  { value: 'lifestyle', label: 'Lifestyle', subcategories: CATEGORY_SUBCATEGORY_MAP.lifestyle },
  { value: 'social', label: 'Social', subcategories: CATEGORY_SUBCATEGORY_MAP.social },
  { value: 'diy', label: 'DIY', subcategories: CATEGORY_SUBCATEGORY_MAP.diy },
];

// Simple list for legacy code
export const CATEGORY_LIST = [
  { value: 'tech', label: 'Tech' },
  { value: 'money', label: 'Money' },
  { value: 'design', label: 'Design' },
  { value: 'health', label: 'Health' },
  { value: 'self-improvement', label: 'Self Improvement' },
  { value: 'education', label: 'Education' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'social', label: 'Social' },
  { value: 'diy', label: 'DIY' },
];

// Helper function to get subcategories for a category
export const getSubcategories = (category: string): string[] => {
  return CATEGORY_SUBCATEGORY_MAP[category] || [];
};

// Helper function to validate if a subcategory belongs to a category
export const isValidSubcategory = (category: string, subcategory: string): boolean => {
  const subcategories = getSubcategories(category);
  return subcategories.includes(subcategory);
};
