import { client, writeClient } from "@/sanity/lib/client";

export const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || "stmihimasis@gmail.com";

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export async function isAdminEmail(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;
  if (isSuperAdmin(email)) return true;

  const result = await client.fetch<{ _id: string } | null>(
    `*[_type == "adminUser" && lower(email) == lower($email)][0]{ _id }`,
    { email },
  );

  return !!result;
}

export async function getAdminUsers(): Promise<
  { _id: string; email: string; name: string; addedAt: string }[]
> {
  return client.fetch(
    `*[_type == "adminUser"] | order(addedAt desc) { _id, email, name, addedAt }`,
  );
}

export async function addAdminUser(
  email: string,
  name: string,
): Promise<{ _id: string }> {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "adminUser" && lower(email) == lower($email)][0]{ _id }`,
    { email },
  );

  if (existing) {
    throw new Error("Email sudah terdaftar sebagai admin");
  }

  return writeClient.create({
    _type: "adminUser",
    email: email.toLowerCase().trim(),
    name: name.trim(),
    addedAt: new Date().toISOString(),
  });
}

export async function removeAdminUser(id: string): Promise<void> {
  await writeClient.delete(id);
}
