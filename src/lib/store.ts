// File-backed "ledger" for local dev, Postgres-backed (via @vercel/postgres)
// for production/Vercel — stands in for a real relational database in this
// demo. The important discipline mirrors a production system: balances are
// never stored as a raw editable number, they're always derived from an
// append-only transaction log, and every state change is mirrored into the
// audit log.
//
// Persistence mode: if process.env.POSTGRES_URL is set, the entire Store
// object is persisted as a single JSON blob in a `kv_store` table (key
// 'main'). This keeps Vercel serverless deployments (no shared filesystem,
// no guaranteed warm instances) working correctly, while local development
// without that env var keeps using the exact same file-based behavior as
// before.

import fs from "node:fs";
import path from "node:path";
import { sql } from "@vercel/postgres";
import { getMatchById, pickResult } from "./sportsdata";
import { hashPassword, verifyPassword } from "./passwords";
import { detectCurrencyFromPhone } from "./currencies";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

export type TxType = "Deposit" | "Withdrawal" | "Bet Stake" | "Bet Payout" | "Bet Refund";
export type TxStatus = "Pending" | "Processing" | "Successful" | "Failed" | "Rejected" | "Reversed";

export type Transaction = {
  id: string;
  userId: string;
  type: TxType;
  amount: number; // signed: credits positive, debits negative
  status: TxStatus;
  reference: string;
  method?: string;
  destination?: string;
  createdAt: string;
  processedBy?: string;
};

export type UserStatus = "Active" | "Suspended" | "Pending Verification" | "Self-Excluded";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  registeredAt: string;
  status: UserStatus;
  country: string;
  currencyCode: string;
  currencySymbol: string;
};

export type Selection = {
  matchId: string;
  matchLabel: string;
  market: string;
  pick: string;
  label: string;
  odds: number;
};

export type BetStatus = "Pending" | "Won" | "Lost" | "Cancelled" | "Void" | "Refunded";

export type Bet = {
  id: string;
  userId: string;
  selections: Selection[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  status: BetStatus;
  placedAt: string;
  settledAt?: string;
};

export type MarketStatus = "Open" | "Suspended" | "Closed";

export type CustomMarketOption = { pick: string; label: string; odds: number };
export type CustomMarketStatus = "Open" | "Suspended" | "Closed" | "Settled";

export type CustomMarket = {
  id: string;
  sport: string;
  title: string;
  description: string;
  options: CustomMarketOption[];
  status: CustomMarketStatus;
  winningPick?: string;
  createdAt: string;
  createdBy: string;
  settledAt?: string;
  settledBy?: string;
};

export type AdminRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN"
  | "FINANCE_ADMIN"
  | "SPORTS_ADMIN"
  | "SUPPORT_ADMIN"
  | "READ_ONLY_ADMIN";

export type AdminUser = {
  id: string;
  username: string;
  password: string; // demo only — never do this in production
  name: string;
  role: AdminRole;
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  category:
    | "Login"
    | "Bets"
    | "Deposits"
    | "Withdrawals"
    | "Account"
    | "Markets"
    | "Settlement"
    | "Permissions"
    | "Security";
  previous?: string;
  next?: string;
  reference?: string;
};

export type PaymentMethodKey = "bitcoin" | "usdt" | "paypal" | "skrill" | "revolut";

export type PaymentMethod = {
  key: PaymentMethodKey;
  label: string;
  details: string; // wallet address / email / tag, depending on method
  network?: string; // e.g. "TRC20" for USDT, "BTC" for Bitcoin
  instructions: string;
  enabled: boolean;
};

export type SiteSettings = {
  supportEmail: string;
  supportPhone: string;
  address: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    whatsapp: string;
    tiktok: string;
  };
};

export type SupportMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "New" | "Read" | "Replied";
  userId?: string;
};

export type NotificationCategory = "Bets" | "Deposits" | "Withdrawals" | "Support" | "Account" | "Announcement";

export type Notification = {
  id: string;
  userId: string;
  message: string;
  category: NotificationCategory;
  href?: string;
  createdAt: string;
  read: boolean;
};


type Store = {
  users: User[];
  transactions: Transaction[];
  bets: Bet[];
  marketOverrides: Record<string, MarketStatus>;
  admins: AdminUser[];
  auditLog: AuditEntry[];
  paymentMethods: PaymentMethod[];
  supportMessages: SupportMessage[];
  siteSettings: SiteSettings;
  notifications: Notification[];
  customMarkets: CustomMarket[];
};

