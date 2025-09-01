"use client";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";

export default function WorldMapDemo() {
  return (
        <div className="py-40 bg-background/95 backdrop-blur-sm w-full">
          <div className="max-w-7xl mx-auto text-center px-4">
            <p className="font-bold text-xl md:text-4xl text-foreground mb-4">
              Campus{" "}
              <span className="text-primary">
                {"Network".split("").map((word, idx) => (
                  <motion.span
                    key={idx}
                    className="inline-block"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.04 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </p>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with students across 200+ cities in India. 
              Buy and sell from your local campus community with confidence.
            </p>
            {/* Connection Status Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Network Active</span>
            </div>
          </div>
      <WorldMap
        zoomLevel={1.5}
        centerLat={20.5937}
        centerLng={78.9629}
        dots={[
          // Major North India Network
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 26.9124, lng: 75.7873 }, // Jaipur
          },
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 26.8467, lng: 80.9462 }, // Lucknow
          },
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 27.1767, lng: 78.0081 }, // Agra
          },
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 28.9845, lng: 77.7064 }, // Meerut
          },
          
          // West India Connections
          {
            start: { lat: 19.0760, lng: 72.8777 }, // Mumbai
            end: { lat: 18.5204, lng: 73.8567 }, // Pune
          },
          {
            start: { lat: 19.0760, lng: 72.8777 }, // Mumbai
            end: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
          },
          {
            start: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
            end: { lat: 22.3072, lng: 73.1812 }, // Vadodara
          },
          {
            start: { lat: 19.0760, lng: 72.8777 }, // Mumbai
            end: { lat: 21.0258, lng: 75.5792 }, // Aurangabad
          },
          
          // South India Network
          {
            start: { lat: 12.9716, lng: 77.5946 }, // Bangalore
            end: { lat: 13.0827, lng: 80.2707 }, // Chennai
          },
          {
            start: { lat: 12.9716, lng: 77.5946 }, // Bangalore
            end: { lat: 12.2958, lng: 76.6394 }, // Mysore
          },
          {
            start: { lat: 13.0827, lng: 80.2707 }, // Chennai
            end: { lat: 11.0168, lng: 76.9558 }, // Coimbatore
          },
          {
            start: { lat: 13.0827, lng: 80.2707 }, // Chennai
            end: { lat: 9.9252, lng: 78.1198 }, // Madurai
          },
          {
            start: { lat: 12.9716, lng: 77.5946 }, // Bangalore
            end: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
          },
          
          // East India Connections
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 23.5041, lng: 87.3119 }, // Durgapur
          },
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 25.5941, lng: 85.1376 }, // Patna
          },
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 26.4499, lng: 80.3319 }, // Kanpur
          },
          
          // Central India Hub
          {
            start: { lat: 23.2599, lng: 77.4126 }, // Bhopal
            end: { lat: 22.7196, lng: 75.8577 }, // Indore
          },
          {
            start: { lat: 23.2599, lng: 77.4126 }, // Bhopal
            end: { lat: 21.1458, lng: 79.0882 }, // Nagpur
          },
          {
            start: { lat: 22.7196, lng: 75.8577 }, // Indore
            end: { lat: 26.2389, lng: 73.0243 }, // Jodhpur
          },
          
          // North-East and Special Economic Zones
          {
            start: { lat: 25.3176, lng: 82.9739 }, // Varanasi
            end: { lat: 24.5854, lng: 73.7125 }, // Udaipur
          },
          {
            start: { lat: 13.6288, lng: 79.4192 }, // Tirupati
            end: { lat: 17.6868, lng: 83.2185 }, // Visakhapatnam
          },
          {
            start: { lat: 25.0961, lng: 85.3131 }, // Bhagalpur
            end: { lat: 26.4499, lng: 80.3319 }, // Kanpur
          },
          
          // Connecting Major Hubs
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 19.0760, lng: 72.8777 }, // Mumbai
          },
          {
            start: { lat: 19.0760, lng: 72.8777 }, // Mumbai
            end: { lat: 12.9716, lng: 77.5946 }, // Bangalore
          },
          {
            start: { lat: 12.9716, lng: 77.5946 }, // Bangalore
            end: { lat: 22.5726, lng: 88.3639 }, // Kolkata
          },
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 28.6139, lng: 77.2090 }, // Delhi
          },
          
          // State Capital Connections
          {
            start: { lat: 27.0238, lng: 74.2179 }, // Kota
            end: { lat: 26.9124, lng: 75.7873 }, // Jaipur
          },
          {
            start: { lat: 15.2993, lng: 74.1240 }, // Goa region
            end: { lat: 19.0760, lng: 72.8777 }, // Mumbai
          },
        ]}
        lineColor="hsl(142, 76%, 36%)"
      />
    </div>
  );
}
