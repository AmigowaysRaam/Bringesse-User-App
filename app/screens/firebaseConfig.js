// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc",
  authDomain: "your-project.firebaseapp.com",
  projectId: "celtic-artwork-449810-n3",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
