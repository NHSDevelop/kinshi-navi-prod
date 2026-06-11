import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { uniqueIndex } from "drizzle-orm/sqlite-core";

export const storeTypeValues = ["ATTRACTION", "FOOD"] as const;
export type StoreType = (typeof storeTypeValues)[number];

export const ticketStatusValues = [
  "ISSUED",
  "CALLED",
  "COMPLETED",
  "CANCELED",
  "DISABLED",
] as const;
export type TicketStatus = (typeof ticketStatusValues)[number];

export const stockChangedReasonValues = ["SELLING"] as const;
export type StockChangedReason = (typeof stockChangedReasonValues)[number];

export const roleValues = [
  "SUPER_ADMIN",
  "EVENT_ADMIN",
  "STORE_ADMIN",
  "STAFF",
] as const;
export type Role = (typeof roleValues)[number];

export const inviteTargetRoleValues = [
  "EVENT_ADMIN",
  "STORE_ADMIN",
  "STAFF",
] as const;
export type InviteTargetRole = (typeof inviteTargetRoleValues)[number];

export const foodTagValues = ["CLASS_BOOTH", "CONCIL_BOOTH", "OTHER"] as const;

export type FoodTag = (typeof foodTagValues)[number];

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  isAnonymous: integer("isAnonymous", { mode: "boolean" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});

export const events = sqliteTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  imageUrl: text("imageUrl"),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(false),
  isMain: integer("isMain", { mode: "boolean" }).notNull().default(false),
  isVoting: integer("isVoting", { mode: "boolean" }).default(true),
  isVoteShowing: integer("isVoteShowing", { mode: "boolean" }).default(true),
  startedAtDate: integer("startedAtDate", { mode: "timestamp_ms" }),
  startedAtTime: text("startedAtTime"),
  finishedAtDate: integer("finishedAtDate", { mode: "timestamp_ms" }),
  finishedAtTime: text("finishedAtTime"),
  description: text("description"),
  adminCode: text("admin_code").$defaultFn(() => createId()),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Event = typeof events.$inferSelect;

