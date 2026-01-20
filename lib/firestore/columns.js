import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

export async function createColumn(boardId, name, color, order) {
  const ref = await addDoc(collection(db, "columns"), {
    boardId,
    name,
    color,
    order,
  });
  return ref.id;
}

export async function getColumnsByBoard(boardId) {
  const q = query(collection(db, "columns"), where("boardId", "==", boardId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
