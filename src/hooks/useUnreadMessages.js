import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/Providers/AuthContext';

const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('read', '==', false));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setUnreadCount(querySnapshot.size);
    }, (error) => {
      console.error("Error fetching unread messages:", error);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, [user]);

  return unreadCount;
};

export default useUnreadMessages;
