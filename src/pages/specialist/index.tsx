import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SpecialistTable from "@/features/specialist/specialist-table";
import { PlusCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

function Specialist() {
  const navigate = useNavigate();
  const [isRefetching, setIsRefetching] = useState(false);
  const refetchRef = useRef<(() => void | Promise<any>) | null>(null);

  const handleRefetch = () => {
    if (refetchRef.current) {
      setIsRefetching(true);
      const result = refetchRef.current();
      if (result instanceof Promise) {
        result.finally(() => {
          setIsRefetching(false);
        });
      } else {
        setIsRefetching(false);
      }
    }
  };

  const registerRefetchFunction = (refetchFn: () => void | Promise<any>) => {
    refetchRef.current = refetchFn;
  };

  return (
    <div className="p-4">
      <Card className="border-none shadow-sm bg-background">
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
          <h2 className="text-xl font-medium text-primary">Specialists</h2>
          <div className="flex gap-2">
            {/* Add refresh button */}
            <Button
              className="flex items-center gap-2 px-4"
              variant={"outline"}
              onClick={handleRefetch}
              disabled={isRefetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              <span>{isRefetching ? "Refreshing..." : "Refresh"}</span>
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
              onClick={() => navigate("add-specialist")}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Specialist</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-md border bg-card shadow-sm">
            <SpecialistTable onRefetchTriggered={registerRefetchFunction} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Specialist;
