import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  getDocFromServer
} from "firebase/firestore";
import { Product, Event, Testimonial, WebsiteSettings, Subscriber, AnalyticsData, GalleryPhoto } from "../types";
import { 
  initialProducts, 
  initialEvents, 
  initialTestimonials, 
  initialSettings, 
  initialAnalytics,
  initialSubscribers,
  instagramPosts,
  highlightedModels
} from "../data/mockData";

// Your web app's Firebase configuration (provided by user)
const firebaseConfig = {
  apiKey: "AIzaSyB3ZQqf78XCRUQurFyd0NQFSebHs0QdfUM",
  authDomain: "web-batik-89ac5.firebaseapp.com",
  projectId: "web-batik-89ac5",
  storageBucket: "web-batik-89ac5.firebasestorage.app",
  messagingSenderId: "686149982721",
  appId: "1:686149982721:web:43560a3007341f2d4ffe00",
  measurementId: "G-YZ5RYKZ6N1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

// Global firestore error handling wrapper conforming to required system specifications
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Logs: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Image compression and resize helper (Client-side, downscales to ~600px width/height maximum before uploading as base64 to live firestore document)
export function compressImageToBase64(file: File, maxWidth = 600, maxHeight = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8); // 80% compression ratio
          resolve(compressedBase64);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

// ------------------- SECURITY CONNECTION VALIDATOR -------------------
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test-connection-doc', 'test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or connectivity.");
    }
  }
}

// ------------------- COGNITIVE STATE SYNCHRONIZATION HELPERS -------------------

// 1. PRODUCTS
export async function getProductsFromFirebase(): Promise<Product[]> {
  try {
    const q = collection(db, "products");
    const snapshot = await getDocs(q);
    const data: Product[] = [];
    snapshot.forEach((docSnap) => {
      data.push(docSnap.data() as Product);
    });
    
    // Seed database if empty
    if (data.length === 0) {
      await seedProducts();
      return initialProducts;
    }
    
    return data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "products");
    return [];
  }
}

export async function saveProductToFirebase(product: Product): Promise<void> {
  try {
    const docRef = doc(db, "products", product.id);
    await setDoc(docRef, product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function deleteProductFromFirebase(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}

async function seedProducts() {
  for (const prod of initialProducts) {
    await saveProductToFirebase(prod);
  }
}

// 2. EVENTS
export async function getEventsFromFirebase(): Promise<Event[]> {
  try {
    const q = collection(db, "events");
    const snapshot = await getDocs(q);
    const data: Event[] = [];
    snapshot.forEach((docSnap) => {
      data.push(docSnap.data() as Event);
    });
    
    if (data.length === 0) {
      await seedEvents();
      return initialEvents;
    }
    
    return data;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "events");
    return [];
  }
}

export async function saveEventToFirebase(event: Event): Promise<void> {
  try {
    const docRef = doc(db, "events", event.id);
    await setDoc(docRef, event);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `events/${event.id}`);
  }
}

export async function deleteEventFromFirebase(eventId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "events", eventId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `events/${eventId}`);
  }
}

async function seedEvents() {
  for (const ev of initialEvents) {
    await saveEventToFirebase(ev);
  }
}

// 3. TESTIMONIALS
export async function getTestimonialsFromFirebase(): Promise<Testimonial[]> {
  try {
    const q = collection(db, "testimonials");
    const snapshot = await getDocs(q);
    const data: Testimonial[] = [];
    snapshot.forEach((docSnap) => {
      data.push(docSnap.data() as Testimonial);
    });
    
    if (data.length === 0) {
      await seedTestimonials();
      return initialTestimonials;
    }
    
    return data;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "testimonials");
    return [];
  }
}

export async function saveTestimonialToFirebase(testi: Testimonial): Promise<void> {
  try {
    const docRef = doc(db, "testimonials", testi.id);
    await setDoc(docRef, testi);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `testimonials/${testi.id}`);
  }
}

export async function deleteTestimonialFromFirebase(testiId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "testimonials", testiId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `testimonials/${testiId}`);
  }
}

