import { getNavigation } from "@/sanity/lib/getNavigation";
import CookiePolicy from "./_client";

export default async function CookiePolicyPage() {
  const navData = await getNavigation();
  return <CookiePolicy navData={navData ?? undefined} />;
}
