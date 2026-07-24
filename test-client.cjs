const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function run() {
  try {
    console.log('Testing public list/get on accounts...');
    const q = query(collection(db, 'accounts'), limit(1));
    const snap = await getDocs(q);
    console.log('Fetch accounts succeeded! Size:', snap.size);
  } catch (e) {
    console.error('Fetch accounts failed:', e);
  }
}
run();
