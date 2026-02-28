// src/lib/firestore/tasks.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import { deleteSubtasksByTask } from "./subtasks";

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
  const q = query(
    collection(db, "tasks"),
    where("boardId", "==", boardId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    subtasks: [],
  }));
}

export async function moveTask(taskId, newColumnId, newOrder) {
  await updateDoc(doc(db, "tasks", taskId), {
    columnId: newColumnId,
    order: newOrder,
  });
}

export async function updateTask(taskId, data) {
  await updateDoc(doc(db, "tasks", taskId), data);
}

export async function deleteTaskById(taskId) {
  await deleteSubtasksByTask(taskId);

  await deleteDoc(doc(db, "tasks", taskId));
}

export async function deleteTasksByColumn(columnId) {
  const q = query(collection(db, "tasks"), where("columnId", "==", columnId));

  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    await deleteSubtasksByTask(docSnap.id);
    await deleteDoc(docSnap.ref);
  }
}

export async function deleteTasksByBoard(boardId) {
  const q = query(collection(db, "tasks"), where("boardId", "==", boardId));
  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    await deleteSubtasksByTask(docSnap.id);
    await deleteDoc(docSnap.ref);
  }
}
