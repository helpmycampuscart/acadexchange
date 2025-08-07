import { useState } from "react";
import { MessageCircle, MapPin, Calendar, CheckCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Product } from "@/types";
import { useUser } from "@clerk/clerk-react";
import { updateProductInSupabase } from "@/utils/supabaseStorage";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <BackgroundGradient 
        className="rounded-[22px] p-1 h-full" 
        animate={!product.isSold}
        containerClassName="h-full"
      >
        <Card className={`border-0 shadow-none bg-card/95 backdrop-blur-md h-full flex flex-col ${product.isSold ? 'opacity-75' : ''}`}>
          <CardHeader className="space-y-3 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={product.isSold ? "secondary" : "default"} className="animate-pulse">
                  {product.category}
                </Badge>
                {product.isSold && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
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
              <motion.div 
                className="aspect-video overflow-hidden rounded-lg"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </CardHeader>

          <CardContent className="space-y-4 flex-grow">
            <div>
              <h3 className="font-semibold text-lg leading-tight mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <motion.div 
                className="text-2xl font-bold gradient-text"
                whileHover={{ scale: 1.05 }}
              >
                ₹{product.price.toLocaleString()}
              </motion.div>
              {!product.isSold && (
                <Button 
                  size="sm" 
                  onClick={handleWhatsAppClick}
                  className="flex items-center space-x-2 hover:scale-105 transition-transform premium-button"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Contact</span>
                </Button>
              )}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span>{product.location}</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span>Listed on {formatDate(product.createdAt)}</span>
              </motion.div>
            </div>
          </CardContent>

          <CardFooter className="pt-0 flex-shrink-0">
            <div className="text-xs text-muted-foreground w-full">
              <div className="flex justify-between items-center">
                <span>ID: {product.uniqueId}</span>
                <span className="font-medium">By {product.userName}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </BackgroundGradient>
    </motion.div>
  );
};

export default ProductCard;
