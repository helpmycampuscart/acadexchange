
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
    console.log('=== CONTACT BUTTON DEBUG START ===');
    console.log('Product ID:', productId);
    console.log('User:', user?.id);
    console.log('Is Sold:', isSold);
    
    // Security check: User must be authenticated
    if (!user) {
      console.log('❌ User not authenticated');
      toast({
        title: "Authentication required",
        description: "Please sign in to view seller contact information",
        variant: "destructive"
      });
      return;
    }

    // Security check: Product shouldn't be sold
    if (isSold) {
      console.log('❌ Product is sold');
      toast({
        title: "Product sold",
        description: "This product has already been sold",
        variant: "destructive"
      });
      return;
    }

    setIsContacting(true);
    
    try {
      console.log('🔍 Fetching contact info from database...');
      
      // Securely fetch contact information using database function
      const { data, error } = await supabase.rpc('get_product_contact_info', {
        product_id: productId
      });

      console.log('Database response:', { data, error });

      if (error) {
        console.error('❌ Database error:', error);
        toast({
          title: "Error",
          description: "Unable to access contact information. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log('❌ No contact data found');
        console.log('Trying fallback: checking product_contacts table directly...');
        
        // Fallback: try to get contact info directly
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('product_contacts')
          .select('whatsapp_number, user_id, user_email')
          .eq('product_id', productId);
        
        console.log('Fallback query result:', { fallbackData, fallbackError });
        
        if (!fallbackData || fallbackData.length === 0) {
          console.log('❌ No contact info in product_contacts table');
          toast({
            title: "Contact unavailable",
            description: "Contact information is not available for this product",
            variant: "destructive"
          });
          return;
        }
      }

      const contactInfo = data && data.length > 0 ? data[0] : null;
      const phoneNumber = contactInfo?.whatsapp_number;

      console.log('Contact info:', contactInfo);
      console.log('Phone number:', phoneNumber);

      if (!phoneNumber) {
        console.log('❌ No WhatsApp number found');
        toast({
          title: "Contact unavailable",
          description: "WhatsApp number not available for this product",
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
      
      console.log('✅ Opening WhatsApp with URL:', whatsappUrl);
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Opening WhatsApp",
        description: "You'll be redirected to WhatsApp to contact the seller",
      });
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to access contact information. Please try again.",
        variant: "destructive"
      });
    } finally {
      console.log('=== CONTACT BUTTON DEBUG END ===');
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
