
"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";

export default function SparklesPreview() {
  return (
    <div className="h-[40rem] w-full bg-background flex flex-col items-center justify-center overflow-hidden rounded-md relative">
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-foreground relative z-20">
        acadexchange
      </h1>
      <div className="w-[40rem] h-40 relative">
        {/* Gradients with green theme */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-green-400 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-green-400 to-transparent h-px w-1/4" />

        {/* Core component with better visibility */}
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={800}
          className="w-full h-full"
          particleColor="hsl(142, 76%, 36%)"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
}
