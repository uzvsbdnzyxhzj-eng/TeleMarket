import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const configStr = readFileSync('./firebase-applet-config.json', 'utf-8');
const config = JSON.parse(configStr);

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const mockAccounts = [
  { title: 'Crypto Traders Pro', username: 'cryptotraderspro', type: 'Channel', subscribers: 15400, ageDays: 340, priceUSD: 150, verified: true, topic: 'Finance' },
  { title: 'Local Marketplace', username: 'local_marketplace_gp', type: 'Group', subscribers: 5200, ageDays: 120, priceUSD: 45, verified: false, topic: 'Trading' },
  { title: 'Tech News Daily', username: 'tech_news_daily', type: 'Channel', subscribers: 45000, ageDays: 850, priceUSD: 400, verified: true, topic: 'Technology' },
  { title: 'Gaming Community', username: 'gamers_hub_123', type: 'Group', subscribers: 1250, ageDays: 60, priceUSD: 20, verified: false, topic: 'Gaming' },
  { title: 'Airdrop Hunters', username: 'airdrop_hunters_24', type: 'Channel', subscribers: 25000, ageDays: 400, priceUSD: 250, verified: true, topic: 'Crypto' },
  { title: 'Meme Central', username: 'meme_central_hub', type: 'Channel', subscribers: 8000, ageDays: 200, priceUSD: 70, verified: false, topic: 'Entertainment' },
  { title: 'Travel & Explore', username: 'travel_explore_now', type: 'Channel', subscribers: 12000, ageDays: 500, priceUSD: 120, verified: true, topic: 'Travel' },
  { title: 'Code Insights', username: 'code_insights_community', type: 'Group', subscribers: 3500, ageDays: 150, priceUSD: 60, verified: false, topic: 'Programming' },
];

async function seed() {
  for (const acc of mockAccounts) {
    const accRef = doc(collection(db, 'accounts'));
    await setDoc(accRef, {
      ...acc,
      ownerId: 'admin_seed_data_mock',
      createdAt: Date.now()
    });
  }
  console.log("Seeding complete.");
  process.exit(0);
}

seed();
