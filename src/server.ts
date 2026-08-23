import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

type EventType = { id: string; title: string; duration: number };
type Slot = { id: string; eventTypeId: string; startsAt: string; bookedBy?: string };
type Booking = { id: string; slotId: string; name: string; email: string };
const eventTypes: EventType[] = [{ id: "demo", title: "Встреча", duration: 30 }];
const slots: Slot[] = [1, 2, 3, 4].map((n) => ({ id: `slot-${n}`, eventTypeId: "demo", startsAt: new Date(Date.now() + n * 3600000).toISOString() }));
const bookings: Booking[] = [];
const json = (res: import("node:http").ServerResponse, status: number, body: unknown) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(body)); };
const readBody = async (req: import("node:http").IncomingMessage) => {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (Buffer.byteLength(data) > 10_000) throw new Error("Request body is too large");
  }
  if (!data) return {};
  try { return JSON.parse(data) as Record<string, string>; }
  catch { throw new Error("Request body must be valid JSON"); }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === "/api/event-types" && req.method === "GET") return json(res, 200, eventTypes);
  if (url.pathname === "/api/slots" && req.method === "GET") return json(res, 200, slots.filter((s) => !s.bookedBy && new Date(s.startsAt) > new Date()));
  if (url.pathname === "/api/bookings" && req.method === "POST") {
    let body: Record<string, string>;
    try { body = await readBody(req); }
    catch (error) { return json(res, 400, { error: error instanceof Error ? error.message : "Invalid request body" }); }
    const slot = slots.find((s) => s.id === body.slotId);
    if (!slot) return json(res, 404, { error: "Slot not found" });
    if (slot.bookedBy) return json(res, 409, { error: "Slot is already booked" });
    if (!body.name || !body.email) return json(res, 422, { error: "Name and email are required" });
    const booking = { id: randomUUID(), slotId: slot.id, name: body.name, email: body.email };
    slot.bookedBy = booking.id; bookings.push(booking); return json(res, 201, booking);
  }
  if (url.pathname.startsWith("/api/")) return json(res, 404, { error: "Not found" });
  try { const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1); const body = await readFile(join(process.cwd(), "public", file)); res.writeHead(200); res.end(body); } catch { res.writeHead(404); res.end("Not found"); }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("Calendar app listening on port 3000"));
