// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDe4vDivaXdD8xmEQ-dkryYf8ugHc7f0tE",
  authDomain: "task-buddy-a4d76.firebaseapp.com",
  projectId: "task-buddy-a4d76",
  storageBucket: "task-buddy-a4d76.firebasestorage.app",
  messagingSenderId: "368825302395",
  appId: "1:368825302395:web:9a009467ee323c8f20d1de",
  measurementId: "G-8PDSZJ5S9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app)
export const storage = getStorage(app);

const analytics = getAnalytics(app); 