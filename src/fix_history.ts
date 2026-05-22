import * as dotenv from 'dotenv';
dotenv.config();
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

let credential = admin.credential.applicationDefault();
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
   try { credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)); } catch (e) {}
}

admin.initializeApp({
  credential,
  projectId: "gen-lang-client-0153398594",
});

const db = getFirestore(admin.app(), 'ai-studio-a59e8237-1517-4ad0-bc85-5f6d85bf1708');

async function run() {
  const txs = await db.collection('transactions').get();
  
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  let recentTopups = [];
  
  for (let doc of txs.docs) {
     const data = doc.data();
     if (data.type === 'topup') {
         if (data.createdAt >= oneDayAgo) {
             recentTopups.push({id: doc.id, ...data});
         }
     }
  }
  
  console.log("Recent topups:", recentTopups.map(t => ({ id: t.id, amount: t.amountUSD, user: t.userEmail || t.userId, status: t.status })));
}
run();
