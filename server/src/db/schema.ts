import {
  pgTable, pgEnum, integer, text, boolean, timestamp, bigint, jsonb,
  uniqueIndex, index,
} from 'drizzle-orm/pg-core';

export const boutiqueRole = pgEnum('boutique_role', ['manager', 'staff']);
export const movementType = pgEnum('movement_type', ['in', 'out']);   
export const txType       = pgEnum('tx_type', ['income', 'expense']);       
export const recordStatus = pgEnum('record_status', ['active', 'cancelled']);

const money = (name: string) => bigint(name, { mode: 'number' }); // no decimal

// Users table
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// boutique table
export const boutiques = pgTable('boutiques', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  logoPath: text('logo_path'),
  pinHash: text('pin_hash'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

//boutique_users (who works where, and their role) 
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

// products table (belong to a boutique) 
export const products = pgTable('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  boutiqueId: integer('boutique_id').notNull().references(() => boutiques.id),
  name: text('name').notNull(),    
  nameKey: text('name_key').notNull(),     // lowercase+trimmed,
  photoPath: text('photo_path'),
  quantity: integer('quantity').notNull().default(0),
  costPrice: money('cost_price').notNull().default(0), 
  lastBoughtQty: integer('last_bought_qty').notNull().default(0),
  lastSellPrice: money('last_sell_price'),
  minQuantity: integer('min_quantity').notNull().default(5),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // case-insensitive
  uniqueIndex('products_boutique_namekey').on(t.boutiqueId, t.nameKey),
]);

// table stock_movements (stock in / stock out)
export const stockMovements = pgTable('stock_movements', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  boutiqueId: integer('boutique_id').notNull().references(() => boutiques.id),
  productId: integer('product_id').notNull().references(() => products.id),
  type: movementType('type').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: money('unit_price').notNull(),
  total: money('total').notNull(),                      
  costPriceAtSale: money('cost_price_at_sale'),      
  belowCost: boolean('below_cost').notNull().default(false),
  recordedBy: integer('recorded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  status: recordStatus('status').notNull().default('active'),
  cancelledBy: integer('cancelled_by').references(() => users.id),
  cancelReason: text('cancel_reason'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
}, (t) => [

  index('movements_boutique_date').on(t.boutiqueId, t.createdAt),
  
  index('movements_user').on(t.recordedBy),
]);

// table other_transactions (rent, transport, etc.) 
export const otherTransactions = pgTable('other_transactions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  boutiqueId: integer('boutique_id').notNull().references(() => boutiques.id),
  type: txType('type').notNull(),
  description: text('description').notNull(),  
  amount: money('amount').notNull(),
  recordedBy: integer('recorded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  status: recordStatus('status').notNull().default('active'),
  cancelledBy: integer('cancelled_by').references(() => users.id),
  cancelReason: text('cancel_reason'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
}, (t) => [
  index('other_tx_boutique_date').on(t.boutiqueId, t.createdAt),
]);

// table audit_log (who did what, and when)
export const auditLog = pgTable('audit_log', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').references(() => users.id),
  boutiqueId: integer('boutique_id').references(() => boutiques.id),
  action: text('action').notNull(),     // e.g. "PIN_CHANGED", "USER_CREATED"
  details: jsonb('details'),            // flexible extra info, varies per action
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});