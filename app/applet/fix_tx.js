require("dotenv").config();
const admin = require("firebase-admin");

let credential = admin.credential.applicationDefault();
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
   try { credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)); } catch (e) {}
}

admin.initializeApp({
  credential,
  projectId: "gen-lang-client-0153398594",
});

const db = admin.firestore();

async function fix() {
  const settings = await db.collection("settings").doc("api_keys").get();
  console.log("Settings doc path:", settings.ref.path);

  const pendingTxs = await db.collection("transactions").where("status", "==", "pending").get();
  console.log(`Found ${pendingTxs.docs.length} pending transactions...`);

  for (let doc of pendingTxs.docs) {
      console.log(doc.id, doc.data());
  }
}
fix();
