import { Outlet } from "react-router-dom";
import { KaamSaathiNavbar } from "./KaamSaathiNavbar";
import { KaamSaathiFooter } from "./KaamSaathiFooter";

export function KaamSaathiLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <KaamSaathiNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <KaamSaathiFooter />
    </div>
  );
}