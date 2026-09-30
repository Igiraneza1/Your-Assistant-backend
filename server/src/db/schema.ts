import {
  pgTable, pgEnum, integer, text, boolean, timestamp, uniqueIndex,
} from 'drizzle-orm/pg-core';

// An enum = a column that can only ever hold one of these exact words
export const boutiqueRole = pgEnum('boutique_role', ['manager', 'staff']);

// ---------- Table 1: users ----------
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Table 2: boutiques ----------
export const boutiques = pgTable('boutiques', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  logoPath: text('logo_path'),
  pinHash: text('pin_hash'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Table 3: boutique_users (who works where, and their role) ----------
export const boutiqueUsers = pgTable('boutique_users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  boutiqueId: integer('boutique_id').notNull().references(() => boutiques.id),
  role: boutiqueRole('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // one person can't be added to the same boutique twice
  uniqueIndex('boutique_users_unique').on(t.userId, t.boutiqueId),
]);