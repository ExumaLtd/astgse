import { getNavigation } from "@/sanity/lib/getNavigation";
import PrivacyPolicy from "./_client";

export default async function PrivacyPolicyPage() {
  const navData = await getNavigation();
  return <PrivacyPolicy navData={navData ?? undefined} />;
}
