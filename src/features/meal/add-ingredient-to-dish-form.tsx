import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OptimizedSelect from "@/components/ui/optimized-select";
import ingredientService from "@/services/ingredient.service";
import dishService from "@/services/dish.service";
import { toast } from "sonner";

interface AddIngredientToDishFormProps {
  dishId: string;
  onSuccess: () => void;
}

function AddIngredientToDishForm({
  dishId,
  onSuccess,
}: AddIngredientToDishFormProps) {
  const [ingredientOptions, setIngredientOptions] = useState<
    { id: string; description: string }[]
  >([]);
  const [ingredientPagination, setIngredientPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoadingIngredients, setIsLoadingIngredients] =
    useState<boolean>(false);
  const [searchIngredientQuery, setSearchIngredientQuery] =
    useState<string>("");
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [unit, setUnit] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchIngredients = async (page: number, search: string = "") => {
    setIsLoadingIngredients(true);
    try {
      const response = await ingredientService.getIngredients({
        page,
        limit: 20,
        search,
      });

      if (response.data?.result) {
        const {
          ingredients,
          page: currentPage,
          total_items,
          total_pages,
        } = response.data.result;

        const formattedOptions = ingredients.map((ing: any) => ({
          id: ing.id || ing._id,
          description: ing.name,
          _originalData: ing,
        }));

        setIngredientOptions(formattedOptions);
        setIngredientPagination({
          currentPage,
          totalItems: total_items,
          totalPages: total_pages,
        });
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setIsLoadingIngredients(false);
    }
  };

  useEffect(() => {
    fetchIngredients(1);
  }, []);

  const handleIngredientPageChange = (page: number) => {
    fetchIngredients(page, searchIngredientQuery);
  };

  const handleIngredientSearch = (term: string) => {
    setSearchIngredientQuery(term);
    fetchIngredients(1, term);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIngredientId) {
      toast.error("Please select an ingredient", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Adding ingredient to dish:", {
        dishId,
        selectedIngredientId,
        quantity: quantity,
        unit: unit,
      });
      await dishService.addDishIngredient(dishId, {
        ingredientId: selectedIngredientId,
        quantity: quantity,
        unit: unit,
      });

      toast.success("Ingredient added successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding ingredient to dish:", error);
      toast.error("Failed to add ingredient. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ingredient">Ingredient</Label>
        <OptimizedSelect
          options={ingredientOptions}
          value={selectedIngredientId}
          onValueChange={(value) => setSelectedIngredientId(value)}
          placeholder="Search and select an ingredient"
          useServerPagination={true}
          currentPage={ingredientPagination.currentPage}
          totalItems={ingredientPagination.totalItems}
          totalPages={ingredientPagination.totalPages}
          isLoading={isLoadingIngredients}
          onPageChange={handleIngredientPageChange}
          onSearch={handleIngredientSearch}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="E.g., 2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => {
              console.log("Unit input changed:", e.target.value);
              const value = e.target.value;
              if (!/\d/.test(value)) {
                setUnit(value);
              }
            }}
            placeholder="E.g., cups, tbsp"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="mr-2"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Ingredient"}
        </Button>
      </div>
    </form>
  );
}

export default AddIngredientToDishForm;
