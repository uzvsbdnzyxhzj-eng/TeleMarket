require("dotenv").config();
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
admin.initializeApp({ projectId: 'gen-lang-client-0153398594' });
const db = getFirestore(admin.app(), 'ai-studio-a59e8237-1517-4ad0-bc85-5f6d85bf1708');

async function run() {
  const users = await db.collection('users').get();
  console.log('Total users:', users.size);
  let c = 0;
  for (const doc of users.docs) {
    const data = doc.data();
    if (data.balanceUSD > 10000 || data.balanceUSD < 0 || isNaN(data.balanceUSD) || typeof data.balanceUSD !== 'number') {
      console.log('Crazy balance user:', doc.id, data.email, data.balanceUSD);
      c++;
    } else if (data.balanceUSD === 0 && (data.total_deposited > 0)) {
      console.log('Zero balance user with deposits:', doc.id, data.email, data.balanceUSD, 'deposited:', data.total_deposited, 'spent:', data.total_spent);
      c++;
    }
  }
}
run();
