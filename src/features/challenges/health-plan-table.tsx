import { Table } from "@/components/ui/mantine-table";
import healthPlanService from "@/services/health-plan.service";
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function HealthPlanTable({
  onRefetchTriggered,
}: {
  onRefetchTriggered?: (refetch: () => void) => void;
}) {
  const navigate = useNavigate();
  const [healthPlans, setHealthPlans] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const fetchHealthPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const sortParams =
        sorting.length > 0 ? sorting[0] : { id: "created_at", desc: true };
      const response = await healthPlanService.searchHealthPlan({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        level: "All",
        status: "All",
        source: "System",
        sort_by: sortParams.id,
        order_by: sortParams.desc ? "DESC" : "ASC",
        search: globalFilter,
      });
      if (response.data) {
        setHealthPlans(response.data.result.healthPlans);
        setTotal(response.data.result.total_items);
      }
    } catch (error) {
      console.error("Error fetching health plans:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting]);

  useEffect(() => {
    fetchHealthPlans();
  }, [fetchHealthPlans]);

  // Expose refetch function to parent via prop
  useEffect(() => {
    if (onRefetchTriggered) {
      onRefetchTriggered(fetchHealthPlans);
    }
  }, [fetchHealthPlans, onRefetchTriggered]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },

      {
        accessorKey: "level",
        header: "Level",
      },

      {
        accessorKey: "number_of_weeks",
        header: "Number of Weeks",
      },
      {
        accessorKey: "description",
        header: "Description",
        Cell: ({ row }) => (
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
      data={healthPlans ?? []}
      rowCount={total ?? 0}
      enableRowSelection={false}
      onPaginationChange={setPagination}
      manualPagination
      state={{ pagination, isLoading, globalFilter, sorting }}
      onGlobalFilterChange={setGlobalFilter}
      enableRowActions={true}
      onActionClick={(row) => {
        navigate(`/manage-challenges/health-plans/${row.original._id}`);
      }}
      onSortingChange={setSorting}
      enableColumnFilters={false}
    />
  );
}

export default HealthPlanTable;
