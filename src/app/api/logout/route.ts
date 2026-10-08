import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("jamia_session");
    cookieStore.delete("authjs.session-token");
    cookieStore.delete("__Secure-authjs.session-token");
    cookieStore.delete("authjs.csrf-token");
  } catch {
    // Ignore error
  }
  return NextResponse.redirect(new URL("/login", req.url));
}
