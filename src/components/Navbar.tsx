import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Beaker } from "lucide-react";
import { useState } from "react";
import { AuthUserButton } from "@/components/auth/AuthComponents";
import { useUser } from "@clerk/clerk-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { user: dbUser, isAdmin, isAssistant } = useUserProfile();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/timeline", label: "Timeline" },
    { path: "/virtual-lab", label: "Virtual Lab", requireAuth: true }, // Only show when logged in
    { path: "/profile", label: "Profile", requireAuth: true }, // Profile page
    // { path: "/whiteboard", label: "Whiteboard" },
    { path: "/assistant", label: "Assistant", requireRole: 'ASSISTANT' },
    { path: "/admin", label: "Admin", requireRole: 'ADMIN' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Filter nav items based on user role and authentication
  const filteredNavItems = navItems.filter(item => {
    if (item.requireAuth && !user) return false;
    
    if (!item.requireRole) return true;
    
    // Use database user role instead of Clerk metadata
    if (item.requireRole === 'ADMIN') return isAdmin;
    if (item.requireRole === 'ASSISTANT') return isAssistant;
    
    return false;
  });

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo on the left */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="/LabIRK.svg"
              alt="LabIRK Logo"
              className="h-8 w-8 transition-transform group-hover:scale-110"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {filteredNavItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="transition-all text-sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side - Auth + Mobile Menu */}
          <div className="flex items-center space-x-2">
            <AuthUserButton />
            
            {/* Mobile Menu Button - Show on tablet and mobile */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
