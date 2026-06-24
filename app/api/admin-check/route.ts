import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  const authorized = await isAdminEmail(email);
  return NextResponse.json({ authorized });
}
