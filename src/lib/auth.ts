import { cookies } from "next/headers";
import { getAdmin, getUser, type AdminUser, type User } from "./store";

const USER_COOKIE = "propicks_uid";
const ADMIN_COOKIE = "propicks_admin";

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(USER_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await getCurrentUserId();
  if (!id) return null;
  return (await getUser(id)) ?? null;
}

export async function setCurrentUserId(id: string) {
  const store = await cookies();
  store.set(USER_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function clearCurrentUserId() {
  const store = await cookies();
  store.delete(USER_COOKIE);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const id = store.get(ADMIN_COOKIE)?.value;
  if (!id) return null;
  return (await getAdmin(id)) ?? null;
}

export async function setCurrentAdmin(id: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearCurrentAdmin() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;
export const USER_COOKIE_NAME = USER_COOKIE;
