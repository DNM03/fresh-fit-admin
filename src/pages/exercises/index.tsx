import { useMemo, useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Table } from "@/components/ui/mantine-table";
import ExerciseTabs from "@/features/exercises/exercise-tabs";
type Person = {
  name: {
    firstName: string;
    lastName: string;
  };
  address: string;
  city: string;
  state: string;
};

//nested data is ok, see accessorKeys in ColumnDef below

function ManageExercises() {
  const [data, setData] = useState<Person[]>([
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Robert",
        lastName: "Smith",
      },
      address: "566 Brakus Inlet",
      city: "Westerville",
      state: "West Virginia",
    },
    {
      name: {
        firstName: "Kevin",
        lastName: "Yan",
      },
      address: "7777 Kuhic Knoll",
      city: "South Linda",
      state: "West Virginia",
    },
    {
      name: {
        firstName: "John",
        lastName: "Upton",
      },
      address: "722 Emie Stream",
      city: "Huntington",
      state: "Washington",
    },
    {
      name: {
        firstName: "Nathan",
        lastName: "Harris",
      },
      address: "1 Kuhic Knoll",
      city: "Ohiowa",
      state: "Nebraska",
    },
  ]);
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "name.firstName", //access nested data with dot notation
        header: "First Name",
      },
      {
        accessorKey: "name.lastName",
        header: "Last Name",
      },
      {
        accessorKey: "address", //normal accessorKey
        header: "Address",
      },
      {
        accessorKey: "city",
        header: "City",
      },
      {
        accessorKey: "state",
        header: "State",
      },
    ],
    []
  );

  return (
    <div className="p-4">
      {/* <Table columns={columns} data={data} /> */}
      <ExerciseTabs />
    </div>
  );
}

export default ManageExercises;
