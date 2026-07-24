import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPKQg3ozihEaGhSojBT8KY8W--Q5yoTwc",
  authDomain: "iot-durian-disease-detector.firebaseapp.com",
  projectId: "iot-durian-disease-detector",
  storageBucket: "iot-durian-disease-detector.firebasestorage.app",
  messagingSenderId: "949890335214",
  appId: "1:949890335214:web:a7cdb99081a88052548eff",
  measurementId: "G-4M55DXBX6W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
