import InputWithLabel from "@/components/inputs/input-with-label";
import SelectWithLabel from "@/components/inputs/select-with-label";
import TextAreaWithLabel from "@/components/inputs/text-area-with-label";
import { Form } from "@/components/ui/form";
import { ExerciseType } from "@/constants/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function ExerciseForm() {
  const defaultValues: ExerciseType = {
    name: "",
    description: "",
    category: "cardio",
    calories_burned_per_minute: 0,
    image: "",
    video: "",
  };
  const form = useForm<ExerciseType>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(
      z.object({
        name: z.string().nonempty(),
        description: z.string().nonempty(),
        category: z.enum(["cardio", "strength"]),
        calories_burned_per_minute: z.coerce.number().int().positive(),
        image: z.string().url(),
        video: z.string().url(),
      })
    ),
  });
  async function submitForm(data: ExerciseType) {
    console.log(data);
  }

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (document.getElementById("imageInput")) {
      const imageInput = document.getElementById(
        "imageInput"
      ) as HTMLInputElement | null;
      if (imageInput) {
        imageInput.value = "";
      }
    }
  };
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="grid grid-cols-2 gap-5 items-start"
        >
          <InputWithLabel<ExerciseType>
            fieldTitle="Plan Name"
            nameInSchema="name"
            placeholder="Eg, Pushups"
            className="w-full"
          />
          <SelectWithLabel<ExerciseType>
            fieldTitle="Category"
            nameInSchema="category"
            className="w-full"
            data={[
              { description: "Cardio", id: "cardio" },
              { description: "Strength", id: "strength" },
            ]}
          />
          <InputWithLabel<ExerciseType>
            fieldTitle="Calories Burned Per Minute"
            nameInSchema="calories_burned_per_minute"
            placeholder="Eg, 10"
            className="w-full"
            type="number"
          />
          <TextAreaWithLabel<ExerciseType>
            fieldTitle="Description"
            nameInSchema="description"
            placeholder="Eg, Help to build chest muscles"
            className="w-full"
          />
          <div>
            <button type="submit">Submit</button>
            <button type="reset" onClick={() => form.reset(defaultValues)}>
              Reset
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ExerciseForm;
