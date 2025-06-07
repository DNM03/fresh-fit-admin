import { useState, useEffect, MouseEvent, ChangeEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Option {
  id: string;
  description: string;
}

interface OptimizedSelectProps {
  options?: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  itemsPerPage?: number;

  // Server-side pagination props
  useServerPagination?: boolean;
  currentPage?: number;
  totalItems?: number;
  totalPages?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onSearch?: (term: string) => void;
}

const OptimizedSelect = ({
  options = [],
  value,
  onValueChange,
  placeholder = "Select an option",
  itemsPerPage = 20,

  // Server-side pagination props
  useServerPagination = false,
  currentPage: externalCurrentPage = 1,
  totalItems = 0,
  totalPages: externalTotalPages = 1,
  isLoading = false,
  onPageChange,
  onSearch,
}: OptimizedSelectProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [internalCurrentPage, setInternalCurrentPage] = useState<number>(1);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);

  // Use either server-provided or internal pagination state
  const currentPage = useServerPagination
    ? externalCurrentPage
    : internalCurrentPage;
  const totalPages = useServerPagination
    ? externalTotalPages
    : Math.ceil(filteredOptions.length / itemsPerPage);

  // Handle search with optional debounce
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (useServerPagination && onSearch) {
      // Add debounce to avoid excessive API calls
      const debounceTimeout = setTimeout(() => {
        onSearch(newSearchTerm);
      }, 1000); // 1000ms debounce time

      // Clear timeout on each keystroke
      return () => clearTimeout(debounceTimeout);
    }
  };

  // Apply search filter for client-side filtering and reset pagination when search term changes
  useEffect(() => {
    if (!useServerPagination) {
      const filtered = options.filter((option) =>
        option.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      setInternalCurrentPage(1);
    }
  }, [searchTerm, options, useServerPagination]);

  // Calculate pagination for client-side mode
  const startIndex = (internalCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOptions = useServerPagination
    ? options
    : filteredOptions.slice(startIndex, endIndex);

  const nextPage = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (currentPage < totalPages) {
      if (useServerPagination && onPageChange) {
        onPageChange(currentPage + 1);
      } else {
        setInternalCurrentPage(internalCurrentPage + 1);
      }
    }
  };

  const prevPage = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (currentPage > 1) {
      if (useServerPagination && onPageChange) {
        onPageChange(currentPage - 1);
      } else {
        setInternalCurrentPage(internalCurrentPage - 1);
      }
    }
  };

  return (
    <div className="space-y-2 w-full">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] min-h-[300px] overflow-auto min-w-[600px]">
          <div className="sticky top-0 bg-white p-2 z-10">
            <div className="flex items-center border rounded-md px-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
                placeholder="Search options..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : currentOptions.length === 0 ? (
            <div className="p-2 text-center text-gray-500">
              No results found
            </div>
          ) : (
            <>
              {currentOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.description}
                </SelectItem>
              ))}
            </>
          )}

          {totalPages > 1 && (
            <div className="sticky bottom-0 bg-white p-2 border-t flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1 || isLoading}
                className="h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
                {useServerPagination &&
                  totalItems > 0 &&
                  ` (${totalItems} items)`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages || isLoading}
                className="h-8 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default OptimizedSelect;
