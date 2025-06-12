import { Table } from "@/components/ui/mantine-table";
import challengeService from "@/services/challenge.service";
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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

  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      const sortParams =
        sorting.length > 0 ? sorting[0] : { id: "created_at", desc: true };
      const response = await challengeService.searchChallenge({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        type: "All",
        status: "All",
        sort_by: sortParams.id,
        order_by: sortParams.desc ? "DESC" : "ASC",
        search: globalFilter,
      });
      if (response.data) {
        setChallenges(response.data.result.challenges);
        setTotal(response.data.result.total_items);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Expose refetch function to parent via prop
  useEffect(() => {
    if (onRefetchTriggered) {
      onRefetchTriggered(fetchChallenges);
    }
  }, [fetchChallenges, onRefetchTriggered]);

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

  return (
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
  );
}

export default ChallengeTable;
