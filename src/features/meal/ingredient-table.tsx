import { Table } from "@/components/ui/mantine-table";
import ingredientService from "@/services/ingredient.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";

function IngredientTable() {
  const [ingredients, setIngredients] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        const response = await ingredientService.getIngredients({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        });
        if (response.data) {
          setIngredients(response.data.result.ingredients);
          setTotal(response.data.result.total_items);
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIngredients();
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
        accessorKey: "protein",
        header: "Protein",
      },
    ],
    []
  );
  return (
    <Table
      columns={columns}
      data={ingredients ?? []}
      rowCount={total ?? 0}
      enableRowSelection={false}
      onPaginationChange={setPagination}
      manualPagination
      state={{ pagination, isLoading }}
      enableRowActions={true}
    />
  );
}

export default IngredientTable;
