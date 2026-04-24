import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Auftrag } from './types';

const COLLECTION = 'auftraege';

// Alle Aufträge in Echtzeit abonnieren
export function subscribeToAuftraege(
  callback: (auftraege: Auftrag[]) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy('erstelltAm', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const auftraege = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Auftrag[];
    callback(auftraege);
  });
}

// Hilfsfunktion: entfernt alle undefined-Werte (Firestore akzeptiert kein undefined)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

// Neuen Auftrag erstellen
export async function createAuftrag(
  data: Omit<Auftrag, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), stripUndefined(data as Record<string, unknown>));
  return ref.id;
}

// Auftrag aktualisieren
export async function updateAuftrag(
  id: string,
  data: Partial<Omit<Auftrag, 'id'>>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, aktualisiertAm: Date.now() });
}

// Auftrag löschen
export async function deleteAuftrag(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
