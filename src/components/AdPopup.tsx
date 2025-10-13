import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

interface Ad {
  id: string;
  type: 'image' | 'video';
  url: string;
  linkUrl?: string;
}

export const AdPopup = () => {
  const [open, setOpen] = useState(false);
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    // Check for active ad in localStorage
    const activeAdData = localStorage.getItem('activeAd');
    if (activeAdData) {
      const adData = JSON.parse(activeAdData);
      setAd(adData);
      
      // Show popup after 2 seconds
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!ad) return null;

  const handleAdClick = () => {
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogClose className="absolute right-2 top-2 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-6 w-6 text-white drop-shadow-lg" />
        </DialogClose>
        
        <div 
          className={ad.linkUrl ? "cursor-pointer" : ""}
          onClick={handleAdClick}
        >
          {ad.type === 'video' ? (
            <video 
              src={ad.url} 
              controls 
              autoPlay 
              muted
              className="w-full h-auto max-h-[80vh]"
            />
          ) : (
            <img 
              src={ad.url} 
              alt="Advertisement" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
