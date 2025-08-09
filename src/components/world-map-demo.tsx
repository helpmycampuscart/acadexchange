
"use client";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";

export default function WorldMapDemo() {
  return (
    <div className="py-40 bg-background w-full">
      <div className="max-w-7xl mx-auto text-center">
        <p className="font-bold text-xl md:text-4xl text-foreground">
          Campus{" "}
          <span className="text-muted-foreground">
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
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto py-4">
          Connect with students across 100+ cities in India. 
          Buy and sell from your local campus community with ease.
        </p>
      </div>
      <WorldMap
        dots={[
          // Major Education Hubs Network
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
            end: { lat: 13.0827, lng: 80.2707 }, // Chennai
          },
          {
            start: { lat: 13.0827, lng: 80.2707 }, // Chennai
            end: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
          },
          {
            start: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
            end: { lat: 18.5204, lng: 73.8567 }, // Pune
          },
          {
            start: { lat: 18.5204, lng: 73.8567 }, // Pune
            end: { lat: 22.5726, lng: 88.3639 }, // Kolkata
          },
          {
            start: { lat: 22.5726, lng: 88.3639 }, // Kolkata
            end: { lat: 26.9124, lng: 75.7873 }, // Jaipur
          },
          {
            start: { lat: 26.9124, lng: 75.7873 }, // Jaipur
            end: { lat: 23.2599, lng: 77.4126 }, // Bhopal
          },
          {
            start: { lat: 23.2599, lng: 77.4126 }, // Bhopal
            end: { lat: 25.4358, lng: 81.8463 }, // Allahabad
          },
          {
            start: { lat: 25.4358, lng: 81.8463 }, // Allahabad
            end: { lat: 26.8467, lng: 80.9462 }, // Lucknow
          },
          {
            start: { lat: 26.8467, lng: 80.9462 }, // Lucknow
            end: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
          },
          {
            start: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
            end: { lat: 21.1458, lng: 79.0882 }, // Nagpur
          },
          {
            start: { lat: 21.1458, lng: 79.0882 }, // Nagpur
            end: { lat: 28.6139, lng: 77.2090 }, // Back to Delhi
          },
          // Additional connections for major education centers
          {
            start: { lat: 25.3176, lng: 82.9739 }, // Varanasi
            end: { lat: 22.9734, lng: 78.6569 }, // Madhya Pradesh center
          },
          {
            start: { lat: 11.0168, lng: 76.9558 }, // Coimbatore
            end: { lat: 15.2993, lng: 74.1240 }, // Karnataka-Goa region
          },
        ]}
        lineColor="hsl(142, 76%, 36%)"
      />
    </div>
  );
}
