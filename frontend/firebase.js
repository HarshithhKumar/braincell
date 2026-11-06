import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  authDomain: "braincell-34a61.firebaseapp.com",
  projectId: "braincell-34a61",
  storageBucket: "braincell-34a61.firebasestorage.app",
  messagingSenderId: "550768913424",
  appId: "1:550768913424:web:94a9bbd1e1def3fc09ee95",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
