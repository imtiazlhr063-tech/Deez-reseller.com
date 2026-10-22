// Firebase and Firestore are temporarily cancelled per user request.
// External database and authentication will be added manually.

export type User = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
};

export const auth = null;
export const db = null;
export const googleProvider = null;

export const signInWithGoogle = async (): Promise<User> => {
  throw new Error('Cloud Authentication is currently paused. Please use standard direct checkout or login.');
};

export const logoutFirebase = async () => {};

export const onAuthStateChanged = (_auth: any, callback: (user: User | null) => void) => {
  callback(null);
  return () => {};
};

export const saveProductToFirestore = async (_product: any) => {};
export const deleteProductFromFirestore = async (_productId: string) => {};
export const saveOrderToFirestore = async (_order: any) => {};
export const saveResellerToFirestore = async (_reseller: any) => {};
