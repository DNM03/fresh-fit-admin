import ExerciseSetForm from "@/features/exercises/exercise-set-form";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AddExerciseSetPage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 px-24 relative">
      {/* <h1 className="mb-8">Add New Exercise Set</h1> */}
      <button
        className="absolute top-4 left-4 border-2 p-2 rounded-full border-green-600 hover:bg-green-100"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-6 w-6 text-green-600" />
      </button>
      <ExerciseSetForm />
    </div>
  );
}

export default AddExerciseSetPage;
