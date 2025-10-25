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
