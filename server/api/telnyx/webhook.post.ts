// Telnyx webhook handler for Nitro
// This file handles POST requests to /api/telnyx/webhook

// @ts-ignore - Nitro types are auto-imported
export default defineEventHandler(async (event) => {
  try {
    // @ts-ignore
    const body = await readBody(event);
    console.log("Telnyx webhook received:", body);
    
    // Return 200 OK to acknowledge receipt
    return {
      success: true,
    };
  } catch (e) {
    console.error("Webhook error:", e);
    // @ts-ignore
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid JSON",
    });
  }
});
