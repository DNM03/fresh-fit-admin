import { Table } from "@/components/ui/mantine-table";
import challengeService from "@/services/challenge.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
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

  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await challengeService.searchChallenge({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        type: "All",
        status: "All",
        sort_by: "created_at",
        order_by: "desc",
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
  }, [pagination.pageIndex, pagination.pageSize]);

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
        accessorKey: "description",
        header: "Description",
        Cell: ({ row }: { row: any }) => (
          <p>
            {row.original.description.length > 25
              ? `${row.original.description.substring(0, 25)}...`
              : row.original.description}
          </p>
        ),
      },

      {
        accessorKey: "type",
        header: "Type",
      },

      {
        accessorKey: "status",
        header: "Status",
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
      state={{ pagination, isLoading }}
      enableRowActions={true}
      onActionClick={(row) => {
        navigate(`/manage-challenges/${row.original._id}`);
      }}
    />
  );
}

export default ChallengeTable;