const DEMO_USER_ID = "u1";

function seed(): Store {
  const now = new Date();
  const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();
  const demoHash = hashPassword("demo1234");
  return {
    users: [
      { id: DEMO_USER_ID, name: "Alex Morgan", username: "alex.morgan", email: "alex.morgan@email.com", phone: "+234 801 234 5566", passwordHash: demoHash, registeredAt: iso(210), status: "Active", country: "Nigeria", currencyCode: "NGN", currencySymbol: "₦" },
      { id: "u2", name: "Chidinma Okafor", username: "chidinma.o", email: "chidinma.o@email.com", phone: "+234 802 345 1122", passwordHash: demoHash, registeredAt: iso(560), status: "Active", country: "Nigeria", currencyCode: "NGN", currencySymbol: "₦" },
      { id: "u3", name: "Daniel Reyes", username: "daniel.r", email: "daniel.reyes@email.com", phone: "+1 305 987 4410", passwordHash: demoHash, registeredAt: iso(290), status: "Active", country: "United States", currencyCode: "USD", currencySymbol: "$" },
      { id: "u4", name: "James Whitfield", username: "james.w", email: "james.whitfield@email.com", phone: "+44 7911 118402", passwordHash: demoHash, registeredAt: iso(350), status: "Suspended", country: "United Kingdom", currencyCode: "GBP", currencySymbol: "£" },
      { id: "u5", name: "Kelechi Nwosu", username: "kelechi.n", email: "kelechi.n@email.com", phone: "+234 807 887 1129", passwordHash: demoHash, registeredAt: iso(14), status: "Pending Verification", country: "Nigeria", currencyCode: "NGN", currencySymbol: "₦" },
    ],
    transactions: [
      { id: "TXN-10001", userId: DEMO_USER_ID, type: "Deposit", amount: 50000, status: "Successful", reference: "DEP-A1B2C3", method: "Bank Transfer", createdAt: iso(9) },
      { id: "TXN-10002", userId: DEMO_USER_ID, type: "Deposit", amount: 200000, status: "Successful", reference: "DEP-D4E5F6", method: "Bank Transfer", createdAt: iso(6) },
      { id: "TXN-10003", userId: DEMO_USER_ID, type: "Withdrawal", amount: -30000, status: "Rejected", reference: "WD-1A2B3C", destination: "GTBank •••• 4821", createdAt: iso(4) },
    ],
    bets: [],
    marketOverrides: {},
    admins: [{ id: "a1", username: "admin", password: "pro123", name: "Riley Chan", role: "SUPER_ADMIN" }],
    auditLog: [
      { id: "LOG-1", timestamp: iso(9), actor: "System", action: "Deposit processed", target: "Alex Morgan", category: "Deposits", reference: "DEP-A1B2C3", next: "status: successful" },
      { id: "LOG-2", timestamp: iso(4), actor: "Farah Nasser", action: "Rejected withdrawal", target: "Alex Morgan", category: "Withdrawals", previous: "status: pending", next: "status: rejected", reference: "WD-1A2B3C" },
    ],
    paymentMethods: [
      {
        key: "bitcoin",
        label: "Bitcoin",
        details: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        network: "BTC",
        instructions: "Send exactly this amount in BTC to the address above, then paste your transaction hash as the reference.",
        enabled: true,
      },
      {
        key: "usdt",
        label: "USDT",
        details: "TXn9Kk2ND1u1sK3wR8h9y7fQeZBvVvVvVv",
        network: "TRC20",
        instructions: "Send USDT (TRC20 network only) to the address above, then paste your transaction hash as the reference.",
        enabled: true,
      },
      {
        key: "paypal",
        label: "PayPal",
        details: "payments@propicksarena.com",
        instructions: "Send as Friends & Family to the PayPal email above, then use your reference code as the note.",
        enabled: true,
      },
      {
        key: "skrill",
        label: "Skrill",
        details: "payments@propicksarena.com",
        instructions: "Send to the Skrill email above and use your reference code as the payment note.",
        enabled: true,
      },
      {
        key: "revolut",
        label: "Revolut",
        details: "@propicksarena",
        instructions: "Send to the Revolut tag above and include your reference code in the payment message.",
        enabled: true,
      },
    ],
    supportMessages: [],
    notifications: [],
    customMarkets: [
      {
        id: "SPECIAL-1",
        sport: "Football",
        title: "Propicks Anniversary Giveaway — Guess the Weekend Top Scorer",
        description: "Pick who you think will score the most goals across all tracked fixtures this weekend. Winner announced manually once the weekend's results are confirmed.",
        options: [
          { pick: "a", label: "A striker from 3. Liga", odds: 2.5 },
          { pick: "b", label: "A striker from 2. Bundesliga", odds: 2.2 },
          { pick: "c", label: "Tied / no clear leader", odds: 4 },
        ],
        status: "Open",
        createdAt: iso(2),
        createdBy: "Riley Chan",
      },
    ],
    siteSettings: {
      supportEmail: "support@propicksarena.com",
      supportPhone: "+234 700 123 4567",
      address: "12 Adeola Odeku Street, Victoria Island, Lagos, Nigeria",
      socials: {
        facebook: "https://facebook.com/propicksarena",
        twitter: "https://x.com/propicksarena",
        instagram: "https://instagram.com/propicksarena",
        whatsapp: "https://wa.me/2347001234567",
        tiktok: "https://tiktok.com/@propicksarena",
      },
    },
  };
}

