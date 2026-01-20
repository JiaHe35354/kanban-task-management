// src/lib/firestore/tasks.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";

export async function createTask(boardId, columnId, title, description, order) {
  const ref = await addDoc(collection(db, "tasks"), {
    boardId,
    columnId,
    title,
    description,
    order,
  });
  return ref.id;
}

export async function getTasksByBoard(boardId) {
  const q = query(collection(db, "tasks"), where("boardId", "==", boardId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function moveTask(taskId, newColumnId, newOrder) {
  await updateDoc(doc(db, "tasks", taskId), {
    columnId: newColumnId,
    order: newOrder,
  });
}
