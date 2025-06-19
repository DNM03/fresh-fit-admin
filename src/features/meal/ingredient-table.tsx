import { Table } from "@/components/ui/mantine-table";
import ingredientService from "@/services/ingredient.service";
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function IngredientTable({
  onRefetchTriggered,
}: {
  onRefetchTriggered?: (refetch: () => void) => void;
}) {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  // Convert to useCallback to enable reuse through ref
  const fetchIngredients = useCallback(async () => {
    try {
      setIsLoading(true);
      const sortParams =
        sorting.length > 0 ? sorting[0] : { id: "name", desc: true };
      const response = await ingredientService.getIngredients({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort_by: sortParams.id,
        order_by: sortParams.desc ? "DESC" : "ASC",
        search: globalFilter,
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
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Register the refetch function with the parent component
  useEffect(() => {
    if (onRefetchTriggered) {
      onRefetchTriggered(fetchIngredients);
    }
  }, [fetchIngredients, onRefetchTriggered]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },

      // {
      //   accessorKey: "calories",
      //   header: "Calories",
      // },

      // {
      //   accessorKey: "protein",
      //   header: "Protein",
      // },
      // {
      //   accessorKey: "description",
      //   header: "Description",
      //   Cell: ({ row }) => (
      //     <p>
      //       {row.original.description.length > 25
      //         ? `${row.original.description.substring(0, 25)}...`
      //         : row.original.description}
      //     </p>
      //   ),
      //   enableSorting: false,
      // },
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
      state={{ pagination, isLoading, globalFilter, sorting }}
      enableRowActions={true}
      onActionClick={(row) => {
        navigate(`/manage-meals/ingredients/${row.original._id}`, {
          state: {
            ingredientData: row.original,
          },
        });
      }}
      onGlobalFilterChange={setGlobalFilter}
      enableColumnFilters={false}
      onSortingChange={setSorting}
    />
  );
}

export default IngredientTable;
