import fs from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function deleteCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`Deleted collection: ${collectionName}`);
}

async function resetFirestore() {
  // Delete in correct order
  await deleteCollection("subtasks");
  await deleteCollection("tasks");
  await deleteCollection("columns");
  await deleteCollection("boards");
  console.log("✅ Firestore fully cleared");
}

resetFirestore().catch(console.error);
