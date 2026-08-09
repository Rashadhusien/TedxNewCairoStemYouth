import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function checkOrder() {
  const orderId = "1c8de598-8e2f-4b05-87c3-fd53eaedddbc";
  console.log("Checking order:", orderId);

  try {
    // Check order
    const orders = await sql.query(`
      SELECT * FROM orders WHERE id = $1
    `, [orderId]);
    
    if (orders.length === 0) {
      console.log("✗ Order not found");
      return;
    }
    
    const order = orders[0];
    console.log("\n=== ORDER DETAILS ===");
    console.log("ID:", order.id);
    console.log("Status:", order.status);
    console.log("User ID:", order.user_id);
    console.log("Package ID:", order.package_id);
    console.log("Package Name:", order.package_name);
    console.log("Package Ticket Count:", order.package_ticket_count);
    console.log("Package Price Per Ticket (piastres):", order.package_price_per_ticket_piastres);
    console.log("Original Amount (piastres):", order.original_amount_piastres);
    console.log("Discount (piastres):", order.discount_piastres);
    console.log("Final Amount (piastres):", order.final_amount_piastres);
    console.log("Final Amount (EGP):", order.final_amount_piastres / 100);
    console.log("Promo Code:", order.promo_code);
    console.log("Kashier Session ID:", order.kashier_session_id);
    console.log("Payment Reference:", order.payment_reference);
    console.log("Created At:", order.created_at);
    console.log("Updated At:", order.updated_at);
    
    // Check tickets for this order
    const tickets = await sql.query(`
      SELECT * FROM tickets WHERE order_id = $1
    `, [orderId]);
    
    console.log("\n=== TICKETS ===");
    console.log("Number of tickets:", tickets.length);
    
    tickets.forEach((ticket: any, index: number) => {
      console.log(`\nTicket ${index + 1}:`);
      console.log("  ID:", ticket.id);
      console.log("  Status:", ticket.status);
      console.log("  User ID:", ticket.user_id);
      console.log("  Price Paid (piastres):", ticket.price_paid);
      console.log("  Price Paid (EGP):", ticket.price_paid / 100);
      console.log("  Payment Method:", ticket.payment_method);
      console.log("  Attendee Name:", ticket.attendee_name);
      console.log("  Attendee Email:", ticket.attendee_email);
    });
    
    // Check package details
    const packages = await sql.query(`
      SELECT * FROM packages WHERE id = $1
    `, [order.package_id]);
    
    if (packages.length > 0) {
      const pkg = packages[0];
      console.log("\n=== PACKAGE DETAILS ===");
      console.log("ID:", pkg.id);
      console.log("Name:", pkg.name);
      console.log("Ticket Count:", pkg.ticket_count);
      console.log("Price Per Ticket (piastres):", pkg.price_per_ticket_piastres);
      console.log("Price Per Ticket (EGP):", pkg.price_per_ticket_piastres / 100);
      console.log("Discounted Price Per Ticket (piastres):", pkg.discounted_price_per_ticket_piastres);
      console.log("Discounted Price Per Ticket (EGP):", pkg.discounted_price_per_ticket_piastres ? pkg.discounted_price_per_ticket_piastres / 100 : 'N/A');
      console.log("Total Price (piastres):", pkg.total_price_piastres);
      console.log("Total Price (EGP):", pkg.total_price_piastres / 100);
      console.log("Is Active:", pkg.is_active);
      console.log("Is Promo Applicable:", pkg.is_promo_applicable);
    }
    
    // Expected amount from webhook
    const webhookAmount = 1350; // 1350 EGP from logs
    const webhookAmountPiastres = webhookAmount * 100;
    console.log("\n=== WEBHOOK VALIDATION ===");
    console.log("Webhook Amount (EGP):", webhookAmount);
    console.log("Webhook Amount (piastres):", webhookAmountPiastres);
    console.log("Order Final Amount (piastres):", order.final_amount_piastres);
    console.log("Amount Match:", webhookAmountPiastres === order.final_amount_piastres ? "✓ YES" : "✗ NO");
    
    // Check individual ticket amounts
    console.log("\n=== TICKET AMOUNT VALIDATION ===");
    const expectedTicketPrice = order.final_amount_piastres / order.package_ticket_count;
    console.log("Expected price per ticket (piastres):", expectedTicketPrice);
    console.log("Expected price per ticket (EGP):", expectedTicketPrice / 100);
    
    tickets.forEach((ticket: any, index: number) => {
      const match = ticket.price_paid === expectedTicketPrice;
      console.log(`Ticket ${index + 1} price match: ${match ? "✓ YES" : "✗ NO"} (${ticket.price_paid} vs ${expectedTicketPrice})`);
    });
    
  } catch (error) {
    console.error("✗ Error checking order:", error);
  }
}

checkOrder().catch(console.error);
