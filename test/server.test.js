import { spawn } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";

const port = 4317;
const server = spawn("npm", ["run", "dev"], { env: { ...process.env, PORT: String(port) } });

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("server did not start")), 10_000);
  server.stdout.on("data", (chunk) => {
    if (chunk.toString().includes("Calendar app listening")) { clearTimeout(timer); resolve(); }
  });
  server.on("error", reject);
});

test.after(() => server.kill());

test("rejects malformed JSON and keeps serving requests", async () => {
  const invalid = await fetch(`http://localhost:${port}/api/bookings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{broken",
  });
  assert.equal(invalid.status, 400);

  const slots = await fetch(`http://localhost:${port}/api/slots`);
  assert.equal(slots.status, 200);
  assert.ok((await slots.json()).length > 0);
});

test("returns distinct errors for missing and already booked slots", async () => {
  const missing = await fetch(`http://localhost:${port}/api/bookings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slotId: "missing", name: "Mikita", email: "mikita@example.com" }),
  });
  assert.equal(missing.status, 404);

  const booking = await fetch(`http://localhost:${port}/api/bookings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slotId: "slot-1", name: "Mikita", email: "mikita@example.com" }),
  });
  assert.equal(booking.status, 201);

  const duplicate = await fetch(`http://localhost:${port}/api/bookings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slotId: "slot-1", name: "Other", email: "other@example.com" }),
  });
  assert.equal(duplicate.status, 409);
});
