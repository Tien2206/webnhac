import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLWao8b3630KHbfEZITCr4aMdkSTpvMss",
  authDomain: "website-nghe-nhac-895ee.firebaseapp.com",
  projectId: "website-nghe-nhac-895ee",
  storageBucket: "website-nghe-nhac-895ee.firebasestorage.app",
  messagingSenderId: "283132938700",
  appId: "1:283132938700:web:c978939740684b6a9fb569",
  measurementId: "G-TDR7DGC5XQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
