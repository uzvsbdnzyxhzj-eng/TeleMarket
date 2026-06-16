import admin from 'firebase-admin';
import 'dotenv/config';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountStr) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountStr)),
      });
    }
}

const db = admin.firestore();

async function run() {
  const users = await db.collection('users').get();
  let fixCount = 0;

  console.log(`Found ${users.docs.length} users.`);

  for (let udoc of users.docs) {
    const user = udoc.data();
    if (user.balanceUSD === 0 || user.balanceUSD === undefined) {
      // Recompute balance for this user
      const txs = await db.collection('transactions').where('userId', '==', udoc.id).get();
      let calculatedBalance = 0;
      let total_deposited = 0;
      let total_spent = 0;
      let referralEarnings = 0;

      txs.forEach(txSnap => {
         const tx = txSnap.data();
         const amount = Number(tx.amountUSD) || 0;
         
         const isTopUpPaid = tx.type === 'topup' && (tx.status === 'paid' || tx.status === 'completed' || tx.status === 'success' || tx.status === 'OK' || tx.status === 'COMPLETED');
         const isDepositPaid = tx.type === 'deposit' && (tx.status === 'paid' || tx.status === 'completed' || tx.status === 'success');
         const isReferralPaid = tx.type === 'referral_bonus' && (tx.status === 'paid' || tx.status === 'completed');
         
         if (isTopUpPaid || isDepositPaid) {
            calculatedBalance += amount;
            total_deposited += amount;
         }
         if (isReferralPaid) {
            calculatedBalance += amount;
            referralEarnings += amount;
         }

         const isPurchase = tx.type === 'purchase' || tx.type === 'p2p_buy' || tx.type === 'buy';
         const isWithdraw = tx.type === 'withdraw' && tx.status !== 'rejected';
         const isChildPanel = tx.type === 'child_panel';

         if (isPurchase || isWithdraw || isChildPanel) {
            calculatedBalance -= amount;
            total_spent += amount;
         }
      });

      if (calculatedBalance > 0) {
        console.log(`User ${udoc.id} (email: ${user.email}): calculated balance: ${calculatedBalance}, was 0`);
        await db.collection('users').doc(udoc.id).update({
            balanceUSD: calculatedBalance,
            total_deposited,
            total_spent,
            referralEarnings
        });
        fixCount++;
      }
    }
  }

  console.log(`Fixed ${fixCount} user balances.`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
