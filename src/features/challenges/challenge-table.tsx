import { Table } from "@/components/ui/mantine-table";
import challengeService from "@/services/challenge.service";
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function ChallengeTable({
  onRefetchTriggered,
}: {
  onRefetchTriggered?: (refetch: () => void) => void;
}) {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  // Add state for status filter
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  // Add state for type filter
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      const sortParams =
        sorting.length > 0 ? sorting[0] : { id: "created_at", desc: true };

      const requestParams: any = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        type: typeFilter || "All",
        status: statusFilter || "All",
        sort_by: sortParams.id,
        order_by: sortParams.desc ? "DESC" : "ASC",
        search: globalFilter,
      };

      const response = await challengeService.searchChallenge(requestParams);

      if (response.data) {
        setChallenges(response.data.result.challenges);
        setTotal(response.data.result.total_items);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    sorting,
    statusFilter,
    typeFilter,
  ]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Expose refetch function to parent via prop
  useEffect(() => {
    if (onRefetchTriggered) {
      onRefetchTriggered(fetchChallenges);
    }
  }, [fetchChallenges, onRefetchTriggered]);

  // Handle applying the status filter
  const handleApplyStatusFilter = (status: string) => {
    setStatusFilter(status === "All" ? null : status);
    setFilterOpen(false);
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle applying the type filter
  const handleApplyTypeFilter = (type: string) => {
    setTypeFilter(type === "All" ? null : type);
    setFilterOpen(false);
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle removing all filters
  const handleRemoveAllFilters = () => {
    setStatusFilter(null);
    setTypeFilter(null);
    setFilterOpen(false);
  };

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "description",
        header: "Description",
        Cell: ({ row }: { row: any }) => (
          <p>
            {row.original.description.length > 25
              ? `${row.original.description.substring(0, 25)}...`
              : row.original.description}
          </p>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  // Create filter indicators for the UI
  const getStatusFilterText = () => {
    return statusFilter ? `Status: ${statusFilter}` : null;
  };

  const getTypeFilterText = () => {
    return typeFilter ? `Type: ${typeFilter}` : null;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2 lg:px-3"
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4 p-1">
              <h4 className="font-medium leading-none">Challenge Filters</h4>
              
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  onValueChange={handleApplyStatusFilter}
                  defaultValue={statusFilter || "All"}
                  value={statusFilter || "All"}
                >
                  <SelectTrigger id="status-filter" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  onValueChange={handleApplyTypeFilter}
                  defaultValue={typeFilter || "All"}
                  value={typeFilter || "All"}
                >
                  <SelectTrigger id="type-filter" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Fitness">Fitness</SelectItem>
                    <SelectItem value="Eating">Eating</SelectItem>
                    <SelectItem value="Combo">Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAllFilters}
                  disabled={!statusFilter && !typeFilter}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Status filter badge */}
        {statusFilter && (
          <Badge variant="outline" className="gap-1 px-2 py-1">
            <span>{getStatusFilterText()}</span>
            <button
              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              onClick={() => setStatusFilter(null)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        
        {/* Type filter badge */}
        {typeFilter && (
          <Badge variant="outline" className="gap-1 px-2 py-1">
            <span>{getTypeFilterText()}</span>
            <button
              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              onClick={() => setTypeFilter(null)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <Table
        columns={columns}
        data={challenges ?? []}
        rowCount={total ?? 0}
        enableRowSelection={false}
        onPaginationChange={setPagination}
        manualPagination
        state={{ pagination, isLoading, globalFilter, sorting }}
        onGlobalFilterChange={setGlobalFilter}
        enableRowActions={true}
        onActionClick={(row) => {
          navigate(`/manage-challenges/${row.original._id}`);
        }}
        onSortingChange={setSorting}
        enableColumnFilters={false}
      />
    </div>
  );
}

export default ChallengeTable;
