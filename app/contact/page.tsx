import { getNavigation } from "@/sanity/lib/getNavigation";
import ContactPage from "./_client";

export default async function Contact() {
  const navData = await getNavigation();
  return <ContactPage navData={navData ?? undefined} />;
}
