import { Table } from "@/components/ui/mantine-table";
import healthPlanService from "@/services/health-plan.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";

function HealthPlanTable() {
  const [healthPlans, setHealthPlans] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchHealthPlans = async () => {
      try {
        setIsLoading(true);
        const response = await healthPlanService.searchHealthPlan({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          level: "All",
          status: "All",
          source: "System",
          sort_by: "created_at",
          order_by: "desc",
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
    };
    fetchHealthPlans();
  }, [pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
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
      },

      {
        accessorKey: "level",
        header: "Level",
      },

      {
        accessorKey: "number_of_weeks",
        header: "Number of Weeks",
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
      state={{ pagination, isLoading }}
      enableRowActions={true}
    />
  );
}

export default HealthPlanTable;
