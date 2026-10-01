CREATE TYPE "public"."movement_type" AS ENUM('in', 'out');--> statement-breakpoint
CREATE TYPE "public"."record_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"boutique_id" integer,
	"action" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "other_transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "other_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"boutique_id" integer NOT NULL,
	"type" "tx_type" NOT NULL,
	"description" text NOT NULL,
	"amount" bigint NOT NULL,
	"recorded_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "record_status" DEFAULT 'active' NOT NULL,
	"cancelled_by" integer,
	"cancel_reason" text,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"boutique_id" integer NOT NULL,
	"name" text NOT NULL,
	"name_key" text NOT NULL,
	"photo_path" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"cost_price" bigint DEFAULT 0 NOT NULL,
	"last_bought_qty" integer DEFAULT 0 NOT NULL,
	"last_sell_price" bigint,
	"min_quantity" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stock_movements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"boutique_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"type" "movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" bigint NOT NULL,
	"total" bigint NOT NULL,
	"cost_price_at_sale" bigint,
	"below_cost" boolean DEFAULT false NOT NULL,
	"recorded_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "record_status" DEFAULT 'active' NOT NULL,
	"cancelled_by" integer,
	"cancel_reason" text,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_boutique_id_boutiques_id_fk" FOREIGN KEY ("boutique_id") REFERENCES "public"."boutiques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "other_transactions" ADD CONSTRAINT "other_transactions_boutique_id_boutiques_id_fk" FOREIGN KEY ("boutique_id") REFERENCES "public"."boutiques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "other_transactions" ADD CONSTRAINT "other_transactions_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "other_transactions" ADD CONSTRAINT "other_transactions_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_boutique_id_boutiques_id_fk" FOREIGN KEY ("boutique_id") REFERENCES "public"."boutiques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_boutique_id_boutiques_id_fk" FOREIGN KEY ("boutique_id") REFERENCES "public"."boutiques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "other_tx_boutique_date" ON "other_transactions" USING btree ("boutique_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "products_boutique_namekey" ON "products" USING btree ("boutique_id","name_key");--> statement-breakpoint
CREATE INDEX "movements_boutique_date" ON "stock_movements" USING btree ("boutique_id","created_at");--> statement-breakpoint
CREATE INDEX "movements_user" ON "stock_movements" USING btree ("recorded_by");