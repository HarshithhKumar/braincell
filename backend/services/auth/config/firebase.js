import { applicationDefault, initializeApp } from "firebase-admin";

export const app=initializeApp({
  credential: applicationDefault()
});