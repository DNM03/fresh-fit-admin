import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  FormField,
  FormMessage,
  FormItem,
} from "@/components/ui/form";

import { Checkbox } from "@/components/ui/checkbox";

type Props<S> = {
  fieldTitle: string;
  nameInSchema: keyof S & string;
  message: string;
  required?: boolean;
};

function CheckboxWithLabel<S>({
  fieldTitle,
  nameInSchema,
  message,
  required,
}: Props<S>) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className="w-full flex items-center gap-2">
          <FormLabel className="text-base w-1/3 mt-2" htmlFor={nameInSchema}>
            {fieldTitle} {required && <span className="text-red-500">*</span>}
          </FormLabel>

          <div className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                id={nameInSchema}
                {...field}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            {message}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default CheckboxWithLabel;
