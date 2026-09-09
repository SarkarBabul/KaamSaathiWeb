import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, Settings as SettingsIcon, UserCircle } from "lucide-react";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { EnterpriseNavLinks } from "@/app-desktop/components/shell/EnterpriseNavLinks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function EnterpriseHeader() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
            <div className="flex h-16 items-center px-6 text-lg font-semibold">KaamSaathi</div>
            <EnterpriseNavLinks onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="text-lg font-semibold">KaamSaathi</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <UserCircle className="h-6 w-6" />
              <span className="hidden text-sm font-medium sm:inline">{session?.username ?? "Account"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/enterprise/settings")}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
