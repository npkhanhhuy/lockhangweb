// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAi0oKz6njA2iP98PDiGZEcCBrZA-IvXTI",
  authDomain: "projectlockhang-df6a5.firebaseapp.com",
  projectId: "projectlockhang-df6a5",
  storageBucket: "projectlockhang-df6a5.appspot.com",
  messagingSenderId: "509417888473",
  appId: "1:509417888473:web:150b0cdf50a4e70bc9bcc8",
  measurementId: "G-3QY6X363HL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;
