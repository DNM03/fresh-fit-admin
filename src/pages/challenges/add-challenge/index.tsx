import ChallengeForm from "@/features/challenges/challenge-form";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AddChallengePage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 px-24 relative">
      <button
        className="absolute top-4 left-4 border-2 p-2 rounded-full border-green-600 hover:bg-green-100"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-6 w-6 text-green-600" />
      </button>
      <ChallengeForm />
    </div>
  );
}

export default AddChallengePage;
