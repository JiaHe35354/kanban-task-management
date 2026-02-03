import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";

export async function createColumn(boardId, name, color, order) {
  console.log("createColumn:", boardId, name);

  if (!boardId) {
    throw new Error("createColumn called without boardId");
  }

  const ref = await addDoc(collection(db, "columns"), {
    boardId,
    name,
    color,
    order,
  });

  return ref.id;
}

export async function getColumnsByBoard(boardId) {
  const q = query(
    collection(db, "columns"),
    where("boardId", "==", boardId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updateColumn(columnId, data) {
  console.log("updateColumn called with:", columnId, data);

  if (!columnId) {
    throw new Error("updateColumn called with undefined columnId");
  }

  await updateDoc(doc(db, "columns", columnId), data);
}

export async function deleteColumn(columnId) {
  console.log("deleteColumn called with:", columnId);

  if (!columnId) {
    throw new Error("deleteColumn called without columnId");
  }

  await deleteDoc(doc(db, "columns", columnId));
}

export async function deleteColumnsByBoard(boardId) {
  const q = query(collection(db, "columns"), where("boardId", "==", boardId));
  const snapshot = await getDocs(q);

  await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));
}
