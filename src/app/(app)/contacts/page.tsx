import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ContactsTable } from "@/components/contacts/ContactsTable";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <AppShell breadcrumb="Contacts">
      <ContactsTable contacts={contacts} />
    </AppShell>
  );
}
