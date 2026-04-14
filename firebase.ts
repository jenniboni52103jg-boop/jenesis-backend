import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyA0fcv1Q3oIQFjuQmg7RzV-RyECoudqkYU",
  authDomain: "jenniferai.firebaseapp.com",
  projectId: "jenniferai",
  storageBucket: "jenniferai.firebasestorage.app",
  messagingSenderId: "205077231736",
  appId: "1:205077231736:web:3c5ae61705b9f89219958d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
