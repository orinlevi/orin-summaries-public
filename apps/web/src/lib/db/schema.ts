/**
 * Drizzle ORM schema — defines the PostgreSQL tables.
 *
 * 5 tables:
 * - users: central user record (email, timestamps)
 * - purchases: payment records (Lemon Squeezy or coupon)
 * - progress: unit completion tracking per course
 * - coupons: coupon codes with expiry and limits
 * - coupon_redemptions: who used which coupon
 *
 * All tables use ON DELETE CASCADE — deleting a user
 * automatically removes their purchases, progress, and redemptions.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ── users ─────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastLogin: timestamp("last_login", { withTimezone: true }),
});

// ── purchases ─────────────────────────────────────────────
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull().default("semester"),
  source: text("source").notNull().default("lemon-squeezy"), // 'lemon-squeezy' | 'coupon'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ── progress ──────────────────────────────────────────────
export const progress = pgTable(
  "progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    courseId: text("course_id").notNull(),
    unitId: integer("unit_id").notNull(),
    status: text("status").notNull().default("viewed"), // 'viewed' | 'completed'
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // Each user can have only one record per course+unit
    uniqUserCourseUnit: unique().on(table.userId, table.courseId, table.unitId),
  })
);

// ── coupons ───────────────────────────────────────────────
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").unique().notNull(),
  maxUses: integer("max_uses").default(0), // 0 = unlimited
  expiresAt: timestamp("expires_at", { withTimezone: true }), // null = no expiry
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdBy: text("created_by").notNull(),
});

// ── coupon_redemptions ────────────────────────────────────
export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: serial("id").primaryKey(),
    couponId: integer("coupon_id")
      .references(() => coupons.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // Each user can redeem a coupon only once
    uniqCouponUser: unique().on(table.couponId, table.userId),
  })
);
