import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Types
export interface Game {
  id?: string;
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  rentPrice?: number;
  platform: string[];
  discount: number;
  description: string;
  features: string[];
  systemRequirements: string[];
  type: string[];
  category: 'game' | 'subscription';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Testimonial {
  id?: string;
  name: string;
  time: string;
  message: string;
  reply: string;
  avatar: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Games Service
export const gamesService = {
  // Get all games
  async getAll(): Promise<Game[]> {
    try {
      const q = query(
        collection(db, 'games'), 
        where('category', '==', 'game'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Game[];
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  },

  // Get bestseller games (limited)
  async getBestsellers(limitCount: number = 6): Promise<Game[]> {
    try {
      const q = query(
        collection(db, 'games'),
        where('category', '==', 'game'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Game[];
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }
  },

  // Add new game
  async add(game: Omit<Game, 'id'>): Promise<string> {
    try {
      const gameData = {
        ...game,
        category: 'game' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(collection(db, 'games'), gameData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },

  // Update game
  async update(id: string, game: Partial<Game>): Promise<void> {
    try {
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        ...game,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  },

  // Delete game
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'games', id));
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }
};

// Subscriptions Service
export const subscriptionsService = {
  // Get all subscriptions
  async getAll(): Promise<Game[]> {
    try {
      const q = query(
        collection(db, 'games'), 
        where('category', '==', 'subscription'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Game[];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  },

  // Add new subscription
  async add(subscription: Omit<Game, 'id'>): Promise<string> {
    try {
      const subscriptionData = {
        ...subscription,
        category: 'subscription' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(collection(db, 'games'), subscriptionData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  },

  // Update subscription
  async update(id: string, subscription: Partial<Game>): Promise<void> {
    try {
      const subscriptionRef = doc(db, 'games', id);
      await updateDoc(subscriptionRef, {
        ...subscription,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Delete subscription
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'games', id));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }
};

// Testimonials Service
export const testimonialsService = {
  // Get all testimonials
  async getAll(): Promise<Testimonial[]> {
    try {
      const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Testimonial[];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },

  // Add new testimonial
  async add(testimonial: Omit<Testimonial, 'id'>): Promise<string> {
    try {
      const testimonialData = {
        ...testimonial,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(collection(db, 'testimonials'), testimonialData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding testimonial:', error);
      throw error;
    }
  },

  // Update testimonial
  async update(id: string, testimonial: Partial<Testimonial>): Promise<void> {
    try {
      const testimonialRef = doc(db, 'testimonials', id);
      await updateDoc(testimonialRef, {
        ...testimonial,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  },

  // Delete testimonial
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
};

// Storage Service for image uploads
export const storageService = {
  // Upload image
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete image
  async deleteImage(url: string): Promise<void> {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};