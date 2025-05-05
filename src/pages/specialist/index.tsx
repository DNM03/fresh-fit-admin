import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Specialist() {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <Card className="border-none shadow-sm bg-background">
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
          <h2 className="text-xl font-medium text-primary">Specialists</h2>
          <Button
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4"
            onClick={() => navigate("add-specialist")}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Specialist</span>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-md border bg-card shadow-sm">
            <div className="p-10 text-center text-muted-foreground">
              Your Specialists table will appear here
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Specialist;
