import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
admin.initializeApp({ projectId: 'gen-lang-client-0153398594' });
const db = getFirestore(admin.app(), 'ai-studio-a59e8237-1517-4ad0-bc85-5f6d85bf1708');
db.collection('users').limit(1).get().then(snap => console.log('users:', snap.size)).catch(e => console.error(e));
