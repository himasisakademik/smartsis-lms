import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  isSuperAdmin,
  getAdminUsers,
  addAdminUser,
  removeAdminUser,
  SUPER_ADMIN_EMAIL,
} from "@/lib/admin";

async function requireSuperAdmin() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return { error: "Unauthorized", status: 401 };
  }
  if (!isSuperAdmin(email)) {
    return { error: "Forbidden: Super admin only", status: 403 };
  }
  return { email };
}

export async function GET() {
  const auth = await requireSuperAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admins = await getAdminUsers();
  return NextResponse.json({
    superAdmin: SUPER_ADMIN_EMAIL,
    admins,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const { email, name } = body;

  if (!email || !name) {
    return NextResponse.json(
      { error: "Email dan nama wajib diisi" },
      { status: 400 },
    );
  }

  if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json(
      { error: "Super admin tidak bisa ditambahkan ulang" },
      { status: 400 },
    );
  }

  try {
    const result = await addAdminUser(email, name);
    return NextResponse.json({ success: true, id: result._id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menambahkan admin" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
  }

  try {
    await removeAdminUser(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menghapus admin" },
      { status: 400 },
    );
  }
}
