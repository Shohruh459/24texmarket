// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbBmD_HEzsqeDpsKxhR60PyIMYyIyNBNo",
  authDomain: "transuzrent.firebaseapp.com",
  databaseURL: "https://transuzrent-default-rtdb.firebaseio.com",
  projectId: "transuzrent",
  storageBucket: "transuzrent.firebasestorage.app",
  messagingSenderId: "785346373558",
  appId: "1:785346373558:web:02a60d3dd74c743d52c317"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export { auth, db, storage, provider };
