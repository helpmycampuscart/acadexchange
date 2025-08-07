
import { useNavigate } from "react-router-dom";
import { useUser, UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Home, ShoppingBag, PlusCircle, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'abhinavpadige06@gmail.com' || 
                   user?.emailAddresses[0]?.emailAddress === 'admin@mycampuscart.com';

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="border-b border-border/30 glass-card sticky top-0 z-50 backdrop-blur-xl"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <motion.div 
            className="text-3xl font-bold gradient-text cursor-pointer hover:scale-105 transition-transform duration-300 text-glow"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            MyCampusCart
          </motion.div>

          {/* Enhanced Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { icon: Home, label: "Dashboard", path: "/dashboard" },
              { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
            ].map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-2 hover-lift hover:bg-primary/10 hover:text-primary transition-all duration-300 px-4 py-2 rounded-lg"
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Button>
            ))}

            <SignedIn>
              {[
                { icon: PlusCircle, label: "Sell", path: "/sell" },
                { icon: List, label: "My Listings", path: "/my-listings" },
              ].map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 hover-lift hover:bg-primary/10 hover:text-primary transition-all duration-300 px-4 py-2 rounded-lg"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              ))}

              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 premium-button text-primary hover:text-primary-foreground border border-primary/30 px-4 py-2 rounded-lg"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Admin</span>
                </Button>
              )}
            </SignedIn>
          </div>

          {/* Enhanced User Section */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="premium-button font-semibold">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 hover:scale-110 transition-transform duration-300 ring-2 ring-primary/20 hover:ring-primary/40 lamp-glow"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
