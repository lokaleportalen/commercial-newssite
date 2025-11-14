import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl = "/",
}: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Calculate page numbers to show (max 5 page numbers at a time)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis and pages
      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
      >
        {currentPage !== 1 ? (
          <Link href={`${baseUrl}?page=${currentPage - 1}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map((pageNum, index) => {
        if (pageNum === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          );
        }

        const isCurrentPage = pageNum === currentPage;

        return (
          <Button
            key={pageNum}
            variant={isCurrentPage ? "default" : "outline"}
            size="icon"
            asChild={!isCurrentPage}
          >
            {isCurrentPage ? (
              <span>{pageNum}</span>
            ) : (
              <Link href={`${baseUrl}?page=${pageNum}`}>{pageNum}</Link>
            )}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
      >
        {currentPage !== totalPages ? (
          <Link href={`${baseUrl}?page=${currentPage + 1}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
