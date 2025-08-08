
"use client";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";

export default function WorldMapDemo() {
  return (
    <div className="py-20 bg-background w-full">
      <div className="max-w-7xl mx-auto text-center">
        <p className="font-bold text-xl md:text-4xl text-foreground">
          Campus{" "}
          <span className="text-muted-foreground">
            {"Marketplace".split("").map((word, idx) => (
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
          Connect with students across different cities. Buy and sell items 
          within your campus community with trusted marketplace.
        </p>
      </div>
      <WorldMap
        dots={[
          {
            start: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
            end: { lat: 18.5204, lng: 73.8567 }, // Pune
          },
          {
            start: { lat: 18.5204, lng: 73.8567 }, // Pune
            end: { lat: 12.9716, lng: 77.5946 }, // Bangalore
          },
          {
            start: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
            end: { lat: 12.9716, lng: 77.5946 }, // Bangalore
          },
        ]}
      />
    </div>
  );
}
