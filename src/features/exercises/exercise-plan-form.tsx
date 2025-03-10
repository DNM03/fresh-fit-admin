import InputWithLabel from "@/components/inputs/input-with-label";
import { Form } from "@/components/ui/form";
import { ExercisePlanType } from "@/constants/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

function ExercisePlanForm() {
  const defaultValues: ExercisePlanType = {
    name: "",
    description: "",
    duration: 0,
    sets: 0,
    reps: 0,
  };
  const form = useForm<ExercisePlanType>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(
      z.object({
        name: z.string().nonempty(),
        description: z.string().nonempty(),
        duration: z.number().int().positive(),
        sets: z.number().int().positive(),
        reps: z.number().int().positive(),
      })
    ),
  });
  async function submitForm(data: ExercisePlanType) {
    console.log(data);
  }
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="grid grid-cols-2 gap-5"
        >
          <InputWithLabel<ExercisePlanType>
            fieldTitle="Plan Name"
            nameInSchema="name"
            placeholder="Eg, 30 days full body workout"
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

export default ExercisePlanForm;
