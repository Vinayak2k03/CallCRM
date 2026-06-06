import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

// Server function to handle webhook
const handleWebhook = createServerFn({ method: "POST" })
  .handler(async () => {
    return { success: true };
  });

export const Route = createFileRoute("/api/telnyx/webhook")({
  // Use loader/action for server-side handling
  loader: async () => {
    // This won't be called for POST, but we need it for the route to exist
    return null;
  },
});
