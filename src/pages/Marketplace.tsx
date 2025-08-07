
import { useState, useEffect } from "react";
import { Search, Filter, MapPin, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product, CATEGORIES, LOCATIONS } from "@/types";
import { getProductsFromSupabase } from "@/utils/supabaseStorage";
import { getProducts } from "@/utils/storage";

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedLocation]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to fetch products from Supabase...');
      // First try Supabase
      const supabaseProducts = await getProductsFromSupabase();
      console.log('Supabase products:', supabaseProducts);
      
      if (supabaseProducts && supabaseProducts.length > 0) {
        setProducts(supabaseProducts);
        console.log('Successfully loaded products from Supabase');
      } else {
        // Fallback to localStorage
        console.log('No products from Supabase, trying localStorage...');
        const localProducts = getProducts();
        console.log('Local products:', localProducts);
        setProducts(localProducts);
        
        if (localProducts.length === 0) {
          setError('No products found. Try adding some products first!');
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      
      // Fallback to localStorage on network error
      try {
        const localProducts = getProducts();
        setProducts(localProducts);
        
        if (localProducts.length === 0) {
          setError('Network error: Unable to connect to server. No offline products available.');
        } else {
          setError('Network error: Showing offline products only. Some products may be outdated.');
        }
      } catch (localError) {
        console.error('Error loading local products:', localError);
        setError('Unable to load products. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadProducts();
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter(product => product.location === selectedLocation);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLocation("all");
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "all" ? selectedCategory : null,
    selectedLocation !== "all" ? selectedLocation : null
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Campus Marketplace
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover amazing deals from fellow students
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">
                  Search: {searchTerm}
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary">
                  <Filter className="h-3 w-3 mr-1" />
                  {selectedCategory}
                </Badge>
              )}
              {selectedLocation !== "all" && (
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" />
                  {selectedLocation}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            {error && products.length > 0 && ' (offline mode)'}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg p-6 animate-pulse">
                <div className="aspect-video bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onRefresh={loadProducts}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {error 
                ? "Unable to load products. Please check your connection and try again."
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            <div className="space-x-4">
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
              {error && (
                <Button onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
