import { Table } from "@/components/ui/mantine-table";
import dishService from "@/services/dish.service";
import { MRT_ColumnDef, MRT_PaginationState } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";

function DishTable() {
  const [dishes, setDishes] = useState([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setIsLoading(true);
        const response = await dishService.searchDishes({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        });
        if (response.data) {
          setDishes(response.data.result.dishes);
          setTotal(response.data.result.total_items);
        }
      } catch (error) {
        console.error("Error fetching dishes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDishes();
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
        accessorKey: "prep_time",
        header: "Preparation Time",
        Cell: ({ row }) => <span>{row.original.prep_time / 60} minutes</span>,
      },
    ],
    []
  );
  return (
    <Table
      columns={columns}
      data={dishes ?? []}
      rowCount={total ?? 0}
      enableRowSelection={false}
      onPaginationChange={setPagination}
      manualPagination
      state={{ pagination, isLoading }}
      enableRowActions={true}
    />
  );
}

export default DishTable;
