import { Link } from "react-router";
import { CheckCircle } from "lucide-react";

export default function InviteSuccess() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl text-center">
        <div className="card-body items-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-base-content/70 mb-6">
            Your tenant portal account has been successfully created. You can now log in to view your lease, pay rent, and submit maintenance requests.
          </p>
          <div className="card-actions w-full">
            <Link to="/login" className="btn btn-primary w-full shadow-sm shadow-primary/20">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
