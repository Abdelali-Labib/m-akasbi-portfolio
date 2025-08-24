// Script to create admin document in Firestore
// Run this once to set up admin permissions

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your Firebase config (same as in your app)
const firebaseConfig = {
  // Add your config here - you can copy from your existing firebase config
  // This is just a template
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdmin() {
  try {
    // Replace with your admin email
    const adminEmail = 'your-admin-email@gmail.com';
    
    await setDoc(doc(db, 'admins', adminEmail), {
      email: adminEmail,
      role: 'admin',
      createdAt: new Date(),
      active: true
    }); 
  } catch (error) {
  }
}

createAdmin();
