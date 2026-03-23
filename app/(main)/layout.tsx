import NavbarServer from "@/app/components/navigation/NavbarServer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <NavbarServer />
      {children}
    </div>
  );
}
