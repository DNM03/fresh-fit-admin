import { Table } from "@/components/ui/mantine-table";
import mealService from "@/services/meal.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function MealTable() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setIsLoading(true);
        const response = await mealService.getMeals({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          type: "System",
          meal_type: "All",
          sort_by: "created_at",
          order_by: "desc",
        });
        if (response.data) {
          setMeals(response.data.result.meals);
          setTotal(response.data.result.total_items);
        }
      } catch (error) {
        console.error("Error fetching meals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeals();
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
        accessorKey: "calories",
        header: "Calories",
      },

      {
        accessorKey: "meal_type",
        header: "Meal Type",
      },
    ],
    []
  );
  return (
    <Table
      columns={columns}
      data={meals ?? []}
      rowCount={total ?? 0}
      enableRowSelection={false}
      onPaginationChange={setPagination}
      manualPagination
      state={{ pagination, isLoading }}
      enableRowActions={true}
      onActionClick={(row) => {
        navigate(`/manage-meals/meals/${row.original._id}`);
      }}
    />
  );
}

export default MealTable;
