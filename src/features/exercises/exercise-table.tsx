import { Table } from "@/components/ui/mantine-table";
import exerciseService from "@/services/exercise.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function ExerciseTable() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        const response = await exerciseService.searchExercise({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          sort_by: "created_at",
          order_by: "desc",
        });
        if (response.data) {
          setExercises(response.data.result.exercises);
          setTotal(response.data.result.total_items);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
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
        accessorKey: "mechanics",
        header: "Mechanics",
      },

      {
        accessorKey: "experience_level",
        header: "Experience Level",
      },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={exercises ?? []}
      rowCount={total ?? 0}
      enableRowSelection={false}
      onPaginationChange={setPagination}
      manualPagination
      state={{ pagination, isLoading }}
      enableRowActions={true}
      onActionClick={(row) => {
        navigate(`/manage-exercises/exercises/${row.original._id}`);
      }}
    />
  );
}

export default ExerciseTable;
