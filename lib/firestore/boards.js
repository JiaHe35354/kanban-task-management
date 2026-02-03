import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";

// Create board
export async function createBoard(userId, name) {
  const ref = await addDoc(collection(db, "boards"), {
    name,
    userId,
    createdAt: new Date(),
  });

  return ref.id;
}

// Get all boards for user
export async function getBoardsByUser(userId) {
  const q = query(
    collection(db, "boards"),
    where("userId", "==", userId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Get single board
export async function getBoardById(boardId) {
  const snap = await getDoc(doc(db, "boards", boardId));
  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

export async function updateBoard(boardId, data) {
  await updateDoc(doc(db, "boards", boardId), data);
}

export async function deleteBoardById(boardId) {
  await deleteDoc(doc(db, "boards", boardId));
}