// Backfills fields that may be missing from a Store previously persisted
// (file or Postgres) before those fields existed. Shared by both the
// file-based and Postgres-based read paths.
function backfill(parsed: Partial<Store>): Store {
  if (!parsed.supportMessages) parsed.supportMessages = [];
  if (!parsed.siteSettings) parsed.siteSettings = seed().siteSettings;
  if (!parsed.notifications) parsed.notifications = [];
  if (!parsed.customMarkets) parsed.customMarkets = seed().customMarkets;
  if (!parsed.paymentMethods) parsed.paymentMethods = seed().paymentMethods;
  for (const u of parsed.users ?? []) {
    if (!u.currencyCode) {
      const c = detectCurrencyFromPhone(u.phone ?? "");
      u.country = c.country;
      u.currencyCode = c.currencyCode;
      u.currencySymbol = c.symbol;
    }
  }
  return parsed as Store;
}

function ensureFile(): Store {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const s = seed();
    fs.writeFileSync(DATA_FILE, JSON.stringify(s, null, 2));
    return s;
  }
  const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Partial<Store>;
  return backfill(parsed);
}

let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  await sql`CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value JSONB NOT NULL)`;
  tableEnsured = true;
}

async function loadFromPostgres(): Promise<Store> {
  await ensureTable();
  const { rows } = await sql`SELECT value FROM kv_store WHERE key = 'main'`;
  if (rows.length === 0) {
    const seeded = seed();
    await sql`INSERT INTO kv_store (key, value) VALUES ('main', ${JSON.stringify(seeded)}::jsonb)`;
    return seeded;
  }
  return backfill(rows[0].value as Partial<Store>);
}

