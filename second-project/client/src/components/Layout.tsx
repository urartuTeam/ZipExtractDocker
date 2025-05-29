import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
}
