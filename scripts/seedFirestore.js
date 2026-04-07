import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import admin from "firebase-admin";
import data from "../data/data.json" assert { type: "json" };

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
});

// Firestore reference
const db = admin.firestore();

async function seedFirestore() {
  const USER_ID = process.env.FIREBASE_USER_ID;

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
