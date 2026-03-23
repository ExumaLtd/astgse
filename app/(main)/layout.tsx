import NavbarServer from "@/app/components/navigation/NavbarServer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarServer />
      {children}
    </>
  );
}
