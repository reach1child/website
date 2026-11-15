import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handlers = toNextJsHandler(auth);

export async function GET(request: Request) {
  return handlers.GET(request);
}

export async function POST(request: Request) {
  const pathname = new URL(request.url).pathname;
  // All public account creation is closed. The first administrator is created
  // only through the one-time, server-side bootstrap endpoint.
  if (pathname.endsWith("/sign-up/email")) {
    return Response.json({ message: "Administrator registration is closed." }, { status: 403 });
  }
  return handlers.POST(request);
}
