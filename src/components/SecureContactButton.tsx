
import { useState } from "react";
import { MessageCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { logSecurityEvent } from "@/utils/securityUtils";
import { supabase } from "@/integrations/supabase/client";

interface SecureContactButtonProps {
  productId: string;
  productName: string;
  productUniqueId: string;
  productPrice: number;
  whatsappNumber?: string;
  isSold?: boolean;
}

// Helper function to format phone number for WhatsApp
const formatWhatsAppNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 91, assume it already has country code
  if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
    return cleanNumber;
  }
  
  // If number is 10 digits, add Indian country code
  if (cleanNumber.length === 10) {
    return '91' + cleanNumber;
  }
  
  // If number starts with 0, remove it and add country code
  if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
    return '91' + cleanNumber.substring(1);
  }
  
  // Return as is for other formats
  return cleanNumber;
};

const SecureContactButton = ({ 
  productId, 
  productName, 
  productUniqueId, 
  productPrice, 
  whatsappNumber, 
  isSold = false 
}: SecureContactButtonProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isContacting, setIsContacting] = useState(false);

  const handleWhatsAppClick = async () => {
    // Security check: User must be authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view seller contact information",
        variant: "destructive"
      });
      return;
    }

    // Security check: Product shouldn't be sold
    if (isSold) {
      toast({
        title: "Product sold",
        description: "This product has already been sold",
        variant: "destructive"
      });
      return;
    }

    setIsContacting(true);
    
    try {
      // Securely fetch contact information using database function
      const { data, error } = await supabase.rpc('get_product_contact_info', {
        product_id: productId
      });

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Error",
          description: "Unable to access contact information. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Contact unavailable",
          description: "Contact information is not available for this product",
          variant: "destructive"
        });
        return;
      }

      const contactInfo = data[0];
      let phoneNumber = contactInfo?.whatsapp_number;

      if (!phoneNumber) {
        toast({
          title: "Contact unavailable",
          description: "WhatsApp number not available for this product",
          variant: "destructive"
        });
        return;
      }

      // Format the phone number for WhatsApp
      phoneNumber = formatWhatsAppNumber(phoneNumber);

      if (!phoneNumber) {
        toast({
          title: "Invalid contact",
          description: "The contact number format is invalid",
          variant: "destructive"
        });
        return;
      }

      // Log contact access for security monitoring
      await logSecurityEvent('contact_accessed', {
        productId,
        buyerId: user.id,
        sellerId: contactInfo.user_id,
        buyerEmail: user.emailAddresses[0]?.emailAddress
      });

      const message = `Hi! I'm interested in your product:\n\n📦 ${productName}\n🆔 Product ID: ${productUniqueId}\n💰 Price: ₹${productPrice.toLocaleString()}\n\nIs it still available?`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Opening WhatsApp",
        description: "You'll be redirected to WhatsApp to contact the seller",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to access contact information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsContacting(false);
    }
  };

  if (isSold) {
    return (
      <Button size="sm" disabled className="flex items-center space-x-2">
        <Lock className="h-4 w-4" />
        <span>Sold</span>
      </Button>
    );
  }

  if (!user) {
    return (
      <Button size="sm" onClick={handleWhatsAppClick} variant="outline" className="flex items-center space-x-2">
        <Lock className="h-4 w-4" />
        <span>Sign in to Contact</span>
      </Button>
    );
  }

  return (
    <Button 
      size="sm" 
      onClick={handleWhatsAppClick}
      disabled={isContacting}
      className="flex items-center space-x-2 hover:scale-105 transition-transform premium-button"
    >
      <MessageCircle className="h-4 w-4" />
      <span>{isContacting ? 'Connecting...' : 'Contact Seller'}</span>
    </Button>
  );
};

export default SecureContactButton;
