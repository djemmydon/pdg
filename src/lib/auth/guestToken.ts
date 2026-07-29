import "server-only";
import jwt from "jsonwebtoken";

interface GuestTokenPayload {
  role: "anon";
  delivery_id: string;
}

const TTL_HOURS = Number(process.env.GUEST_TOKEN_TTL_HOURS ?? "48");

function getSecret() {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("SUPABASE_JWT_SECRET is not set");
  }
  return secret;
}

// Mints a short lived token scoped to exactly one delivery. The "role: anon"
// claim keeps the request mapped to Postgres' anon role (no elevated
// privileges); the "delivery_id" claim is read by request_delivery_id() in
// the RLS policies so the guest can only ever see rows for this delivery.
export function mintGuestToken(deliveryId: string): string {
  const payload: GuestTokenPayload = { role: "anon", delivery_id: deliveryId };
  return jwt.sign(payload, getSecret(), {
    expiresIn: `${TTL_HOURS}h`,
  });
}

// Verifies a guest token presented back to an API route and confirms it
// grants access to the specific delivery the route is acting on. Writes
// always go through the service-role client, which bypasses RLS entirely,
// so this check is the only thing standing between a guest and writing to
// a delivery that isn't theirs.
export function verifyGuestToken(
  token: string,
  expectedDeliveryId: string
): boolean {
  try {
    const decoded = jwt.verify(token, getSecret()) as GuestTokenPayload;
    return decoded.role === "anon" && decoded.delivery_id === expectedDeliveryId;
  } catch {
    return false;
  }
}
