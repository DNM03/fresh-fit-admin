import { useFormContext, Path } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  FormField,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputHTMLAttributes } from "react";

type Props<S> = {
  fieldTitle: string;
  nameInSchema: Path<S>;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function InputWithLabel<S>({
  fieldTitle,
  nameInSchema,
  className,
  ...props
}: Props<S>) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base" htmlFor={nameInSchema}>
            {fieldTitle}{" "}
            {props.required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              id={nameInSchema}
              className={`w-full disabled:text-blue-500 dark:disabled:text-green-500 disabled:opacity-75 ${className}`}
              {...field}
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default InputWithLabel;
