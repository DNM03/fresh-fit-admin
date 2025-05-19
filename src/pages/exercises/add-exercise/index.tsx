import ExerciseForm from "@/features/exercises/exercise-form";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AddExercisePage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 px-24 relative">
      {/* <h1 className="mb-8">Add New Exercise</h1> */}
      <button
        className="absolute top-4 left-4 border-2 p-2 rounded-full border-green-600 hover:bg-green-100"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-6 w-6 text-green-600" />
      </button>

      <ExerciseForm />
    </div>
  );
}

export default AddExercisePage;
