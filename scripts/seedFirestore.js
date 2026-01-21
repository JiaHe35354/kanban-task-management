// import "dotenv/config";

// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../utils/firebase.js";
// import data from "../data/data.json" assert { type: "json" };

// async function seedFirestore() {
//   const USER_ID = "user123"; // replace later with auth uid

//   for (const board of data.boards) {
//     const boardRef = await addDoc(collection(db, "boards"), {
//       name: board.name,
//       userId: USER_ID,
//       createdAt: new Date(),
//     });

//     const columnIdMap = {};

//     for (let i = 0; i < board.columns.length; i++) {
//       const col = board.columns[i];
//       const colRef = await addDoc(collection(db, "columns"), {
//         boardId: boardRef.id,
//         name: col.name,
//         color: col.color,
//         order: i,
//       });

//       columnIdMap[col.id] = colRef.id;
//     }

//     for (let i = 0; i < board.tasks.length; i++) {
//       const task = board.tasks[i];
//       const taskRef = await addDoc(collection(db, "tasks"), {
//         boardId: boardRef.id,
//         // Square brackets [] mean: “use the VALUE as the key”
//         columnId: columnIdMap[task.columnId],
//         title: task.title,
//         description: task.description,
//         order: i,
//       });

//       for (let j = 0; j < task.subtasks.length; j++) {
//         const sub = task.subtasks[j];
//         await addDoc(collection(db, "subtasks"), {
//           taskId: taskRef.id,
//           title: sub.title,
//           isCompleted: sub.isCompleted,
//           order: j,
//         });
//       }
//     }
//   }

//   console.log("✅ Firestore seeded successfully");
// }

// seedFirestore().catch(console.error);

import fs from "fs";
import admin from "firebase-admin";
import data from "../data/data.json" assert { type: "json" };

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore reference
const db = admin.firestore();

async function seedFirestore() {
  const USER_ID = "user123"; // Temporary placeholder for user ID

  for (const board of data.boards) {
    // 1. Create board
    const boardRef = await db.collection("boards").add({
      name: board.name,
      userId: USER_ID,
      createdAt: new Date(),
    });

    const columnIdMap = {}; // Map JSON column IDs → Firestore IDs

    // 2. Create columns
    for (let i = 0; i < board.columns.length; i++) {
      const col = board.columns[i];
      const colRef = await db.collection("columns").add({
        boardId: boardRef.id,
        name: col.name,
        color: col.color,
        order: i,
      });

      // Save Firestore ID
      columnIdMap[col.id] = colRef.id;
    }

    // 3. Create tasks
    for (let i = 0; i < board.tasks.length; i++) {
      const task = board.tasks[i];
      const taskRef = await db.collection("tasks").add({
        boardId: boardRef.id,
        columnId: columnIdMap[task.columnId], // Use mapped Firestore column ID
        title: task.title,
        description: task.description,
        order: i,
      });

      // 4. Create subtasks
      for (let j = 0; j < task.subtasks.length; j++) {
        const sub = task.subtasks[j];
        await db.collection("subtasks").add({
          taskId: taskRef.id,
          title: sub.title,
          isCompleted: sub.isCompleted,
          order: j,
        });
      }
    }
  }

  console.log("✅ Firestore seeded successfully (Admin SDK)");
}

seedFirestore().catch((err) => {
  console.error("Seeding failed:", err);
});
