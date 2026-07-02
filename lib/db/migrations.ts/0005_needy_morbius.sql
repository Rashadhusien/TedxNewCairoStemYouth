ALTER TABLE "tickets" ADD COLUMN "payment_gateway_order_id" varchar(255);--> statement-breakpoint
CREATE INDEX "tickets_gateway_order_idx" ON "tickets" USING btree ("payment_gateway_order_id");