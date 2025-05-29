import { Table } from "@/components/ui/mantine-table";
import specialistService from "@/services/specialist.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";

function SpecialistTable() {
  const [specialists, setSpecialists] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        setIsLoading(true);
        const response = await specialistService.getSpecialists({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
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
    };
    fetchSpecialists();
  }, [pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "fullName",
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
      state={{ pagination, isLoading }}
      enableRowActions={true}
    />
  );
}

export default SpecialistTable;
