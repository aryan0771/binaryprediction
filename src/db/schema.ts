import { pgTable, serial, text, timestamp, integer, decimal, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('USER'), // 'USER' | 'ADMIN'
  diamondBalance: integer('diamond_balance').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const markets = pgTable('markets', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  optionA: text('option_a').notNull().default('YES'),
  optionB: text('option_b').notNull().default('NO'),
  category: text('category').notNull().default('GENERAL'),
  status: text('status').notNull().default('OPEN'), // 'OPEN' | 'CLOSED' | 'SETTLED'
  winningOption: text('winning_option'), // 'YES' | 'NO' | null
  createdAt: timestamp('created_at').notNull().defaultNow(),
  closedAt: timestamp('closed_at'),
  settledAt: timestamp('settled_at'),
});

export const marketPools = pgTable('market_pools', {
  id: serial('id').primaryKey(),
  marketId: integer('market_id').notNull().references(() => markets.id),
  yesPool: integer('yes_pool').notNull().default(0),
  noPool: integer('no_pool').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bets = pgTable('bets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  marketId: integer('market_id').notNull().references(() => markets.id),
  option: text('option').notNull(), // 'YES' | 'NO'
  diamonds: integer('diamonds').notNull(),
  payout: integer('payout'), // null until settled
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'BET_PLACED' | 'BET_REFUND' | 'WINNING_PAYOUT' | 'COMMISSION' | 'ADJUSTMENT'
  amount: integer('amount').notNull(),
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  description: text('description').notNull(),
  referenceId: integer('reference_id'), // could be betId, marketId, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const commissionLogs = pgTable('commission_logs', {
  id: serial('id').primaryKey(),
  marketId: integer('market_id').notNull().references(() => markets.id),
  amount: integer('amount').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  oldDataJson: json('old_data_json'),
  newDataJson: json('new_data_json'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bets: many(bets),
  transactions: many(transactions),
}));

export const marketsRelations = relations(markets, ({ one, many }) => ({
  pools: one(marketPools, {
    fields: [markets.id],
    references: [marketPools.marketId],
  }),
  bets: many(bets),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.userId],
    references: [users.id],
  }),
  market: one(markets, {
    fields: [bets.marketId],
    references: [markets.id],
  }),
}));
