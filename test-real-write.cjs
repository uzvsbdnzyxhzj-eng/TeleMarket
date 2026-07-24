const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection: clientCollection, 
  doc: clientDoc, 
  getDoc: clientGetDoc, 
  getDocs: clientGetDocs, 
  setDoc: clientSetDoc, 
  updateDoc: clientUpdateDoc, 
  query: clientQuery, 
  where: clientWhere, 
  limit: clientLimit, 
  runTransaction: clientRunTransaction,
  increment: clientIncrement
} = require('firebase/firestore');

const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let databaseId = "(default)";
let firebaseConfig = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
  if (firebaseConfig.firestoreDatabaseId) {
    databaseId = firebaseConfig.firestoreDatabaseId;
  }
}

const firebaseApp = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});
const clientDb = getFirestore(firebaseApp, databaseId);

const SERVER_SECRET = "TG_MARKET_SUPER_SECRET_SALT_2026";

function generateSignature(userId, timestamp) {
  const dataToHash = userId + timestamp.toString() + SERVER_SECRET;
  return crypto.createHash("sha256").update(dataToHash).digest("hex");
}

function appendSignature(colName, docId, data) {
  if (!data || typeof data !== "object") return data;
  
  let userId = data.userId;
  if (!userId && colName === "users") {
    userId = docId;
  }
  
  if (userId) {
    const timestamp = Date.now();
    const signature = generateSignature(userId, timestamp);
    return {
      ...data,
      serverTimestamp: timestamp.toString(),
      serverSignature: signature
    };
  }
  return data;
}

class DocRef {
  constructor(colName, docId, dRef) {
    this.colName = colName;
    this.docId = docId;
    this.dRef = dRef;
  }
  get id() { return this.docId; }
  get path() { return `${this.colName}/${this.docId}`; }
  
  async get() {
    const snap = await clientGetDoc(this.dRef);
    return {
      exists: snap.exists(),
      data: () => snap.data(),
      id: snap.id
    };
  }
  
  async set(data, options) {
    const signedData = appendSignature(this.colName, this.docId, data);
    console.log(`[set] ${this.path}:`, JSON.stringify(signedData, null, 2));
    return clientSetDoc(this.dRef, signedData, options);
  }
  
  async update(data) {
    const signedData = appendSignature(this.colName, this.docId, data);
    console.log(`[update] ${this.path}:`, JSON.stringify(signedData, null, 2));
    const parsedData = { ...signedData };
    for (const key of Object.keys(parsedData)) {
      if (parsedData[key] && parsedData[key]._incrementVal !== undefined) {
        parsedData[key] = clientIncrement(parsedData[key]._incrementVal);
      }
    }
    return clientUpdateDoc(this.dRef, parsedData);
  }
}

class QueryWrapper {
  constructor(colName, initialQuery) {
    this.colName = colName;
    this.q = initialQuery || clientCollection(clientDb, colName);
  }
  
  where(field, op, val) {
    this.q = clientQuery(this.q, clientWhere(field, op, val));
    return this;
  }
  
  limit(l) {
    this.q = clientQuery(this.q, clientLimit(l));
    return this;
  }
  
  async get() {
    const snap = await clientGetDocs(this.q);
    const docs = snap.docs.map(d => ({
      id: d.id,
      data: () => d.data(),
      exists: true
    }));
    return {
      empty: snap.empty,
      size: snap.size,
      docs,
      forEach(cb) {
        docs.forEach(cb);
      }
    };
  }
}

class CollectionWrapper {
  constructor(colName) {
    this.colName = colName;
  }
  
  doc(docId) {
    const id = docId || clientDoc(clientCollection(clientDb, this.colName)).id;
    const dRef = clientDoc(clientDb, this.colName, id);
    return new DocRef(this.colName, id, dRef);
  }
  
  where(field, op, val) {
    return new QueryWrapper(this.colName).where(field, op, val);
  }
  
  async get() {
    return new QueryWrapper(this.colName).get();
  }
}

