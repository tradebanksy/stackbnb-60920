import { useState } from "react";
import { Copy, Check, Link2, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShareItineraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string | null;
  isGenerating: boolean;
  onGenerateLink: () => void;
}

export function ShareItineraryDialog({
  open,
  onOpenChange,
  shareUrl,
  isGenerating,
  onGenerateLink,
}: ShareItineraryDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Trip Itinerary",
          text: "Check out my trip itinerary!",
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Itinerary
          </DialogTitle>
          <DialogDescription>
            Share your confirmed itinerary with friends and family.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Link2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Generate a shareable link for your itinerary. Anyone with the link can view it.
              </p>
              <Button 
                onClick={onGenerateLink} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Share Link"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                
                {typeof navigator.share === "function" && (
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleNativeShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Anyone with this link can view your itinerary
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
