"use client";

import { useState } from "react";
import { Linkedin, Mail, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
  summary?: string | null;
}

export function ShareButtons({ title, url, summary }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link kopieret!", {
        description: "Artikellinket er kopieret til udklipsholderen",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Kunne ikke kopiere link", {
        description: "Prøv venligst igen",
      });
    }
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(
      `${summary || title}\n\nLæs mere: ${url}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="border-t border-b py-6 my-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">Del denne artikel</h3>
          <p className="text-sm text-muted-foreground">
            Hjælp os med at sprede nyheden
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* LinkedIn Share */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLinkedInShare}
            className="gap-2"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>

          {/* Email Share */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailShare}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>

          {/* Copy Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Kopieret!
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Kopier link
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
