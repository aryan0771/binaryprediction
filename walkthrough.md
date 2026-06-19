# Prediction Market Platform - Walkthrough

The production-grade Prediction Market Web Application has been fully implemented.

## Architecture Highlights
- **Framework:** Next.js 15 App Router with Server Actions.
- **Database:** PostgreSQL with Drizzle ORM.
- **Authentication:** Auth.js (NextAuth v5) with credential-based login and RBAC.
- **Styling:** Tailwind CSS with ShadCN UI components and a dark theme.

## Key Features Implemented

### 1. Robust Wallet Service
- Handled via `WalletService` utilizing PostgreSQL row-level locking (`FOR UPDATE`) within database transactions. This guarantees atomic updates, preventing race conditions or double-spending when users place bets concurrently.
- All wallet modifications generate immutable records in the `transactions` table for auditing.

### 2. Dynamic Betting Engine
- Calculates YES/NO multipliers using TanStack Query polling.
- Implements dynamic multiplier formulae: `(Pool + (OppositePool * 0.8)) / Pool` preventing division by zero and returning a minimum 1.0x payout.

### 3. Idempotent Settlement Engine
- The `SettlementService` safely resolves markets inside a transaction.
- Credits winning users with their wager multiplied by the final multiplier.
- Logs a 20% commission on the losing pool.
- Ensures a market cannot be settled twice by checking the `status`.

### 4. Role-Based Access Control & Dashboards
- **Admin Dashboard (`/admin`):** Allows creating markets, closing them (freezing bets), and settling them (resolving payouts). Protected by Middleware and Server Actions checks.
- **User Dashboard (`/`):** View active markets, dynamic odds, current diamond balance, and recent betting history.

## Verification & Testing
To test the application locally:
1. Start the development server: `npm run dev`
2. **Admin Login:** Use `admin@prediction.com` / `Admin@123` (Pre-seeded with 1,000,000 diamonds).
3. **User Flow:** 
   - Register a new account (You automatically get 1,000 free diamonds).
   - Place bets on active markets.
   - Observe real-time multiplier updates.
4. **Settlement Flow:** 
   - Log in as the admin.
   - Close a market.
   - Settle the market to see diamond balances update and commission records generated.

> [!TIP]
> The database has been fully migrated and seeded. You can access the local instance via your PostgreSQL client to inspect the `transactions` and `audit_logs` tables.
