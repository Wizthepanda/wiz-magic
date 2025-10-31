import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image file to Firebase Storage and return the download URL
 * @param file - The image file to upload
 * @param path - The storage path (e.g., 'communities/icons/communityId')
 * @returns Promise<string> - The download URL of the uploaded image
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Generate a unique filename for an uploaded image
 * @param originalName - The original filename
 * @returns string - A unique filename with timestamp
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomStr}.${extension}`;
};

/**
 * Upload image to Firebase Storage for community posts with validation
 * @param file - The image file to upload
 * @param userId - The user's Firebase UID
 * @returns The download URL of the uploaded image
 */
export const uploadPostImage = async (file: File, userId: string): Promise<string> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WEBP image.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  try {
    // Create a unique file path
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = `community_posts/${userId}/${uniqueFilename}`;

    // Upload using the generic uploadImage function
    const downloadURL = await uploadImage(file, filePath);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading post image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns Error message if invalid, null if valid
 */
export const validateImageFile = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    return 'Invalid file type. Please upload a JPG, PNG, GIF, or WEBP image.';
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'File size too large. Maximum size is 5MB.';
  }

  return null;
};