async function seedTestimonials() {
  for (const testi of initialTestimonials) {
    await saveTestimonialToFirebase(testi);
  }
}

// 4. WEBSITE SETTINGS
export async function getSettingsFromFirebase(): Promise<WebsiteSettings> {
  try {
    const docRef = doc(db, "settings", "website");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as WebsiteSettings;
    } else {
      await saveSettingsToFirebase(initialSettings);
      return initialSettings;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, "settings/website");
    return initialSettings;
  }
}

export async function saveSettingsToFirebase(settings: WebsiteSettings): Promise<void> {
  try {
    const docRef = doc(db, "settings", "website");
    await setDoc(docRef, settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "settings/website");
  }
}

// 5. SUBSCRIBERS
export async function getSubscribersFromFirebase(): Promise<Subscriber[]> {
  try {
    const q = collection(db, "subscribers");
    const snapshot = await getDocs(q);
    const data: Subscriber[] = [];
    snapshot.forEach((docSnap) => {
      data.push(docSnap.data() as Subscriber);
    });
    
    if (data.length === 0) {
      await seedSubscribers();
      return initialSubscribers;
    }
    
    return data;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "subscribers");
    return [];
  }
}

export async function saveSubscriberToFirebase(sub: Subscriber): Promise<void> {
  try {
    const docRef = doc(db, "subscribers", sub.id);
    await setDoc(docRef, sub);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `subscribers/${sub.id}`);
  }
}

export async function deleteSubscriberFromFirebase(subId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "subscribers", subId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `subscribers/${subId}`);
  }
}

async function seedSubscribers() {
  for (const sub of initialSubscribers) {
    await saveSubscriberToFirebase(sub);
  }
}

// 6. ANALYTICS
export async function getAnalyticsFromFirebase(): Promise<AnalyticsData> {
  try {
    const docRef = doc(db, "analytics", "website");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AnalyticsData;
    } else {
      await saveAnalyticsToFirebase(initialAnalytics);
      return initialAnalytics;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, "analytics/website");
    return initialAnalytics;
  }
}

export async function saveAnalyticsToFirebase(analytics: AnalyticsData): Promise<void> {
  try {
    const docRef = doc(db, "analytics", "website");
    await setDoc(docRef, analytics);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "analytics/website");
  }
}

// 7. GALLERY PHOTOS
export async function getGalleryFromFirebase(): Promise<GalleryPhoto[]> {
  try {
    const q = collection(db, "gallery");
    const snapshot = await getDocs(q);
    const data: GalleryPhoto[] = [];
    snapshot.forEach((docSnap) => {
      data.push(docSnap.data() as GalleryPhoto);
    });
    
    if (data.length === 0) {
      await seedGallery();
      return instagramPosts;
    }
    
    return data;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "gallery");
    return [];
  }
}

export async function saveGalleryPhotoToFirebase(photo: GalleryPhoto): Promise<void> {
  try {
    const docRef = doc(db, "gallery", photo.id);
    await setDoc(docRef, photo);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `gallery/${photo.id}`);
  }
}

export async function deleteGalleryPhotoFromFirebase(photoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "gallery", photoId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `gallery/${photoId}`);
  }
}

async function seedGallery() {
  for (const post of instagramPosts) {
    await saveGalleryPhotoToFirebase(post);
  }
}

// 8. HIGHLIGHT CARDS
export async function getHighlightCardsFromFirebase(): Promise<any[]> {
  try {
    const docRef = doc(db, "settings", "highlight_cards");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().cards || highlightedModels;
    } else {
      await saveHighlightCardsToFirebase(highlightedModels);
      return highlightedModels;
    }
  } catch (err) {
    // Graceful fallback during offline / unconfigured Firebase setup
    console.warn("Using offline fallback for highlight cards:", err);
    return highlightedModels;
  }
}

export async function saveHighlightCardsToFirebase(cards: any[]): Promise<void> {
  try {
    const docRef = doc(db, "settings", "highlight_cards");
    await setDoc(docRef, { cards });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "settings/highlight_cards");
  }
}
