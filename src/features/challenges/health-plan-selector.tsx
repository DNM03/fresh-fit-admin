import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Search,
  Plus,
  X,
  Loader2,
  FlameIcon,
  CalendarRange,
  Dumbbell,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import healthPlanService from "@/services/health-plan.service";
import { format } from "date-fns";

type HealthPlanSelectorProps = {
  availablePlans?: any[];
  selectedPlans: any[];
  onAddPlan: (plan: any) => void;
  onRemovePlan: (planId: string) => void;
};

export default function HealthPlanSelector({
  availablePlans = [],
  selectedPlans,
  onAddPlan,
  onRemovePlan,
}: HealthPlanSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [plans, setPlans] = useState<any[]>(availablePlans);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 8,
  });

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset selection when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setSelectedPlanId(null);
    }
  }, [dialogOpen]);

  // Fetch plans from API
  const fetchPlans = async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      const response = await healthPlanService.searchHealthPlan({
        page,
        limit: pagination.limit,
        search,
        level: "All",
        status: "All",
        source: "System",
      });

      if (response?.data?.result) {
        const {
          healthPlans: fetchedPlans,
          page: currentPage,
          total_items,
          total_pages,
          limit,
        } = response.data.result;

        console.log("Fetched health plans:", fetchedPlans);

        setPlans(fetchedPlans);
        setPagination({
          currentPage,
          totalPages: total_pages,
          totalItems: total_items,
          limit,
        });
      }
    } catch (error) {
      console.error("Error fetching health plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchPlans(1, debouncedSearchQuery);
    }
  }, [dialogOpen, debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    fetchPlans(newPage, debouncedSearchQuery);
  };

  const handleCheckboxChange = (planId: string) => {
    setSelectedPlanId(selectedPlanId === planId ? null : planId);
  };

  const handleAddSelected = () => {
    if (selectedPlanId) {
      const plan = plans.find((p) => p._id === selectedPlanId);
      if (plan) {
        // Clear any existing selections
        if (selectedPlans.length > 0) {
          selectedPlans.forEach((p) => onRemovePlan(p._id));
        }
        // Add the new selection
        onAddPlan(plan);
      }
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-blue-600" />
          Health Plan
        </Label>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (open && plans?.length === 0) {
              fetchPlans(1);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {selectedPlans.length === 0
                ? "Add Health Plan"
                : "Change Health Plan"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select a Health Plan</DialogTitle>
              <DialogDescription>
                Choose one health plan to associate with this challenge.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between my-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search health plans..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="col-span-2 flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading health plans...</span>
                </div>
              ) : plans?.length > 0 ? (
                plans?.map((plan) => (
                  <button
                    type="button"
                    key={plan._id}
                    className={`border p-3 rounded-md transition-all duration-200 ${
                      plan.challenge !== null && plan.challenge !== undefined
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : `cursor-pointer ${
                            selectedPlanId === plan._id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          }`
                    }`}
                    onClick={() => handleCheckboxChange(plan._id)}
                    disabled={
                      plan.challenge !== null && plan.challenge !== undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            plan.challenge !== null &&
                            plan.challenge !== undefined
                              ? "text-gray-400"
                              : "text-gray-900"
                          }`}
                        >
                          {plan.name}
                        </div>
                        <div
                          className={`text-sm line-clamp-1 ${
                            plan.challenge !== null &&
                            plan.challenge !== undefined
                              ? "text-gray-300"
                              : "text-gray-500"
                          }`}
                        >
                          {plan.description}
                        </div>
                        <div
                          className={`flex items-center mt-1 text-xs space-x-3 ${
                            plan.challenge !== null &&
                            plan.challenge !== undefined
                              ? "text-gray-300"
                              : "text-gray-600"
                          }`}
                        >
                          <div className="flex items-center">
                            <CalendarRange
                              className={`h-3.5 w-3.5 mr-1 ${
                                plan.challenge !== null &&
                                plan.challenge !== undefined
                                  ? "text-gray-300"
                                  : "text-blue-600"
                              }`}
                            />
                            <span>{plan.number_of_weeks} weeks</span>
                          </div>
                          <div className="flex items-center">
                            <Dumbbell
                              className={`h-3.5 w-3.5 mr-1 ${
                                plan.challenge !== null &&
                                plan.challenge !== undefined
                                  ? "text-gray-300"
                                  : "text-green-600"
                              }`}
                            />
                            <span>{plan.level}</span>
                          </div>
                        </div>
                      </div>
                      {!(
                        plan.challenge !== null && plan.challenge !== undefined
                      ) && (
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedPlanId === plan._id
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPlanId === plan._id && (
                            <div className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">
                    No health plans found matching your criteria.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
                <span className="ml-2">
                  ({pagination.totalItems} plans total)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages ||
                    isLoading
                  }
                >
                  Next
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSelected}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedPlanId || isLoading}
              >
                {selectedPlans.length === 0
                  ? "Add Selected Plan"
                  : "Change Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {selectedPlans?.length > 0 ? (
        <div className="space-y-3">
          <Card className="p-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{selectedPlans[0].name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => onRemovePlan(selectedPlans[0]._id)}
                  >
                    <X size={14} />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {selectedPlans[0].description}
                </p>

                <div className="grid grid-cols-2 mt-3 gap-2">
                  <div className="border rounded-md p-2 bg-blue-50">
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="flex items-center">
                      <CalendarRange className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                      <span className="font-medium">
                        {selectedPlans[0].number_of_weeks} weeks
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedPlans[0].start_date &&
                      selectedPlans[0].end_date ? (
                        <>
                          {format(
                            new Date(selectedPlans[0].start_date),
                            "MMM d"
                          )}{" "}
                          -{" "}
                          {format(
                            new Date(selectedPlans[0].end_date),
                            "MMM d, yyyy"
                          )}
                        </>
                      ) : (
                        "No dates specified"
                      )}
                    </div>
                  </div>

                  <div className="border rounded-md p-2 bg-green-50">
                    <div className="text-xs text-gray-500">Level</div>
                    <div className="flex items-center">
                      <Dumbbell className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                      <span className="font-medium">
                        {selectedPlans[0].level}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedPlans[0].status || "Status not specified"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <div className="flex-1 border rounded-md p-2 bg-amber-50">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Calories Burned
                      </div>
                      <div className="flex items-center text-sm font-medium">
                        <FlameIcon className="h-3.5 w-3.5 mr-1 text-amber-500" />
                        {selectedPlans[0].estimated_calories_burned}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 border rounded-md p-2 bg-green-50">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Calories Intake
                      </div>
                      <div className="flex items-center text-sm font-medium">
                        <FlameIcon className="h-3.5 w-3.5 mr-1 text-green-500" />
                        {selectedPlans[0].estimated_calories_intake}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400">
          <p>No health plan selected</p>
        </div>
      )}
    </div>
  );
}
