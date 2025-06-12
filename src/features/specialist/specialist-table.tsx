import { Table } from "@/components/ui/mantine-table";
import specialistService from "@/services/specialist.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function SpecialistTable({
  onRefetchTriggered,
}: {
  onRefetchTriggered?: (refetch: () => void) => void;
}) {
  const navigate = useNavigate();
  const [specialists, setSpecialists] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");

  // Convert to useCallback to enable reuse through ref
  const fetchSpecialists = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await specialistService.getSpecialists({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort_by: "createdAt",
        order_by: "DESC",
        search: globalFilter,
      });
      if (response.data) {
        setSpecialists(response.data.data.experts);
        setTotal(response.data.data.total_items);
      }
    } catch (error) {
      console.error("Error fetching specialists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  // Register the refetch function with the parent component
  useEffect(() => {
    if (onRefetchTriggered) {
      onRefetchTriggered(fetchSpecialists);
    }
  }, [fetchSpecialists, onRefetchTriggered]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "user.fullName",
        header: "Full Name",
      },
      {
        accessorKey: "user.username",
        header: "Username",
      },
      {
        accessorKey: "specialization",
        header: "Specialization",
      },
      {
        accessorKey: "experience_years",
        header: "Experience Years",
      },
      {
        accessorKey: "user.status",
        header: "Status",
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                status === "Normal"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={specialists ?? []}
      rowCount={total ?? 0}
      enableRowSelection={false}
      onPaginationChange={setPagination}
      manualPagination
      state={{ pagination, isLoading, globalFilter }}
      onGlobalFilterChange={setGlobalFilter}
      enableRowActions={true}
      onActionClick={(row) => {
        navigate(`/manage-specialists/${row.original.userId}`);
      }}
    />
  );
}

export default SpecialistTable;