export const stores = sqliteTable("stores", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  imageUrl: text("imageUrl"),
  apparanceImageUrl: text("apparace_image_url"),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(false),
  startedAtDate: integer("startedAtDate", { mode: "timestamp_ms" }),
  startedAtTime: text("startedAtTime"),
  finishedAtDate: integer("finishedAtDate", { mode: "timestamp_ms" }),
  finishedAtTime: text("finishedAtTime"),
  description: text("description"),
  storeType: text("storeType", { enum: storeTypeValues })
    .$type<StoreType>()
    .notNull(),
  eventId: text("eventId")
    .references(() => events.id)
    .notNull(),
  canVoted: integer("can_voted", { mode: "boolean" }).notNull().default(true),
  adminCode: text("admin_code").$defaultFn(() => createId()),
  staffCode: text("staff_code").$defaultFn(() => createId()),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Store = typeof stores.$inferSelect;

export const attractions = sqliteTable("attractions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  playTime: integer("playTime").default(5),
  peopleCapacity: integer("peopleCapacity").notNull().default(5),
  storeId: text("storeId")
    .notNull()
    .unique()
    .references(() => stores.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Attraction = typeof attractions.$inferSelect;

export const foods = sqliteTable("foods", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  storeId: text("storeId")
    .notNull()
    .unique()
    .references(() => stores.id, { onDelete: "cascade" }),
  tag: text("tag", { enum: foodTagValues }).default("OTHER"),
  isUseLane: integer("isUseLane", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Food = typeof foods.$inferSelect;

export const tickets = sqliteTable("tickets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  index: integer("index").notNull(),
  numberOfPeople: integer("numberOfPeople").notNull(),
  status: text("status", { enum: ticketStatusValues })
    .$type<TicketStatus>()
    .notNull()
    .default("ISSUED"),
  isPaper: integer("isPaper", { mode: "boolean" }).notNull().default(false),
  attractionId: text("attractionId")
    .notNull()
    .references(() => attractions.id),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Ticket = typeof tickets.$inferSelect;

export const items = sqliteTable("items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  stock: integer("stock").notNull().default(0),
  price: integer("price").notNull(),
  imageUrl: text("imageUrl"),
  foodId: text("foodId")
    .notNull()
    .references(() => foods.id, { onDelete: "cascade" }),
  description: text("description"),
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Item = typeof items.$inferSelect;

export const stockLogs = sqliteTable("stock_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  itemId: text("itemId")
    .notNull()
    .references(() => items.id),
  difference: integer("difference").notNull(),
  meta: text("meta"),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type StockLog = typeof stockLogs.$inferSelect;

export const registerLanes = sqliteTable(
  "register_lanes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    eventId: text("eventId")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    foodId: text("foodId").references(() => foods.id, { onDelete: "set null" }),
    laneNumber: integer("laneNumber"),
    name: text("name"),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    eventIdLaneNumberUnique: uniqueIndex(
      "register_lanes_event_id_lane_number_unique",
    ).on(table.eventId, table.laneNumber),
  }),
);

export type RegisterLane = typeof registerLanes.$inferSelect;

export const registerLaneFoods = sqliteTable(
  "register_lane_foods",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    laneId: text("laneId")
      .notNull()
      .references(() => registerLanes.id, { onDelete: "cascade" }),
    foodId: text("foodId")
      .notNull()
      .references(() => foods.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    laneFoodUnique: uniqueIndex(
      "register_lane_foods_lane_id_food_id_unique",
    ).on(table.laneId, table.foodId),
  }),
);

export type RegisterLaneFood = typeof registerLaneFoods.$inferSelect;

export const registerLogs = sqliteTable("register_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  laneId: text("laneId").references(() => registerLanes.id),
  foodId: text("foodId").references(() => foods.id),
  totalAmount: integer("total_amount").notNull(),
  amountPaid: integer("amount_paid").notNull(),
  meta: text("meta"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;

export const admins = sqliteTable("admins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: roleValues }).$type<Role>().notNull(),
  eventId: text("eventId").references(() => events.id),
  storeId: text("storeId").references(() => stores.id),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Admin = typeof admins.$inferSelect;

export const staffs = sqliteTable("staffs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  storeId: text("storeId")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Staff = typeof staffs.$inferSelect;

export const invites = sqliteTable("invites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  tokenHash: text("tokenHash").notNull().unique(),
  issuerAdminId: text("issuerAdminId").references(() => admins.id),
  issuerScope: text("issuerScope", { enum: roleValues })
    .$type<Role>()
    .notNull(),
  targetScope: text("targetScope", { enum: inviteTargetRoleValues })
    .$type<InviteTargetRole>()
    .notNull(),
  eventId: text("eventId").references(() => events.id, {
    onDelete: "cascade",
  }),
  storeId: text("storeId").references(() => stores.id, {
    onDelete: "cascade",
  }),
  maxUses: integer("maxUses").notNull().default(1),
  usedCount: integer("usedCount").notNull().default(0),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  usedAt: integer("usedAt", { mode: "timestamp_ms" }),
  revokedAt: integer("revokedAt", { mode: "timestamp_ms" }),
  acceptedByUserId: text("acceptedByUserId").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Invite = typeof invites.$inferSelect;

export const systemInfos = sqliteTable("system_infos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  meta: text("meta").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type SystemInfo = typeof systemInfos.$inferSelect;

export const pdfDocuments = sqliteTable("pdf_documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull().unique(),
  fileName: text("fileName").notNull(),
  mimeType: text("mimeType").notNull(),
  fileSize: integer("fileSize").notNull(),
  isPublished: integer("isPublished", { mode: "boolean" })
    .notNull()
    .default(true),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type PdfDocument = typeof pdfDocuments.$inferSelect;

export const storeVotes = sqliteTable(
  "store_votes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    storeId: text("storeId")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    storeType: text("storeType", { enum: storeTypeValues })
      .$type<StoreType>()
      .notNull(),
    eventId: text("eventId")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("userId").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    userStoreTypeUnique: uniqueIndex(
      "store_votes_user_id_store_type_unique",
    ).on(table.userId, table.storeType, table.eventId),
  }),
);

export type StoreVote = typeof storeVotes.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  admins: many(admins),
  staffs: many(staffs),
  tickets: many(tickets),
  pushSubscriptions: many(pushSubscriptions),
  storeVotes: many(storeVotes),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

export const storesRelations = relations(stores, ({ one, many }) => ({
  event: one(events, {
    fields: [stores.eventId],
    references: [events.id],
  }),
  attraction: one(attractions, {
    fields: [stores.id],
    references: [attractions.storeId],
  }),
  food: one(foods, {
    fields: [stores.id],
    references: [foods.storeId],
  }),
  admins: many(admins),
  staffs: many(staffs),
  storeVotes: many(storeVotes),
}));

export const storeVotesRelations = relations(storeVotes, ({ one }) => ({
  user: one(users, {
    fields: [storeVotes.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [storeVotes.storeId],
    references: [stores.id],
  }),
  event: one(events, {
    fields: [storeVotes.eventId],
    references: [events.id],
  }),
}));

export const attractionsRelations = relations(attractions, ({ one, many }) => ({
  store: one(stores, {
    fields: [attractions.storeId],
    references: [stores.id],
  }),
  tickets: many(tickets),
}));

export const foodsRelations = relations(foods, ({ one, many }) => ({
  store: one(stores, {
    fields: [foods.storeId],
    references: [stores.id],
  }),
  items: many(items),
  registerLanes: many(registerLanes),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  attraction: one(attractions, {
    fields: [tickets.attractionId],
    references: [attractions.id],
  }),
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  food: one(foods, {
    fields: [items.foodId],
    references: [foods.id],
  }),
  stockLogs: many(stockLogs),
}));

export const stockLogsRelations = relations(stockLogs, ({ one }) => ({
  item: one(items, {
    fields: [stockLogs.itemId],
    references: [items.id],
  }),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  user: one(users, {
    fields: [admins.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [admins.eventId],
    references: [events.id],
  }),
  store: one(stores, {
    fields: [admins.storeId],
    references: [stores.id],
  }),
}));

export const invitesRelations = relations(invites, ({ one }) => ({
  issuerAdmin: one(admins, {
    fields: [invites.issuerAdminId],
    references: [admins.id],
  }),
  event: one(events, {
    fields: [invites.eventId],
    references: [events.id],
  }),
  store: one(stores, {
    fields: [invites.storeId],
    references: [stores.id],
  }),
  acceptedByUser: one(users, {
    fields: [invites.acceptedByUserId],
    references: [users.id],
  }),
}));

export const staffsRelations = relations(staffs, ({ one }) => ({
  user: one(users, {
    fields: [staffs.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [staffs.storeId],
    references: [stores.id],
  }),
}));

export const registerLanesRelations = relations(
  registerLanes,
  ({ one, many }) => ({
    event: one(events, {
      fields: [registerLanes.eventId],
      references: [events.id],
    }),
    store: one(foods, {
      fields: [registerLanes.foodId],
      references: [foods.id],
    }),
    registerLogs: many(registerLogs),
  }),
);

export const registerLogsRelations = relations(registerLogs, ({ one }) => ({
  lane: one(registerLanes, {
    fields: [registerLogs.laneId],
    references: [registerLanes.id],
  }),
  food: one(foods, {
    fields: [registerLogs.foodId],
    references: [foods.id],
  }),
}));