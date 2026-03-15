import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  name: string;
  habits: string[];
  preferences: string[];
  routine: string[];
  importantDates: { date: string; event: string }[];
}

export interface Conversation {
  timestamp: Date;
  summary: string;
  mood: string;
}

export const MemoryService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async saveUserProfile(userId: string, profile: Partial<UserProfile>) {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async addConversation(userId: string, conversation: Conversation) {
    const path = `users/${userId}/conversations`;
    try {
      const colRef = collection(db, 'users', userId, 'conversations');
      await setDoc(doc(colRef), {
        ...conversation,
        timestamp: conversation.timestamp.toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getRecentConversations(userId: string, count: number = 5) {
    const path = `users/${userId}/conversations`;
    try {
      const colRef = collection(db, 'users', userId, 'conversations');
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(count));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Conversation);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }
};
