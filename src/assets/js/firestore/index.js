import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTPFJow4HK1J6pKDBio60IXre3hA04M6I",
  authDomain: "javascript-chat-385b1.firebaseapp.com",
  projectId: "javascript-chat-385b1",
  storageBucket: "javascript-chat-385b1.appspot.com",
  messagingSenderId: "195052201416",
  appId: "1:195052201416:web:cc2dfcd8e3f2f0c05f8cfd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }