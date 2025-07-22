import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, DollarSign, Package, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product, CATEGORIES, LOCATIONS } from "@/types";
import { saveProductToSupabase, generateProductId } from "@/utils/supabaseStorage";
import { useAuth } from "@/hooks/useAuth";

const SellPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    location: "",
    whatsappNumber: "",
    imageUrl: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      imageUrl: ""
    }));
  };

  const validateForm = () => {
    const { name, description, price, category, location, whatsappNumber } = formData;
    
    if (!name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a product name",
        variant: "destructive"
      });
      return false;
    }

    if (!description.trim()) {
      toast({
        title: "Missing Information", 
        description: "Please enter a description",
        variant: "destructive"
      });
      return false;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return false;
    }

    if (!category) {
      toast({
        title: "Missing Information",
        description: "Please select a category",
        variant: "destructive"
      });
      return false;
    }

    if (!location) {
      toast({
        title: "Missing Information",
        description: "Please select a location",
        variant: "destructive"
      });
      return false;
    }

    if (!whatsappNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your WhatsApp number",
        variant: "destructive"
      });
      return false;
    }

    // Basic WhatsApp number validation
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid WhatsApp number",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return;

    setIsLoading(true);

    try {
      const uniqueId = generateProductId();
      
      const newProduct: Product = {
        id: Date.now().toString(),
        uniqueId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category as any,
        location: formData.location,
        whatsappNumber: formData.whatsappNumber.trim(),
        imageUrl: formData.imageUrl || undefined,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.email?.split('@')[0] || 'Anonymous',
        createdAt: new Date().toISOString(),
        isSold: false
      };

      const result = await saveProductToSupabase(newProduct);
      
      if (result.success) {
        toast({
          title: "Product Listed Successfully! 🎉",
          description: `Your item "${newProduct.name}" is now live on the marketplace`,
        });
        navigate('/my-listings');
      } else {
        throw new Error(result.error || 'Failed to save product');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list your product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to sell items</h1>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Sell Your Item
            </h1>
            <p className="text-muted-foreground text-lg">
              List your item and connect with interested buyers
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Fill in the information about your item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="e.g., MacBook Pro 13-inch"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item's condition, features, and any other relevant details..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {formData.description.length}/500 characters
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price in rupees"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsapp"
                      placeholder="Enter your WhatsApp number (with country code)"
                      value={formData.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Upload a photo of your item
                        </p>
                        <label className="cursor-pointer">
                          <Button type="button" variant="outline" className="pointer-events-none">
                            Choose File
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Publishing..." : "List Your Item"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellPage;