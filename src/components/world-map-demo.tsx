"use client";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";

export default function WorldMapDemo() {
  return (
        <div className="py-40 bg-background/95 backdrop-blur-sm w-full">
          <div className="max-w-7xl mx-auto text-center px-4">
            <p className="font-bold text-xl md:text-4xl text-foreground mb-4">
              acadexchange{" "}
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
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Network Active</span>
            </div>
          </div>
      <WorldMap
        zoomLevel={1.8}
        centerLat={20.5937}
        centerLng={78.9629}
        dots={[
          // Major Metro Connections
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 19.0760, lng: 72.8777 }, // Mumbai
          },
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi  
            end: { lat: 12.9716, lng: 77.5946 }, // Bangalore
          },
          {
            start: { lat: 19.0760, lng: 72.8777 }, // Mumbai
            end: { lat: 13.0827, lng: 80.2707 }, // Chennai
          },
          {
            start: { lat: 12.9716, lng: 77.5946 }, // Bangalore
            end: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
          },
          {
            start: { lat: 18.5204, lng: 73.8567 }, // Pune
            end: { lat: 22.5726, lng: 88.3639 }, // Kolkata
          },
          {
            start: { lat: 26.9124, lng: 75.7873 }, // Jaipur
            end: { lat: 21.1458, lng: 79.0882 }, // Nagpur
          },

          // North India Educational Hubs
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 30.7333, lng: 76.7794 }, // Chandigarh
          },
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 26.8467, lng: 80.9462 }, // Lucknow
          },
          {
            start: { lat: 26.9124, lng: 75.7873 }, // Jaipur
            end: { lat: 27.0238, lng: 74.2179 }, // Kota
          },
          {
            start: { lat: 28.6139, lng: 77.2090 }, // Delhi
            end: { lat: 29.9457, lng: 78.1642 }, // Dehradun
          },

          // West India Network
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
            start: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
            end: { lat: 24.5854, lng: 73.7125 }, // Udaipur
          },

          // South India Educational Centers
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
            end: { lat: 13.6288, lng: 79.4192 }, // Tirupati
          },
          {
            start: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
            end: { lat: 17.6868, lng: 83.2185 }, // Visakhapatnam
          },

          // East India Connections
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 25.5941, lng: 85.1376 }, // Patna
          },
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 26.1445, lng: 91.7898 }, // Guwahati
          },
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 25.3176, lng: 82.9739 }, // Varanasi
          },
          {
            start: { lat: 25.5941, lng: 85.1376 }, // Patna
            end: { lat: 26.4499, lng: 80.3319 }, // Kanpur
          },

          // Central India Hub
          {
            start: { lat: 23.2599, lng: 77.4126 }, // Bhopal
            end: { lat: 22.7196, lng: 75.8577 }, // Indore
          },
          {
            start: { lat: 21.1458, lng: 79.0882 }, // Nagpur
            end: { lat: 23.2599, lng: 77.4126 }, // Bhopal
          },
          {
            start: { lat: 22.7196, lng: 75.8577 }, // Indore
            end: { lat: 19.0760, lng: 72.8777 }, // Mumbai
          },

          // Additional Educational Cities
          {
            start: { lat: 19.9975, lng: 73.7898 }, // Nashik
            end: { lat: 19.0760, lng: 72.8777 }, // Mumbai
          },
          {
            start: { lat: 21.7679, lng: 78.8718 }, // Akola
            end: { lat: 21.1458, lng: 79.0882 }, // Nagpur
          },
          {
            start: { lat: 15.3173, lng: 75.7139 }, // Belgaum
            end: { lat: 12.9716, lng: 77.5946 }, // Bangalore
          },
          {
            start: { lat: 14.4426, lng: 79.9865 }, // Nellore
            end: { lat: 13.0827, lng: 80.2707 }, // Chennai
          },

          // Cross-regional Major Connections
          {
            start: { lat: 26.9124, lng: 75.7873 }, // Jaipur
            end: { lat: 19.0760, lng: 72.8777 }, // Mumbai
          },
          {
            start: { lat: 18.5204, lng: 73.8567 }, // Pune
            end: { lat: 12.9716, lng: 77.5946 }, // Bangalore
          },
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
          },
          {
            start: { lat: 30.7333, lng: 76.7794 }, // Chandigarh
            end: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
          },

          // Tier-2 City Networks
          {
            start: { lat: 20.9517, lng: 77.7520 }, // Amravati
            end: { lat: 21.1458, lng: 79.0882 }, // Nagpur
          },
          {
            start: { lat: 16.7050, lng: 74.2433 }, // Kolhapur
            end: { lat: 18.5204, lng: 73.8567 }, // Pune
          },
          {
            start: { lat: 28.3670, lng: 79.4304 }, // Bareilly
            end: { lat: 28.6139, lng: 77.2090 }, // Delhi
          },
          {
            start: { lat: 11.9416, lng: 79.8083 }, // Pondicherry
            end: { lat: 13.0827, lng: 80.2707 }, // Chennai
          },
        ]}
        lineColor="hsl(164, 85%, 50%)"
      />
    </div>
  );
}
