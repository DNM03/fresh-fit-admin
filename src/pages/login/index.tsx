import bg_image from "@/assets/images/fresh-fit-bg.jpg";
import app_logo from "@/assets/images/freshfit_logo.png";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services";
import { useState } from "react";
import { toast } from "sonner";
// Import Eye and EyeOff icons
import { Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const [_loading, setLoading] = useState<boolean>(false);
  const [_error, setError] = useState<string | null>(null);
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email({ message: "Invalid email format" }),
        password: z
          .string()
          .min(6, { message: "Password must be at least 6 characters" }),
      })
    ),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit: SubmitHandler<{ email: string; password: string }> = async (
    data
  ) => {
    console.log(data);
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      if (response.result.role !== 1) {
        toast.error("You are not authorized to access this application.", {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        });
        return;
      }
      console.log("Login successful", response);
      toast.success("Login successful!", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      navigate("/");
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else if (error.response?.status === 429) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error("Login error:", error);
      toast.error("Email or password is incorrect. Please try again.", {
        style: {
          background: "#cc3131",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="flex h-screen w-full items-center justify-center bg-slate-900 bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${bg_image})` }}
    >
      <div className="rounded-xl bg-slate-200/50 px-16 py-10 shadow-lg backdrop-blur-md max-sm:px-8">
        <form
          className="flex flex-col items-center text-[#176219] gap-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <img src={app_logo} width={200} height={200} alt="App logo" />
          <h1 className="text-3xl font-bold">Login</h1>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <div className="flex flex-col gap-y-1 w-full">
                <Input
                  placeholder="Enter email"
                  className="text-slate-900 rounded-md min-w-72"
                  value={value}
                  onChange={onChange}
                />
                {errors.email && (
                  <p className="text-red-500">{errors.email.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <div className="flex flex-col gap-y-1 w-full">
                <div className="relative">
                  <Input
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    className="text-slate-900 rounded-md"
                    value={value}
                    onChange={onChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-900 hover:text-slate-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}
          />
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {/* <Checkbox id="rememberMe" />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label> */}
            </div>
            <div className="inline-block">
              <Link to="/forgot-password" className="text-sm relative group">
                Forgot password
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] rounded-full bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            style={{ width: "100%" }}
            // className="w-full bg-slate-700 focus:ring-2 focus:ring-offset-1 focus:ring-slate-900"
          >
            Login
          </Button>
          {/* <div className="text-sm">
            {"Don't have an account? "}
            <Link
              to="/register"
              className="text-slate-900 font-bold  relative group"
            >
              Register
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] rounded-full bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div> */}
          {/* <p>OR</p>
          <div className="w-full relative">
            <Button
              type="button"
              className="w-full bg-white text-slate-700 hover:text-slate-200 focus:ring-2 focus:ring-offset-1 focus:ring-slate-900"
            >
              Continue with Google
            </Button>
            <img
              src={google_icon}
              width={20}
              height={20}
              alt="Google icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
            />
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
