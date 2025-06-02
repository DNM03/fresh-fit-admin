import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dishService from "@/services/dish.service";
import { toast } from "sonner";

interface Ingredient {
  _id: string;
  name: string;
}

interface IngredientInDish {
  _id: string;
  quantity: string | number;
  unit: string;
  ingredient: Ingredient;
}

interface UpdateDishIngredientFormProps {
  dishId: string;
  ingredientItem: IngredientInDish;
  onSuccess: () => void;
}

function UpdateDishIngredientForm({
  dishId,
  ingredientItem,
  onSuccess,
}: UpdateDishIngredientFormProps) {
  const [quantity, setQuantity] = useState<string>(
    String(ingredientItem.quantity)
  );
  const [unit, setUnit] = useState<string>(ingredientItem.unit || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await dishService.updateDishIngredient(dishId, ingredientItem._id, {
        ingredientId: ingredientItem.ingredient._id,
        quantity: quantity,
        unit: unit,
      });

      toast.success("Ingredient updated successfully!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      onSuccess();
    } catch (error) {
      console.error("Error updating ingredient in dish:", error);
      toast.error("Failed to update ingredient. Please try again.", {
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
      <div className="border p-3 rounded-md bg-gray-50">
        <p className="font-medium">{ingredientItem?.ingredient?.name}</p>
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
            onChange={(e) => setUnit(e.target.value)}
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
          {isSubmitting ? "Updating..." : "Update Ingredient"}
        </Button>
      </div>
    </form>
  );
}

export default UpdateDishIngredientForm;
