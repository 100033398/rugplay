import { pgTable, text, timestamp, boolean, decimal, serial, varchar, integer, primaryKey, pgEnum, index, unique } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum('transaction_type', ['BUY', 'SELL']);

export const user = pgTable("user", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	isAdmin: boolean("is_admin").default(false),
	isBanned: boolean("is_banned").default(false),
	banReason: text("ban_reason"),
	baseCurrencyBalance: decimal("base_currency_balance", {
		precision: 20,
		scale: 8,
	}).notNull().default("10000.00000000"), // 10,000 *BUSS
	bio: varchar("bio", { length: 160 }).default("Hello am 48 year old man from somalia. Sorry for my bed england. I selled my wife for internet connection for play “conter stirk”"),
	username: varchar("username", { length: 30 }).notNull().unique(),

	lastRewardClaim: timestamp("last_reward_claim", { withTimezone: true }),
	totalRewardsClaimed: decimal("total_rewards_claimed", {
		precision: 20,
		scale: 8,
	}).notNull().default("0.00000000"),
	loginStreak: integer("login_streak").notNull().default(0)
});

export const session = pgTable("session", {
	id: serial("id").primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: serial("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, }),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
	id: serial("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const coin = pgTable("coin", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	symbol: varchar("symbol", { length: 10 }).notNull().unique(),
	icon: text("icon"), // New field for coin icon
	creatorId: integer("creator_id").references(() => user.id, { onDelete: "set null", }), // Coin can exist even if creator is deleted
	initialSupply: decimal("initial_supply", { precision: 30, scale: 8 }).notNull(),
	circulatingSupply: decimal("circulating_supply", { precision: 30, scale: 8 }).notNull(),
	currentPrice: decimal("current_price", { precision: 20, scale: 8 }).notNull(), // Price in base currency
	marketCap: decimal("market_cap", { precision: 30, scale: 2 }).notNull(),
	volume24h: decimal("volume_24h", { precision: 30, scale: 2 }).default("0.00"),
	change24h: decimal("change_24h", { precision: 10, scale: 4 }).default("0.0000"), // Percentage
	poolCoinAmount: decimal("pool_coin_amount", { precision: 30, scale: 8 }).notNull().default("0.00000000"),
	poolBaseCurrencyAmount: decimal("pool_base_currency_amount", { precision: 30, scale: 8, }).notNull().default("0.00000000"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	isListed: boolean("is_listed").default(true).notNull(),
});

export const userPortfolio = pgTable("user_portfolio", {
	userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	coinId: integer("coin_id").notNull().references(() => coin.id, { onDelete: "cascade" }),
	quantity: decimal("quantity", { precision: 30, scale: 8 }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.userId, table.coinId] }),
		};
	},
);

export const transaction = pgTable("transaction", {
	id: serial("id").primaryKey(),
	userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	coinId: integer("coin_id").notNull().references(() => coin.id, { onDelete: "cascade" }),
	type: transactionTypeEnum("type").notNull(),
	quantity: decimal("quantity", { precision: 30, scale: 8 }).notNull(),
	pricePerCoin: decimal("price_per_coin", { precision: 20, scale: 8 }).notNull(),
	totalBaseCurrencyAmount: decimal("total_base_currency_amount", { precision: 30, scale: 8 }).notNull(),
	timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const priceHistory = pgTable("price_history", {
	id: serial("id").primaryKey(),
	coinId: integer("coin_id").notNull().references(() => coin.id, { onDelete: "cascade" }),
	price: decimal("price", { precision: 20, scale: 8 }).notNull(),
	timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const comment = pgTable("comment", {
	id: serial("id").primaryKey(),
	userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	coinId: integer("coin_id").notNull().references(() => coin.id, { onDelete: "cascade" }),
	content: varchar("content", { length: 500 }).notNull(),
	likesCount: integer("likes_count").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => {
	return {
		userIdIdx: index("comment_user_id_idx").on(table.userId),
		coinIdIdx: index("comment_coin_id_idx").on(table.coinId),
	};
});

export const commentLike = pgTable("comment_like", {
	userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	commentId: integer("comment_id").notNull().references(() => comment.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.userId, table.commentId] }),
	};
});

export const promoCode = pgTable('promo_code', {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: text('description'),
    rewardAmount: decimal('reward_amount', { precision: 20, scale: 8 }).notNull(),
    maxUses: integer('max_uses'), // null = unlimited
    isActive: boolean('is_active').notNull().default(true),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: integer('created_by').references(() => user.id),
});

export const promoCodeRedemption = pgTable('promo_code_redemption', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => user.id),
    promoCodeId: integer('promo_code_id').notNull().references(() => promoCode.id),
    rewardAmount: decimal('reward_amount', { precision: 20, scale: 8 }).notNull(),
    redeemedAt: timestamp('redeemed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    userPromoUnique: unique().on(table.userId, table.promoCodeId),
}));
