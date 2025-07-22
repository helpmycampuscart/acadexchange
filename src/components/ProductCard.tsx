import { useState } from "react";
import { MessageCircle, MapPin, Calendar, CheckCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Product } from "@/types";
import { useUser } from "@clerk/clerk-react";
import { updateProductInSupabase } from "@/utils/supabaseStorage";
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
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = user?.emailAddresses[0]?.emailAddress === product.userEmail;
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'abhinavpadige06@gmail.com' ||
                   user?.emailAddresses[0]?.emailAddress === 'admin@mycampuscart.com';

  const handleWhatsAppClick = () => {
    const message = `Hi! I'm interested in your product:\n\n📦 ${product.name}\n🆔 Product ID: ${product.uniqueId}\n💰 Price: ₹${product.price.toLocaleString()}\n\nIs it still available?`;
    const whatsappUrl = `https://wa.me/${product.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMarkAsSold = async () => {
    if (!isOwner && !isAdmin) return;
    
    setIsUpdating(true);
    try {
      const result = await updateProductInSupabase(product.id, { isSold: !product.isSold });
      if (result.success) {
        toast({
          title: product.isSold ? "Product marked as available" : "Product marked as sold",
          description: product.isSold ? "Your item is now available for sale again" : "Congratulations on your sale! 🎉",
        });
        onRefresh?.();
      } else {
        throw new Error(result.error || 'Failed to update product');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
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
    <Card className={`hover-lift transition-all duration-300 ${product.isSold ? 'opacity-75' : ''}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={product.isSold ? "secondary" : "default"}>
              {product.category}
            </Badge>
            {product.isSold && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sold
              </Badge>
            )}
          </div>
          
          {showActions && (isOwner || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(product)}>
                      Edit Product
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleMarkAsSold}
                      disabled={isUpdating}
                    >
                      {product.isSold ? 'Mark as Available' : 'Mark as Sold'}
                    </DropdownMenuItem>
                  </>
                )}
                {(isOwner || isAdmin) && (
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(product.id)}
                    className="text-red-600"
                  >
                    Delete Product
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {product.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            ₹{product.price.toLocaleString()}
          </div>
          {!product.isSold && (
            <Button 
              size="sm" 
              onClick={handleWhatsAppClick}
              className="flex items-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contact</span>
            </Button>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{product.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Listed on {formatDate(product.createdAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="text-xs text-muted-foreground">
          <p>Product ID: {product.uniqueId}</p>
          <p>Seller: {product.userName}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;