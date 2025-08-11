// lib/auth.ts
import { ID } from "appwrite";
import { account } from "../appwrite/client";

export async function signUp(email: string, password: string, name: string) {
  return await account.create(ID.unique(), email, password, name);
}

export async function logIn(email: string, password: string) {
  return await account.createEmailPasswordSession(email, password);
}

export async function getUser() {
  return await account.get();
}

export async function logOut() {
  return await account.deleteSession("current");
}
