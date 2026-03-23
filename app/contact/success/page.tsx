import { getNavigation } from "@/sanity/lib/getNavigation";
import ContactSuccess from "./_client";

export default async function ContactSuccessPage() {
  const navData = await getNavigation();
  return <ContactSuccess navData={navData ?? undefined} />;
}
