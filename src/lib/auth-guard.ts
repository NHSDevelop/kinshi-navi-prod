import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { getDb } from "@/lib/db/drizzle";
import { admins, staffs, stores } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getAuthenticatedUser() {
  const session = await getSessionFromRequestHeaders();

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function getSignedInUser() {
  const user = await getAuthenticatedUser();

  if (!user || user.isAnonymous) {
    return null;
  }

  return user;
}

export async function requireSignedInUser() {
  const user = await getSignedInUser();

  if (!user) {
    redirect("/signin");
  }

  return user;
}

export async function requireSuperAdminUser() {
  const user = await requireSignedInUser();

  if (!(await canSuperAdmin(user.id))) {
    redirect("/signin");
  }

  return user;
}

export async function requireEventAdminUser(eventId: string) {
  const user = await requireSignedInUser();

  if (!(await canManageEvent(user.id, eventId))) {
    redirect("/signin");
  }

  return user;
}

export async function requireStoreAdminUser(storeId: string) {
  const user = await requireSignedInUser();

  if (!(await canManageStore(user.id, storeId))) {
    redirect("/signin");
  }

  return user;
}

export async function requireStaffOrManageStoreUser(storeId: string) {
  const user = await requireSignedInUser();

  if (!(await canStaffOrManageStore(user.id, storeId))) {
    redirect("/signin");
  }

  return user;
}

export async function canSuperAdmin(userId: string) {
  const db = await getDb();
  const rows = await db
    .select({ userId: admins.userId })
    .from(admins)
    .where(and(eq(admins.userId, userId), eq(admins.role, "SUPER_ADMIN")))
    .limit(1);

  return rows.length > 0;
}

export async function canManageEvent(userId: string, eventId: string) {
  const db = await getDb();
  const adminRows = await db
    .select({ role: admins.role, eventId: admins.eventId })
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  if (adminRows.length === 0) {
    return false;
  }

  const admin = adminRows[0];

  if (admin.role === "SUPER_ADMIN") {
    return true;
  }

  return admin.role === "EVENT_ADMIN" && admin.eventId === eventId;
}

export async function canManageStore(userId: string, storeId: string) {
  const db = await getDb();
  const adminRows = await db
    .select({
      role: admins.role,
      eventId: admins.eventId,
      storeId: admins.storeId,
    })
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  if (adminRows.length === 0) {
    return false;
  }

  const admin = adminRows[0];

  if (admin.role === "SUPER_ADMIN") {
    return true;
  }

  if (admin.role === "STORE_ADMIN" && admin.storeId === storeId) {
    return true;
  }

  if (admin.role === "EVENT_ADMIN" && admin.eventId) {
    const storeRows = await db
      .select({ eventId: stores.eventId })
      .from(stores)
      .where(and(eq(stores.id, storeId), eq(stores.eventId, admin.eventId)))
      .limit(1);

    return storeRows.length > 0;
  }

  return false;
}

export async function canStaffOrManageStore(userId: string, storeId: string) {
  const db = await getDb();

  const staffRows = await db
    .select({ storeId: staffs.storeId })
    .from(staffs)
    .where(and(eq(staffs.userId, userId), eq(staffs.storeId, storeId)))
    .limit(1);

  if (staffRows.length > 0) {
    return true;
  }

  return canManageStore(userId, storeId);
}

export async function canUseManagementActions(userId: string) {
  const db = await getDb();

  const adminRows = await db
    .select({ userId: admins.userId })
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  if (adminRows.length > 0) {
    return true;
  }

  const staffRows = await db
    .select({ userId: staffs.userId })
    .from(staffs)
    .where(eq(staffs.userId, userId))
    .limit(1);

  return staffRows.length > 0;
}