const db = {
  collection(colName) {
    return new CollectionWrapper(colName);
  },
  
  async runTransaction(cb) {
    return clientRunTransaction(clientDb, async (transaction) => {
      const transactionWrapper = {
        async get(docRefOrQuery) {
          if (docRefOrQuery instanceof QueryWrapper) {
            return docRefOrQuery.get();
          }
          const snap = await transaction.get(docRefOrQuery.dRef);
          return {
            exists: snap.exists(),
            data: () => snap.data(),
            id: snap.id
          };
        },
        
        update(docRefWrapper, data) {
          const signedData = appendSignature(docRefWrapper.colName, docRefWrapper.docId, data);
          console.log(`[tx update] ${docRefWrapper.path}:`, JSON.stringify(signedData, null, 2));
          const parsedData = { ...signedData };
          for (const key of Object.keys(parsedData)) {
            if (parsedData[key] && parsedData[key]._incrementVal !== undefined) {
              parsedData[key] = clientIncrement(parsedData[key]._incrementVal);
            }
          }
          transaction.update(docRefWrapper.dRef, parsedData);
          return this;
        },
        
        set(docRefWrapper, data) {
          const signedData = appendSignature(docRefWrapper.colName, docRefWrapper.docId, data);
          console.log(`[tx set] ${docRefWrapper.path}:`, JSON.stringify(signedData, null, 2));
          const parsedData = { ...signedData };
          for (const key of Object.keys(parsedData)) {
            if (parsedData[key] && parsedData[key]._incrementVal !== undefined) {
              parsedData[key] = clientIncrement(parsedData[key]._incrementVal);
            }
          }
          transaction.set(docRefWrapper.dRef, parsedData);
          return this;
        }
      };
      return cb(transactionWrapper);
    });
  }
};

const admin = {
  firestore: {
    FieldValue: {
      increment(val) {
        return { _incrementVal: val };
      }
    }
  }
};

async function runTests() {
  const testUid = "test_user_telekos_flow_" + Math.floor(Math.random() * 100000);
  console.log("Using testUid:", testUid);

  try {
    // 1. Create user document first under relaxed admin rules? 
    // Wait, let's try to set/create the user document via server approved rules.
    console.log("1. Creating user document...");
    const userRef = db.collection("users").doc(testUid);
    await userRef.set({
      uid: testUid,
      email: "test@example.com",
      name: "Test User",
      role: "user",
      balanceUSD: 100,
      numericId: 12345,
      createdAt: Date.now()
    });
    console.log("User document created successfully!");
  } catch (err) {
    console.error("Failed to create user document:", err);
  }

  try {
    // 2. Try the transaction update on users
    console.log("2. Running user balance deduction transaction...");
    const userRef = db.collection("users").doc(testUid);
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User not found");
      }
      transaction.update(userRef, {
        balanceUSD: admin.firestore.FieldValue.increment(-1.5),
        total_spent: admin.firestore.FieldValue.increment(1.5),
        last_update: Date.now()
      });
    });
    console.log("User balance deduction transaction succeeded!");
  } catch (err) {
    console.error("Failed user balance deduction transaction:", err);
  }

  try {
    // 3. Try creating virtual order
    console.log("3. Creating virtual order document...");
    const orderId = "order_test_" + Math.floor(Math.random() * 100000);
    const orderRef = db.collection("virtual_orders").doc(orderId);
    await orderRef.set({
      userId: testUid,
      userEmail: "test@example.com",
      activationId: orderId,
      phone: "+62812345678",
      serviceCode: "wa",
      serviceName: "WhatsApp",
      countryId: "6",
      countryName: "Indonesia",
      priceIDR: 15000,
      priceUSD: 1.25,
      status: "waiting",
      createdAt: Date.now(),
      last_checked: Date.now()
    });
    console.log("Virtual order document created successfully!");
  } catch (err) {
    console.error("Failed to create virtual order document:", err);
  }

  try {
    // 4. Try creating transaction log
    console.log("4. Creating transaction log...");
    const txRef = db.collection("transactions").doc();
    await txRef.set({
      userId: testUid,
      userEmail: "test@example.com",
      type: "virtual_number_buy",
      txType: "Debit",
      amountUSD: 1.25,
      status: "paid",
      details: { 
        activationId: "order_test_12345", 
        phone: "+62812345678", 
        serviceCode: "wa", 
        serviceName: "WhatsApp" 
      },
      createdAt: Date.now()
    });
    console.log("Transaction log created successfully!");
  } catch (err) {
    console.error("Failed to create transaction log:", err);
  }
}

runTests();
