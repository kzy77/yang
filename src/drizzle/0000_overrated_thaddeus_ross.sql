-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."tabledefs" AS ENUM('PKEY_INTERNAL', 'PKEY_EXTERNAL', 'FKEYS_INTERNAL', 'FKEYS_EXTERNAL', 'COMMENTS', 'FKEYS_NONE', 'INCLUDE_TRIGGERS', 'NO_TRIGGERS');--> statement-breakpoint
CREATE TABLE "snake_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_name" varchar(50) NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"c_custkey" integer PRIMARY KEY NOT NULL,
	"c_name" text NOT NULL,
	"c_address" text NOT NULL,
	"c_nationkey" integer NOT NULL,
	"c_phone" text NOT NULL,
	"c_acctbal" numeric(15, 2) NOT NULL,
	"c_mktsegment" text NOT NULL,
	"c_comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nation" (
	"n_nationkey" integer PRIMARY KEY NOT NULL,
	"n_name" text NOT NULL,
	"n_regionkey" integer NOT NULL,
	"n_comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"o_orderkey" bigint PRIMARY KEY NOT NULL,
	"o_custkey" integer NOT NULL,
	"o_orderstatus" text NOT NULL,
	"o_totalprice" numeric(15, 2) NOT NULL,
	"o_orderdate" timestamp with time zone NOT NULL,
	"o_orderpriority" text NOT NULL,
	"o_clerk" text NOT NULL,
	"o_shippriority" integer NOT NULL,
	"o_comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part" (
	"p_partkey" integer PRIMARY KEY NOT NULL,
	"p_name" text NOT NULL,
	"p_mfgr" text NOT NULL,
	"p_brand" text NOT NULL,
	"p_type" text NOT NULL,
	"p_size" integer NOT NULL,
	"p_container" text NOT NULL,
	"p_retailprice" numeric(15, 2) NOT NULL,
	"p_comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "region" (
	"r_regionkey" integer PRIMARY KEY NOT NULL,
	"r_name" text NOT NULL,
	"r_comment" text
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"s_suppkey" integer PRIMARY KEY NOT NULL,
	"s_name" text NOT NULL,
	"s_address" text NOT NULL,
	"s_nationkey" integer NOT NULL,
	"s_phone" text NOT NULL,
	"s_acctbal" numeric(15, 2) NOT NULL,
	"s_comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_results" (
	"id" serial NOT NULL,
	"username" varchar,
	"score" integer,
	"completion_time_ms" integer,
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "partsupp" (
	"ps_partkey" integer NOT NULL,
	"ps_suppkey" integer NOT NULL,
	"ps_availqty" integer NOT NULL,
	"ps_supplycost" numeric(15, 2) NOT NULL,
	"ps_comment" text NOT NULL,
	CONSTRAINT "partsupp_pkey" PRIMARY KEY("ps_partkey","ps_suppkey")
);
--> statement-breakpoint
CREATE TABLE "lineitem" (
	"l_orderkey" bigint NOT NULL,
	"l_partkey" integer NOT NULL,
	"l_suppkey" integer NOT NULL,
	"l_linenumber" integer NOT NULL,
	"l_quantity" numeric(15, 2) NOT NULL,
	"l_extendedprice" numeric(15, 2) NOT NULL,
	"l_discount" numeric(15, 2) NOT NULL,
	"l_tax" numeric(15, 2) NOT NULL,
	"l_returnflag" text NOT NULL,
	"l_linestatus" text NOT NULL,
	"l_shipdate" timestamp with time zone NOT NULL,
	"l_commitdate" timestamp with time zone NOT NULL,
	"l_receiptdate" timestamp with time zone NOT NULL,
	"l_shipinstruct" text NOT NULL,
	"l_shipmode" text NOT NULL,
	"l_comment" text NOT NULL,
	CONSTRAINT "lineitem_pkey" PRIMARY KEY("l_orderkey","l_linenumber")
);
--> statement-breakpoint
CREATE INDEX "lineitem_cluster_index_0" ON "lineitem" USING btree ("l_shipdate" int8_ops,"l_orderkey" int8_ops);
*/