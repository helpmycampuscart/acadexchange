import { useNavigate } from "react-router-dom";
import { useUser, UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Home, ShoppingBag, PlusCircle, List, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'abhinavpadige06@gmail.com' || 
                   user?.emailAddresses[0]?.emailAddress === 'admin@mycampuscart.com';

  return (
    <nav className="border-b border-border/30 glass-card sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <div 
            className="text-2xl font-bold gradient-text cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => navigate('/')}
          >
            MyCampusCart
          </div>

          {/* Enhanced Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 hover-lift hover:bg-primary/10 transition-all duration-300"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('/marketplace')}
              className="flex items-center space-x-2 hover-lift hover:bg-primary/10 transition-all duration-300"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Marketplace</span>
            </Button>

            <SignedIn>
              <Button
                variant="ghost"
                onClick={() => navigate('/sell')}
                className="flex items-center space-x-2 hover-lift hover:bg-primary/10 transition-all duration-300"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Sell</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/my-listings')}
                className="flex items-center space-x-2 hover-lift hover:bg-primary/10 transition-all duration-300"
              >
                <List className="h-4 w-4" />
                <span>My Listings</span>
              </Button>

              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 premium-button text-primary hover:text-primary-foreground border border-primary/30"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}
            </SignedIn>
          </div>

          {/* Enhanced User Section */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" className="hover-lift premium-button">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 hover:scale-110 transition-transform duration-300 ring-2 ring-primary/20 hover:ring-primary/40"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;