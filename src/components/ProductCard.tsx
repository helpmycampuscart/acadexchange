import { useState } from "react";
import { MessageCircle, MapPin, Calendar, CheckCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Product } from "@/types";
import { useUser } from "@clerk/clerk-react";
import { updateProduct } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onRefresh?: () => void;
}

const ProductCard = ({ product, showActions = false, onEdit, onDelete, onRefresh }: ProductCardProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = user?.emailAddresses[0]?.emailAddress === product.userEmail;
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'admin@campuscart.com';

  const handleWhatsAppClick = () => {
    const message = `Hi! I'm interested in your product:\n\n📦 ${product.name}\n🆔 Product ID: ${product.uniqueId}\n💰 Price: ₹${product.price.toLocaleString()}\n\nIs it still available?`;
    const whatsappUrl = `https://wa.me/${product.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMarkAsSold = () => {
    if (!isOwner && !isAdmin) return;
    
    setIsLoading(true);
    try {
      const newStatus = !product.isSold;
      updateProduct(product.id, { isSold: newStatus });
      
      toast({
        title: newStatus ? "✅ Product marked as sold" : "🔄 Product marked as available",
        description: `${product.name} status updated successfully`,
      });
      
      // Force refresh after a short delay to ensure state is updated
      setTimeout(() => {
        onRefresh?.();
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "❌ Error",
        description: "Failed to update product status. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        {product.imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {/* Status Badge */}
        {product.isSold && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sold
          </Badge>
        )}

        {/* Actions Menu */}
        {showActions && (isOwner || isAdmin) && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMarkAsSold} disabled={isLoading}>
                  {product.isSold ? "Mark as Available" : "Mark as Sold"}
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    Edit Product
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete Product
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
            <div className="text-2xl font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </div>
          </div>
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {product.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {product.location}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(product.createdAt)}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">ID:</span> {product.uniqueId}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <span className="font-medium">Seller:</span> {product.userName}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          variant="whatsapp" 
          className="w-full"
          onClick={handleWhatsAppClick}
          disabled={product.isSold}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {product.isSold ? "Sold Out" : "Chat on WhatsApp"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;