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
  const users = await db.collection('users').get();
  console.log('Total users:', users.size);
  let batch = db.batch();
  let count = 0;
  for (const doc of users.docs) {
    const data = doc.data();
    if (data.balanceUSD > 10000 || data.balanceUSD < 0 || isNaN(data.balanceUSD) || typeof data.balanceUSD !== 'number') {
      console.log('Fixing Crazy balance user:', doc.id, data.email, data.balanceUSD);
      batch.update(doc.ref, { balanceUSD: 0 });
      count++;
    } else if (data.balanceUSD === 0 && (data.total_deposited > 0)) {
       // user probably lost balance due to increment bug
       const expected = (data.total_deposited || 0) - (data.total_spent || 0) + (data.referralEarnings || 0);
       let actualExpected = expected < 0 ? 0 : expected;
       if (actualExpected > 0) {
          console.log('Fixing Zero balance user with deposits:', doc.id, data.email, 'deposits:', data.total_deposited, 'spent:', data.total_spent, 'expected:', actualExpected);
          batch.update(doc.ref, { balanceUSD: actualExpected });
          count++;
       }
    }
    
    if (count > 400) {
      await batch.commit();
      batch = db.batch();
      console.log('Committed batch');
      count = 0;
    }
  }
  if (count > 0) {
    await batch.commit();
    console.log('Committed final batch');
  }
}
run().catch(console.error);
