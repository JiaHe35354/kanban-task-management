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
import { deleteTasksByColumn } from "./tasks";

export async function createColumn(boardId, name, color, order) {
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
    orderBy("order", "asc"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updateColumn(columnId, data) {
  await updateDoc(doc(db, "columns", columnId), data);
}

export async function deleteColumn(columnId) {
  await deleteTasksByColumn(columnId);
  await deleteDoc(doc(db, "columns", columnId));
}

export async function deleteColumnsByBoard(boardId) {
  const q = query(collection(db, "columns"), where("boardId", "==", boardId));
  const snapshot = await getDocs(q);

  await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));
}
