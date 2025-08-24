import { dbAdmin } from './firebase-admin';

/**
 * Checks if a user with the given UID is an admin.
 * @param {string} uid - The user's UID.
 * @returns {Promise<boolean>} - True if the user is an admin, false otherwise.
 */
export const isAdmin = async (email) => {
  if (!email) return false;
  try {
    const adminsRef = dbAdmin.collection('admins');
    const snapshot = await adminsRef.where('email', '==', email).limit(1).get();
    return !snapshot.empty;
  } catch (error) {
    
    return false;
  }
};