async function saveToPostgres(store: Store) {
  await ensureTable();
  await sql`
    INSERT INTO kv_store (key, value) VALUES ('main', ${JSON.stringify(store)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}

async function read(): Promise<Store> {
  if (process.env.POSTGRES_URL) return loadFromPostgres();
  return ensureFile();
}

async function write(store: Store): Promise<void> {
  if (process.env.POSTGRES_URL) {
    await saveToPostgres(store);
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

let seq = 1000;
function genId(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${(seq % 1000).toString(36).toUpperCase()}`;
}
function genRef(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

export function getDemoUserId() {
  return DEMO_USER_ID;
}

export async function getUser(userId: string): Promise<User | undefined> {
  return (await read()).users.find((u) => u.id === userId);
}

export async function listUsers(): Promise<User[]> {
  return (await read()).users;
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  return (await read())
    .transactions.filter((t) => t.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBalances(userId: string): Promise<{ available: number; pending: number }> {
  const txs = (await read()).transactions.filter((t) => t.userId === userId);
  let available = 0;
  let pending = 0;
  for (const t of txs) {
    if (t.type === "Withdrawal") {
      if (t.status === "Pending" || t.status === "Processing") {
        pending += Math.abs(t.amount);
        available += t.amount; // held out of available while pending
      } else if (t.status === "Successful") {
        available += t.amount;
      }
      // Rejected / Reversed: funds never left, ignore entirely
    } else if (t.type === "Deposit") {
      if (t.status === "Pending" || t.status === "Processing") {
        pending += Math.abs(t.amount);
      } else if (t.status === "Successful") {
        available += t.amount;
      }
    } else {
      if (t.status === "Successful") available += t.amount;
    }
  }
  return { available: round2(available), pending: round2(pending) };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function addAudit(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const store = await read();
  store.auditLog.unshift({ id: genId("LOG"), timestamp: new Date().toISOString(), ...entry });
  await write(store);
}

export async function listAudit(): Promise<AuditEntry[]> {
  return (await read()).auditLog;
}

export async function pushNotification(userId: string, message: string, category: NotificationCategory, href?: string) {
  const store = await read();
  store.notifications.unshift({
    id: genId("NTF"),
    userId,
    message,
    category,
    href,
    createdAt: new Date().toISOString(),
    read: false,
  });
  await write(store);
}

// Admin-triggered sends — always audit-logged with who sent it, to how many
// people, and the exact message (never a silent push).
export async function adminSendNotification(target: { userId: string } | { all: true }, message: string, adminName: string): Promise<{ recipients: number }> {
  const store = await read();
  const recipients = "all" in target ? store.users.map((u) => u.id) : [target.userId];
  for (const uid of recipients) {
    store.notifications.unshift({
      id: genId("NTF"),
      userId: uid,
      message,
      category: "Announcement",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }
  await write(store);
  const targetLabel = "all" in target ? `All users (${recipients.length})` : store.users.find((u) => u.id === recipients[0])?.name ?? recipients[0];
  await addAudit({
    actor: adminName,
    action: "Sent a notification",
    target: targetLabel,
    category: "Account",
    next: message.length > 140 ? message.slice(0, 140) + "…" : message,
  });
  return { recipients: recipients.length };
}

export async function listNotifications(userId: string): Promise<Notification[]> {
  return (await read())
    .notifications.filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30);
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  return (await read()).notifications.filter((n) => n.userId === userId && !n.read).length;
}

export async function markNotificationsRead(userId: string) {
  const store = await read();
  for (const n of store.notifications) {
    if (n.userId === userId) n.read = true;
  }
  await write(store);
}

// ---------- Auth ----------

export async function createUser(input: { name: string; email: string; username: string; phone: string; password: string }): Promise<User> {
  const store = await read();
  const clash = store.users.find(
    (u) => u.username.toLowerCase() === input.username.toLowerCase() || u.email.toLowerCase() === input.email.toLowerCase()
  );
  if (clash) throw new Error("An account with that username or email already exists");
  const currency = detectCurrencyFromPhone(input.phone);
  const user: User = {
    id: genId("USR").toLowerCase(),
    name: input.name,
    username: input.username,
    email: input.email,
    phone: input.phone,
    passwordHash: hashPassword(input.password),
    registeredAt: new Date().toISOString(),
    status: "Active",
    country: currency.country,
    currencyCode: currency.currencyCode,
    currencySymbol: currency.symbol,
  };
  store.users.push(user);
  pushNotificationToStore(
    store,
    user.id,
    `Welcome to Propicks Arena, ${user.name.split(" ")[0]}! Fund your wallet and place your first bet whenever you're ready.`,
    "Announcement"
  );
  await write(store);
  await addAudit({
    actor: user.name,
    action: "Created account",
    target: user.name,
    category: "Account",
    reference: user.id,
    next: `country: ${currency.country}, currency: ${currency.currencyCode}`,
  });
  return user;
}

export async function verifyCredentials(identifier: string, password: string): Promise<User | null> {
  const store = await read();
  const user = store.users.find((u) => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase());
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const store = await read();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return { ok: false, error: "Account not found." };
  if (!verifyPassword(currentPassword, user.passwordHash)) return { ok: false, error: "Current password is incorrect." };
  if (newPassword.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
  user.passwordHash = hashPassword(newPassword);
  await write(store);
  await addAudit({ actor: user.name, action: "Changed password", target: user.name, category: "Account", reference: user.id });
  return { ok: true };
}

// ---------- Deposits / withdrawals ----------

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return (await read()).paymentMethods;
}

export async function getPaymentMethod(key: PaymentMethodKey): Promise<PaymentMethod | undefined> {
  return (await read()).paymentMethods.find((m) => m.key === key);
}

export async function setPaymentMethod(key: PaymentMethodKey, updates: Omit<PaymentMethod, "key">, adminName: string) {
  const store = await read();
  const idx = store.paymentMethods.findIndex((m) => m.key === key);
  if (idx === -1) throw new Error("Unknown payment method");
  const prev = store.paymentMethods[idx];
  store.paymentMethods[idx] = { key, ...updates };
  await write(store);
  await addAudit({
    actor: adminName,
    action: `Updated ${prev.label} payment details`,
    target: "Platform Settings",
    category: "Deposits",
    previous: `${prev.details}${prev.enabled ? "" : " (disabled)"}`,
    next: `${updates.details}${updates.enabled ? "" : " (disabled)"}`,
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return (await read()).siteSettings;
}

export async function setSiteSettings(settings: SiteSettings, adminName: string) {
  const store = await read();
  store.siteSettings = settings;
  await write(store);
  await addAudit({
    actor: adminName,
    action: "Updated site settings (contact & socials)",
    target: "Platform Settings",
    category: "Account",
  });
}

export async function requestDeposit(userId: string, amount: number, method: string) {
  const store = await read();
  const tx: Transaction = {
    id: genId("TXN"),
    userId,
    type: "Deposit",
    amount,
    status: "Pending",
    reference: genRef("DEP"),
    method,
    createdAt: new Date().toISOString(),
  };
  store.transactions.unshift(tx);
  await write(store);
  const user = store.users.find((u) => u.id === userId);
  await addAudit({
    actor: user?.name ?? userId,
    action: "Requested deposit — awaiting bank transfer confirmation",
    target: user?.name ?? userId,
    category: "Deposits",
    reference: tx.reference,
    next: `status: pending, amount: ₦${amount.toFixed(2)}`,
  });
  return tx;
}

export async function requestWithdrawal(userId: string, amount: number, destination: string) {
  const { available } = await getBalances(userId);
  if (amount > available) throw new Error("Insufficient available balance");
  const store = await read();
  const tx: Transaction = {
    id: genId("TXN"),
    userId,
    type: "Withdrawal",
    amount: -amount,
    status: "Pending",
    reference: genRef("WD"),
    destination,
    createdAt: new Date().toISOString(),
  };
  store.transactions.unshift(tx);
  await write(store);
  const user = store.users.find((u) => u.id === userId);
  await addAudit({
    actor: user?.name ?? userId,
    action: "Requested withdrawal",
    target: user?.name ?? userId,
    category: "Withdrawals",
    next: "status: pending",
    reference: tx.reference,
  });
  return tx;
}

export async function adminReviewTransaction(txId: string, decision: "approve" | "reject", adminName: string) {
  const store = await read();
  const tx = store.transactions.find((t) => t.id === txId);
  if (!tx) throw new Error("Transaction not found");
  const prevStatus = tx.status;
  tx.status = decision === "approve" ? "Successful" : "Rejected";
  tx.processedBy = adminName;
  await write(store);
  const user = store.users.find((u) => u.id === tx.userId);
  await addAudit({
    actor: adminName,
    action: `${decision === "approve" ? "Approved" : "Rejected"} ${tx.type.toLowerCase()}`,
    target: user?.name ?? tx.userId,
    category: tx.type === "Deposit" ? "Deposits" : "Withdrawals",
    previous: `status: ${prevStatus.toLowerCase()}`,
    next: `status: ${tx.status.toLowerCase()}`,
    reference: tx.reference,
  });
  const approved = decision === "approve";
  const amountLabel = `₦${Math.abs(tx.amount).toFixed(2)}`;
  await pushNotification(
    tx.userId,
    tx.type === "Deposit"
      ? approved
        ? `Your deposit of ${amountLabel} was confirmed and added to your balance.`
        : `Your deposit of ${amountLabel} could not be confirmed — contact support if you already sent it.`
      : approved
        ? `Your withdrawal of ${amountLabel} was approved and sent.`
        : `Your withdrawal of ${amountLabel} was rejected — contact support for details.`,
    tx.type === "Deposit" ? "Deposits" : "Withdrawals",
    "/wallet"
  );
  return tx;
}

export async function getMarketStatus(matchId: string): Promise<MarketStatus> {
  return (await read()).marketOverrides[matchId] ?? "Open";
}

export async function listMarketOverrides(): Promise<Record<string, MarketStatus>> {
  return (await read()).marketOverrides;
}

export async function setMarketStatus(matchId: string, status: MarketStatus, adminName: string, matchLabel: string) {
  const store = await read();
  const prev = store.marketOverrides[matchId] ?? "Open";
  store.marketOverrides[matchId] = status;
  await write(store);
  await addAudit({
    actor: adminName,
    action: `${status === "Suspended" ? "Suspended" : status === "Closed" ? "Closed" : "Reopened"} market`,
    target: matchLabel,
    category: "Markets",
    previous: `status: ${prev.toLowerCase()}`,
    next: `status: ${status.toLowerCase()}`,
    reference: matchId,
  });
}

// ---------- Custom / special markets ----------
// Admin-authored markets (any sport, any question). Settlement always
// happens AFTER the fact: an admin marks which of the predefined options
// actually won, once that's genuinely known. There is no way to change a
// market's outcome before or without going through this — and every call
// is audit-logged with who did it and when.

export async function createCustomMarket(input: { sport: string; title: string; description: string; options: CustomMarketOption[] }, adminName: string): Promise<CustomMarket> {
  const store = await read();
  const market: CustomMarket = {
    id: genId("SPECIAL"),
    sport: input.sport,
    title: input.title,
    description: input.description,
    options: input.options,
    status: "Open",
    createdAt: new Date().toISOString(),
    createdBy: adminName,
  };
  store.customMarkets.unshift(market);
  await write(store);
  await addAudit({
    actor: adminName,
    action: "Created special market",
    target: market.title,
    category: "Markets",
    reference: market.id,
    next: `sport: ${market.sport}, options: ${market.options.map((o) => o.label).join(" / ")}`,
  });
  return market;
}

export async function listCustomMarkets(): Promise<CustomMarket[]> {
  return (await read()).customMarkets;
}

export async function getCustomMarket(id: string): Promise<CustomMarket | undefined> {
  return (await read()).customMarkets.find((m) => m.id === id);
}

export async function setCustomMarketStatus(id: string, status: "Open" | "Suspended" | "Closed", adminName: string) {
  const store = await read();
  const market = store.customMarkets.find((m) => m.id === id);
  if (!market) throw new Error("Market not found");
  if (market.status === "Settled") throw new Error("Market is already settled");
  const prev = market.status;
  market.status = status;
  await write(store);
  await addAudit({
    actor: adminName,
    action: `${status === "Suspended" ? "Suspended" : status === "Closed" ? "Closed" : "Reopened"} special market`,
    target: market.title,
    category: "Markets",
    previous: `status: ${prev.toLowerCase()}`,
    next: `status: ${status.toLowerCase()}`,
    reference: market.id,
  });
}

export async function settleCustomMarket(id: string, winningPick: string, adminName: string) {
  const store = await read();
  const market = store.customMarkets.find((m) => m.id === id);
  if (!market) throw new Error("Market not found");
  if (market.status === "Settled") throw new Error("Market is already settled");
  const option = market.options.find((o) => o.pick === winningPick);
  if (!option) throw new Error("Unknown winning option");
  market.status = "Settled";
  market.winningPick = winningPick;
  market.settledAt = new Date().toISOString();
  market.settledBy = adminName;
  await write(store);
  await addAudit({
    actor: adminName,
    action: "Settled special market with the verified outcome",
    target: market.title,
    category: "Settlement",
    previous: "status: open, outcome: unknown",
    next: `outcome: ${option.label}`,
    reference: market.id,
  });
}

export async function listBets(userId?: string): Promise<Bet[]> {
  const bets = (await read()).bets;
  const filtered = userId ? bets.filter((b) => b.userId === userId) : bets;
  return filtered.sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export async function placeBet(userId: string, selections: Selection[], stake: number): Promise<Bet> {
  if (selections.length === 0) throw new Error("No selections");
  if (stake <= 0) throw new Error("Invalid stake");
  const { available } = await getBalances(userId);
  if (stake > available) throw new Error("Insufficient available balance");

  const store = await read();
  for (const s of selections) {
    if (s.matchId.startsWith("SPECIAL-")) {
      const market = store.customMarkets.find((m) => m.id === s.matchId);
      if (!market) throw new Error(`Market for ${s.matchLabel} no longer exists`);
      if (market.status !== "Open") throw new Error(`Market for ${s.matchLabel} is ${market.status.toLowerCase()}`);
      continue;
    }
    const marketStatus = store.marketOverrides[s.matchId] ?? "Open";
    if (marketStatus !== "Open") throw new Error(`Market for ${s.matchLabel} is ${marketStatus.toLowerCase()}`);
  }

  const totalOdds = round2(selections.reduce((acc, s) => acc * s.odds, 1));
  const potentialPayout = round2(totalOdds * stake);
  const bet: Bet = {
    id: genId("BET"),
    userId,
    selections,
    stake,
    totalOdds,
    potentialPayout,
    status: "Pending",
    placedAt: new Date().toISOString(),
  };
  store.bets.unshift(bet);

  const stakeTx: Transaction = {
    id: genId("TXN"),
    userId,
    type: "Bet Stake",
    amount: -stake,
    status: "Successful",
    reference: bet.id,
    createdAt: new Date().toISOString(),
  };
  store.transactions.unshift(stakeTx);
  await write(store);

  const user = store.users.find((u) => u.id === userId);
  await addAudit({
    actor: user?.name ?? userId,
    action: `Placed bet (${selections.length} selection${selections.length > 1 ? "s" : ""})`,
    target: selections.map((s) => s.matchLabel).join(", "),
    category: "Bets",
    next: `stake: ₦${stake.toFixed(2)}, odds: ${totalOdds.toFixed(2)}`,
    reference: bet.id,
  });

  return bet;
}

// Only football selections (matchId prefixed with a tracked league code) are
// resolved against the real live-data feed. Selections from the curated
// demo sports settle via a fixed, deterministic outcome baked into their
// catalog entry (see lib/otherSports.ts) since no free live feed exists for
// them — never a hand-picked admin edit.
export async function settleFinishedBets(actor = "System"): Promise<{ settled: number }> {
  const store = await read();
  let settledCount = 0;
  const { OTHER_SPORTS_RESULTS } = await import("./otherSports");
  const { getLiveFixtureById, espnPickResult, LIVE_LEAGUES } = await import("./espnFeed");
  const liveSlugs = Object.values(LIVE_LEAGUES).map((l) => l.leagueSlug + "-");

  for (const bet of store.bets) {
    if (bet.status !== "Pending") continue;

    const legResults: (boolean | null)[] = await Promise.all(
      bet.selections.map(async (s) => {
        if (s.matchId.startsWith("bl3-") || s.matchId.startsWith("bl2-")) {
          const m = await getMatchById(s.matchId);
          if (!m || m.status !== "finished") return null;
          return pickResult(m) === s.pick;
        }
        if (liveSlugs.some((prefix) => s.matchId.startsWith(prefix))) {
          const f = await getLiveFixtureById(s.matchId);
          if (!f || f.status !== "finished") return null;
          return espnPickResult(f) === s.pick;
        }
        if (s.matchId.startsWith("SPECIAL-")) {
          const market = store.customMarkets.find((m) => m.id === s.matchId);
          if (!market || market.status !== "Settled" || !market.winningPick) return null;
          return market.winningPick === s.pick;
        }
        const fixedResult = OTHER_SPORTS_RESULTS[s.matchId];
        if (!fixedResult) return null;
        return fixedResult === s.pick;
      })
    );
    if (legResults.some((r) => r === null)) continue;

    const won = legResults.every(Boolean);
    bet.status = won ? "Won" : "Lost";
    bet.settledAt = new Date().toISOString();
    settledCount++;

    if (won) {
      const payoutTx: Transaction = {
        id: genId("TXN"),
        userId: bet.userId,
        type: "Bet Payout",
        amount: bet.potentialPayout,
        status: "Successful",
        reference: bet.id,
        createdAt: new Date().toISOString(),
      };
      store.transactions.unshift(payoutTx);
    }

    addAuditToStore(store, {
      actor,
      action: "Settled bet",
      target: bet.selections.map((s) => s.matchLabel).join(", "),
      category: "Settlement",
      previous: "status: pending",
      next: won ? `status: won, payout: ₦${bet.potentialPayout.toFixed(2)}` : "status: lost",
      reference: bet.id,
    });

    const matchLabel = bet.selections.map((s) => s.matchLabel).join(", ");
    pushNotificationToStore(
      store,
      bet.userId,
      won ? `Your bet on ${matchLabel} won — ₦${bet.potentialPayout.toFixed(2)} added to your balance.` : `Your bet on ${matchLabel} didn't come in this time.`,
      "Bets",
      "/account?tab=history"
    );
  }

  await write(store);
  return { settled: settledCount };
}

function addAuditToStore(store: Store, entry: Omit<AuditEntry, "id" | "timestamp">) {
  store.auditLog.unshift({ id: genId("LOG"), timestamp: new Date().toISOString(), ...entry });
}

function pushNotificationToStore(store: Store, userId: string, message: string, category: NotificationCategory, href?: string) {
  store.notifications.unshift({
    id: genId("NTF"),
    userId,
    message,
    category,
    href,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

export async function findAdmin(username: string, password: string): Promise<AdminUser | undefined> {
  return (await read()).admins.find((a) => a.username === username && a.password === password);
}

export async function getAdmin(id: string): Promise<AdminUser | undefined> {
  return (await read()).admins.find((a) => a.id === id);
}

export async function setUserStatus(userId: string, status: UserStatus, adminName: string) {
  const store = await read();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  const prev = user.status;
  user.status = status;
  await write(store);
  await addAudit({
    actor: adminName,
    action: status === "Suspended" ? "Suspended account" : "Reinstated account",
    target: user.name,
    category: "Account",
    previous: `status: ${prev.toLowerCase()}`,
    next: `status: ${status.toLowerCase()}`,
    reference: user.id,
  });
}

export async function userSummary(userId: string) {
  const store = await read();
  const txs = store.transactions.filter((t) => t.userId === userId);
  const deposits = txs.filter((t) => t.type === "Deposit" && t.status === "Successful").reduce((a, t) => a + t.amount, 0);
  const withdrawals = txs.filter((t) => t.type === "Withdrawal" && t.status === "Successful").reduce((a, t) => a + Math.abs(t.amount), 0);
  const bets = store.bets.filter((b) => b.userId === userId);
  return { deposits: round2(deposits), withdrawals: round2(withdrawals), betsCount: bets.length };
}

export async function listAllTransactions(): Promise<(Transaction & { userName: string })[]> {
  const store = await read();
  return store.transactions
    .map((t) => ({ ...t, userName: store.users.find((u) => u.id === t.userId)?.name ?? t.userId }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function platformStats() {
  const store = await read();
  const totalDeposits = store.transactions.filter((t) => t.type === "Deposit" && t.status === "Successful").reduce((a, t) => a + t.amount, 0);
  const totalWithdrawals = store.transactions.filter((t) => t.type === "Withdrawal" && t.status === "Successful").reduce((a, t) => a + Math.abs(t.amount), 0);
  const pendingWithdrawals = store.transactions.filter((t) => t.type === "Withdrawal" && t.status === "Pending");
  const pendingDeposits = store.transactions.filter((t) => t.type === "Deposit" && t.status === "Pending");
  const openBets = store.bets.filter((b) => b.status === "Pending");
  const settledBets = store.bets.filter((b) => b.status === "Won" || b.status === "Lost");
  const stakedTotal = store.transactions.filter((t) => t.type === "Bet Stake").reduce((a, t) => a + Math.abs(t.amount), 0);
  const payoutTotal = store.transactions.filter((t) => t.type === "Bet Payout" && t.status === "Successful").reduce((a, t) => a + t.amount, 0);
  return {
    totalUsers: store.users.length,
    activeUsers: store.users.filter((u) => u.status === "Active").length,
    totalDeposits: round2(totalDeposits),
    totalWithdrawals: round2(totalWithdrawals),
    pendingWithdrawals,
    pendingDeposits,
    totalBets: store.bets.length,
    openBets: openBets.length,
    settledBets: settledBets.length,
    revenue: round2(stakedTotal - payoutTotal),
  };
}

// ---------- Support inbox ----------

export async function submitSupportMessage(input: { name: string; email: string; subject: string; message: string; userId?: string }): Promise<SupportMessage> {
  const store = await read();
  const msg: SupportMessage = {
    id: genId("MSG"),
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    createdAt: new Date().toISOString(),
    status: "New",
    userId: input.userId,
  };
  store.supportMessages.unshift(msg);
  await write(store);
  await addAudit({ actor: input.name, action: "Submitted a support message", target: input.subject, category: "Account", reference: msg.id });
  return msg;
}

export async function listSupportMessages(): Promise<SupportMessage[]> {
  return (await read()).supportMessages;
}

export async function markSupportMessage(id: string, status: SupportMessage["status"], adminName: string) {
  const store = await read();
  const msg = store.supportMessages.find((m) => m.id === id);
  if (!msg) throw new Error("Message not found");
  const prev = msg.status;
  msg.status = status;
  await write(store);
  await addAudit({
    actor: adminName,
    action: `Marked support message as ${status.toLowerCase()}`,
    target: msg.subject,
    category: "Account",
    previous: `status: ${prev.toLowerCase()}`,
    next: `status: ${status.toLowerCase()}`,
    reference: msg.id,
  });
  if (status === "Replied" && msg.userId) {
    await pushNotification(msg.userId, `Support replied to your message "${msg.subject}" — check your email.`, "Support", "/contact");
  }
}
