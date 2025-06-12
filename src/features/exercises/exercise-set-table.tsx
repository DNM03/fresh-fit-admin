import { Table } from "@/components/ui/mantine-table";
import setService from "@/services/set.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function ExerciseSetTable() {
  const navigate = useNavigate();
  const [exerciseSets, setExerciseSets] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchExerciseSets = async () => {
      try {
        setIsLoading(true);
        const response = await setService.searchSet({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          type: "System",
          sort_by: "created_at",
          order_by: "DESC",
          search: globalFilter,
        });
        if (response.data) {
          setExerciseSets(response.data.result.sets);
          setTotal(response.data.result.total_items);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExerciseSets();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

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
        accessorKey: "number_of_exercises",
        header: "Number of Exercises",
      },

      {
        accessorKey: "type",
        header: "Type",
      },
    ],
    []
  );
  return (
    <Table
      columns={columns}
      data={exerciseSets ?? []}
      rowCount={total ?? 0}
      enableRowSelection={false}
      onPaginationChange={setPagination}
      manualPagination
      state={{ pagination, isLoading, globalFilter }}
      onGlobalFilterChange={setGlobalFilter}
      enableRowActions={true}
      onActionClick={(row) => {
        navigate(`/manage-exercises/exercise-sets/${row.original._id}`);
      }}
    />
  );
}

export default ExerciseSetTable;
