import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag, PlusCircle, List, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();

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

            {user && (
              <>
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
              </>
            )}
          </div>

          {/* Enhanced User Section */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <Button 
                variant="outline" 
                className="hover-lift premium-button"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;