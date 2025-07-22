import { useNavigate } from "react-router-dom";
import { useUser, UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Home, ShoppingBag, PlusCircle, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'admin@campuscart.com';

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="text-xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors"
            onClick={() => navigate('/')}
          >
            MyCampusCart
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('/marketplace')}
              className="flex items-center space-x-2"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Marketplace</span>
            </Button>

            <SignedIn>
              <Button
                variant="ghost"
                onClick={() => navigate('/sell')}
                className="flex items-center space-x-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Sell</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/my-listings')}
                className="flex items-center space-x-2"
              >
                <List className="h-4 w-4" />
                <span>My Listings</span>
              </Button>

              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}
            </SignedIn>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
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