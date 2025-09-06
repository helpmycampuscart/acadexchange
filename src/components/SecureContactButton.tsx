
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

const formatWhatsAppNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  
  // Remove all non-digit characters
  let clean = phoneNumber.replace(/\D/g, "");
  
  // If it already has country code (starts with 91 and is 12 digits)
  if (clean.startsWith("91") && clean.length === 12) {
    return clean;
  }
  
  // If it's a 10-digit number, add 91 (Indian country code)
  if (clean.length === 10) {
    return "91" + clean;
  }
  
  // If it starts with 0 and is 11 digits, replace 0 with 91
  if (clean.startsWith("0") && clean.length === 11) {
    return "91" + clean.substring(1);
  }
  
  // Return as is if we can't format it properly
  return clean;
};

const SecureContactButton = ({
  productId,
  productName,
  productUniqueId,
  productPrice,
  whatsappNumber,
  isSold = false,
}: SecureContactButtonProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isContacting, setIsContacting] = useState(false);

  const handleWhatsAppClick = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view seller contact information",
        variant: "destructive",
      });
      return;
    }

    if (isSold) {
      toast({
        title: "Product sold",
        description: "This product has already been sold",
        variant: "destructive",
      });
      return;
    }

    setIsContacting(true);

    try {
      console.log("Getting contact info for product:", productId);
      
      // Call Edge Function to get secure contact info
      const { data, error } = await supabase.functions.invoke("get-product-contact", {
        body: { productId, viewerId: user.id },
      });

      let phoneNumber = "";

      if (error) {
        console.warn("get-product-contact error:", error);
        // Fallback to provided whatsapp number
        if (whatsappNumber) {
          phoneNumber = whatsappNumber;
          console.log("Using fallback WhatsApp number:", phoneNumber);
        }
      } else if (data && data.success && data.contact?.whatsappNumber) {
        phoneNumber = data.contact.whatsappNumber;
        console.log("Got WhatsApp number from Edge Function:", phoneNumber);
      } else if (whatsappNumber) {
        phoneNumber = whatsappNumber;
        console.log("Using provided WhatsApp number:", phoneNumber);
      }

      // Format the phone number
      phoneNumber = formatWhatsAppNumber(phoneNumber);
      console.log("Formatted phone number:", phoneNumber);

      if (!phoneNumber || phoneNumber.length < 10) {
        toast({
          title: "Contact unavailable",
          description: "WhatsApp number not available for this product.",
          variant: "destructive",
        });
        return;
      }

      // Log security event
      try {
        await logSecurityEvent("contact_accessed", {
          productId,
          buyerId: user.id,
          buyerEmail: user.emailAddresses[0]?.emailAddress,
        });
      } catch (e) {
        console.error("Error logging security event:", e);
      }

      // Create WhatsApp message
      const message = `Hi! I'm interested in your product:

📦 ${productName}
🆔 Product ID: ${productUniqueId}
💰 Price: ₹${productPrice.toLocaleString()}

Is it still available?`;

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      console.log("Opening WhatsApp URL:", whatsappUrl);
      window.open(whatsappUrl, "_blank");

      toast({
        title: "Opening WhatsApp",
        description: "You'll be redirected to WhatsApp to contact the seller",
      });
    } catch (e) {
      console.error("Unexpected error:", e);
      toast({
        title: "Error",
        description: "Failed to access contact information. Please try again.",
        variant: "destructive",
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
      <span>{isContacting ? "Connecting..." : "Contact Seller"}</span>
    </Button>
  );
};

export default SecureContactButton;
