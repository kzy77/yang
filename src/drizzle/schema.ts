import { pgTable, serial, varchar, integer, timestamp, text, numeric, bigint, primaryKey, index, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const tabledefs = pgEnum("tabledefs", ['PKEY_INTERNAL', 'PKEY_EXTERNAL', 'FKEYS_INTERNAL', 'FKEYS_EXTERNAL', 'COMMENTS', 'FKEYS_NONE', 'INCLUDE_TRIGGERS', 'NO_TRIGGERS'])


export const snakeScores = pgTable("snake_scores", {
	id: serial().primaryKey().notNull(),
	playerName: varchar("player_name", { length: 50 }).notNull(),
	score: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const customer = pgTable("customer", {
	cCustkey: integer("c_custkey").primaryKey().notNull(),
	cName: text("c_name").notNull(),
	cAddress: text("c_address").notNull(),
	cNationkey: integer("c_nationkey").notNull(),
	cPhone: text("c_phone").notNull(),
	cAcctbal: numeric("c_acctbal", { precision: 15, scale:  2 }).notNull(),
	cMktsegment: text("c_mktsegment").notNull(),
	cComment: text("c_comment").notNull(),
});

export const nation = pgTable("nation", {
	nNationkey: integer("n_nationkey").primaryKey().notNull(),
	nName: text("n_name").notNull(),
	nRegionkey: integer("n_regionkey").notNull(),
	nComment: text("n_comment").notNull(),
});

export const orders = pgTable("orders", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	oOrderkey: bigint("o_orderkey", { mode: "number" }).primaryKey().notNull(),
	oCustkey: integer("o_custkey").notNull(),
	oOrderstatus: text("o_orderstatus").notNull(),
	oTotalprice: numeric("o_totalprice", { precision: 15, scale:  2 }).notNull(),
	oOrderdate: timestamp("o_orderdate", { withTimezone: true, mode: 'string' }).notNull(),
	oOrderpriority: text("o_orderpriority").notNull(),
	oClerk: text("o_clerk").notNull(),
	oShippriority: integer("o_shippriority").notNull(),
	oComment: text("o_comment").notNull(),
});

export const part = pgTable("part", {
	pPartkey: integer("p_partkey").primaryKey().notNull(),
	pName: text("p_name").notNull(),
	pMfgr: text("p_mfgr").notNull(),
	pBrand: text("p_brand").notNull(),
	pType: text("p_type").notNull(),
	pSize: integer("p_size").notNull(),
	pContainer: text("p_container").notNull(),
	pRetailprice: numeric("p_retailprice", { precision: 15, scale:  2 }).notNull(),
	pComment: text("p_comment").notNull(),
});

export const region = pgTable("region", {
	rRegionkey: integer("r_regionkey").primaryKey().notNull(),
	rName: text("r_name").notNull(),
	rComment: text("r_comment"),
});

export const supplier = pgTable("supplier", {
	sSuppkey: integer("s_suppkey").primaryKey().notNull(),
	sName: text("s_name").notNull(),
	sAddress: text("s_address").notNull(),
	sNationkey: integer("s_nationkey").notNull(),
	sPhone: text("s_phone").notNull(),
	sAcctbal: numeric("s_acctbal", { precision: 15, scale:  2 }).notNull(),
	sComment: text("s_comment").notNull(),
});

export const gameResults = pgTable("game_results", {
	id: serial().notNull(),
	username: varchar(),
	score: integer(),
	completionTimeMs: integer("completion_time_ms"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
});

export const partsupp = pgTable("partsupp", {
	psPartkey: integer("ps_partkey").notNull(),
	psSuppkey: integer("ps_suppkey").notNull(),
	psAvailqty: integer("ps_availqty").notNull(),
	psSupplycost: numeric("ps_supplycost", { precision: 15, scale:  2 }).notNull(),
	psComment: text("ps_comment").notNull(),
}, (table) => [
	primaryKey({ columns: [table.psPartkey, table.psSuppkey], name: "partsupp_pkey"}),
]);

export const lineitem = pgTable("lineitem", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lOrderkey: bigint("l_orderkey", { mode: "number" }).notNull(),
	lPartkey: integer("l_partkey").notNull(),
	lSuppkey: integer("l_suppkey").notNull(),
	lLinenumber: integer("l_linenumber").notNull(),
	lQuantity: numeric("l_quantity", { precision: 15, scale:  2 }).notNull(),
	lExtendedprice: numeric("l_extendedprice", { precision: 15, scale:  2 }).notNull(),
	lDiscount: numeric("l_discount", { precision: 15, scale:  2 }).notNull(),
	lTax: numeric("l_tax", { precision: 15, scale:  2 }).notNull(),
	lReturnflag: text("l_returnflag").notNull(),
	lLinestatus: text("l_linestatus").notNull(),
	lShipdate: timestamp("l_shipdate", { withTimezone: true, mode: 'string' }).notNull(),
	lCommitdate: timestamp("l_commitdate", { withTimezone: true, mode: 'string' }).notNull(),
	lReceiptdate: timestamp("l_receiptdate", { withTimezone: true, mode: 'string' }).notNull(),
	lShipinstruct: text("l_shipinstruct").notNull(),
	lShipmode: text("l_shipmode").notNull(),
	lComment: text("l_comment").notNull(),
}, (table) => [
	index("lineitem_cluster_index_0").using("btree", table.lShipdate.asc().nullsLast().op("int8_ops"), table.lOrderkey.asc().nullsLast().op("int8_ops")),
	primaryKey({ columns: [table.lOrderkey, table.lLinenumber], name: "lineitem_pkey"}),
]);
