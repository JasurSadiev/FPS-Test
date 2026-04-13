import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import type { SystemInfo, Game, CompatibilityResult } from '@/lib/types';
import type { User } from 'firebase/auth';
import { cleanObject } from '@/lib/utils';

export const userService = {
  /**
   * Syncs the user's system info to Firestore.
   */
  async syncSystemInfo(user: User, systemInfo: SystemInfo) {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, cleanObject({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastActive: serverTimestamp()
      }), { merge: true });

      const pcDocRef = doc(db, 'users', user.uid, 'hardware', 'default');
      await setDoc(pcDocRef, cleanObject({
        ...systemInfo,
        updatedAt: serverTimestamp()
      }));
    } catch (error) {
      console.error('Failed to sync system info:', error);
    }
  },

  /**
   * Game Library Persistence
   */
  async addToLibrary(userId: string, game: Game) {
    const gameRef = doc(db, 'users', userId, 'library', game.id.toString());
    await setDoc(gameRef, cleanObject({
      ...game,
      addedAt: serverTimestamp()
    }));
  },

  async removeFromLibrary(userId: string, gameId: number) {
    const gameRef = doc(db, 'users', userId, 'library', gameId.toString());
    await deleteDoc(gameRef);
  },

  async getLibrary(userId: string): Promise<Game[]> {
    const libRef = collection(db, 'users', userId, 'library');
    const q = query(libRef, orderBy('addedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Game);
  },

  /**
   * Recently Analyzed History
   */
  async addToRecentlyAnalyzed(userId: string, game: Game, result: CompatibilityResult) {
    const recentRef = doc(db, 'users', userId, 'recent_checks', game.id.toString());
    await setDoc(recentRef, cleanObject({
      game,
      result,
      analyzedAt: serverTimestamp()
    }));
  },

  async getRecentlyAnalyzed(userId: string): Promise<{game: Game, result: CompatibilityResult}[]> {
    const recentRef = collection(db, 'users', userId, 'recent_checks');
    const q = query(recentRef, orderBy('analyzedAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as any);
  },

  async getSavedSystemInfo(userId: string): Promise<SystemInfo | null> {
    try {
      const pcDocRef = doc(db, 'users', userId, 'hardware', 'default');
      const docSnap = await getDoc(pcDocRef);
      return docSnap.exists() ? docSnap.data() as SystemInfo : null;
    } catch (error) {
      return null;
    }
  }
};
