import { getNavigation } from "@/sanity/lib/getNavigation";
import Navbar from "./Navbar";

export default async function NavbarServer() {
  const navData = await getNavigation();
  return <Navbar navData={navData ?? undefined} />;
}
