// src/lib/firestore/subtasks.js
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

export async function createSubtask(taskId, title, isCompleted, order) {
  const ref = await addDoc(collection(db, "subtasks"), {
    taskId,
    title,
    isCompleted,
    order,
  });
  return ref.id;
}

export async function getSubtasksByTask(taskId) {
  const q = query(collection(db, "subtasks"), where("taskId", "==", taskId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function toggleSubtask(subtaskId, isCompleted) {
  await updateDoc(doc(db, "subtasks", subtaskId), {
    isCompleted,
  });
}
