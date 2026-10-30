import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Database helper functions
export async function getDb() {
  const client = await clientPromise;
  return client.db('mpesa_showcase');
}

export async function createUser(userData) {
  const db = await getDb();
  const collection = db.collection('users');
  
  const user = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(user);
  return { ...user, _id: result.insertedId };
}
export async function getUserByEmail(email) {
  const db = await getDb();
  const collection = db.collection('users');
  return await collection.findOne({ email });
}

export async function getUserByUsername(username) {
  const db = await getDb();
  const collection = db.collection('users');
  return await collection.findOne({ username });
}

export async function getUserByPhone(phone) {
  const db = await getDb();
  const collection = db.collection('users');
  return await collection.findOne({ phone });
}

export async function createTransaction(transactionData) {
  const db = await getDb();
  const collection = db.collection('transactions');
  
  const transaction = {
    ...transactionData,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'pending'
  };
  
  const result = await collection.insertOne(transaction);
  return { ...transaction, _id: result.insertedId };
}

export async function updateTransaction(checkoutRequestId, updateData) {
  const db = await getDb();
  const collection = db.collection('transactions');
  
  const result = await collection.findOneAndUpdate(
    { checkoutRequestId },
    { 
      $set: { 
        ...updateData, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result.value;
}
