"use client";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";

export default function WorldMapDemo() {
  return (
    <div className="py-20 bg-black w-full">
      <div className="max-w-7xl mx-auto text-center">
        <p className="font-bold text-xl md:text-4xl text-white">
          Campus{" "}
          <span className="text-neutral-400">
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
        <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
          Connecting students across India. Buy and sell with fellow students in your city 
          from our growing network of 100+ cities nationwide.
        </p>
      </div>
      <WorldMap
        dots={[
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
        ]}
        lineColor="#10b981"
      />
    </div>
  );
}
