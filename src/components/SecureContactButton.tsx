
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
  let clean = phoneNumber.replace(/\\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) return clean;
  if (clean.length === 10) return "91" + clean;
  if (clean.startsWith("0") && clean.length === 11) return "91" + clean.substring(1);
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
      // Use Edge Function to safely retrieve contact (bypasses RLS)
      const { data, error } = await supabase.functions.invoke("get-product-contact", {
        body: { productId, viewerId: user.id },
      });

      let phoneNumber = "";

      if (error) {
        console.warn("get-product-contact error:", error);
      }

      if (data?.contact?.whatsappNumber) {
        phoneNumber = data.contact.whatsappNumber;
      } else if (whatsappNumber) {
        phoneNumber = whatsappNumber;
      }

      phoneNumber = formatWhatsAppNumber(phoneNumber);

      if (!phoneNumber) {
        toast({
          title: "Contact unavailable",
          description: "WhatsApp number not available for this product.",
          variant: "destructive",
        });
        return;
      }

      try {
        await logSecurityEvent("contact_accessed", {
          productId,
          buyerId: user.id,
          buyerEmail: user.emailAddresses[0]?.emailAddress,
        });
      } catch (e) {
        console.error("Error logging security event:", e);
      }

      const message = `Hi! I'm interested in your product:\\n\\n📦 ${productName}\\n🆔 Product ID: ${productUniqueId}\\n💰 Price: ₹${productPrice.toLocaleString()}\\n\\nIs it still available?`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

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
