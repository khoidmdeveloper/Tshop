import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { buildPaginationItems, clampPageNumber, normalizePageNumber } from "@/lib/pagination";
import { cn } from "@/lib/utils";

const DISABLED_PAGE_CLASS_NAME = "pointer-events-none opacity-50";

function PaginationNav({ currentPage = 1, totalPages = 1, onPageChange, className }) {
  const safeTotalPages = normalizePageNumber(totalPages, 1);
  const safeCurrentPage = clampPageNumber(currentPage, safeTotalPages);

  if (safeTotalPages <= 1) {
    return null;
  }

  const items = buildPaginationItems(safeCurrentPage, safeTotalPages);

  const handlePageChange = (nextPage) => (event) => {
    event.preventDefault();

    if (nextPage < 1 || nextPage > safeTotalPages || nextPage === safeCurrentPage) {
      return;
    }

    onPageChange?.(nextPage);

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={safeCurrentPage === 1}
            className={cn(safeCurrentPage === 1 && DISABLED_PAGE_CLASS_NAME)}
            onClick={handlePageChange(safeCurrentPage - 1)}
          />
        </PaginationItem>

        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === safeCurrentPage}
                className={cn(
                  item === safeCurrentPage
                    ? "border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={handlePageChange(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={safeCurrentPage === safeTotalPages}
            className={cn(safeCurrentPage === safeTotalPages && DISABLED_PAGE_CLASS_NAME)}
            onClick={handlePageChange(safeCurrentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { PaginationNav };
