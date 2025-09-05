
import { Heart, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">acadexchange</h3>
            <p className="text-muted-foreground text-sm">
              Your trusted marketplace for buying and selling used items within the campus community.
            </p>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for students</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">Browse Products</div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">Sell Your Item</div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">My Listings</div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">Safety Tips</div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Get Help</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a 
                  href="mailto:help.mycampuscart@gmail.com" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  help.mycampuscart@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Serving 100+ cities across India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 acadexchange. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
              <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
              <span className="hover:text-foreground cursor-pointer">Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
