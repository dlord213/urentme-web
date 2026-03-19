import { Link, useNavigate } from "react-router";
import { Lock, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login, go to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-2xl shadow-lg mb-4">U</div>
            <h2 className="card-title text-2xl font-bold">Welcome Back</h2>
            <p className="text-base-content/60 text-sm mt-1">Sign in to manage your properties</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-70" />
                <input type="email" className="grow" placeholder="admin@urentme.com" required defaultValue="admin@urentme.com" />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock className="w-4 h-4 opacity-70" />
                <input type="password" className="grow" placeholder="••••••••" required defaultValue="password123" />
              </label>
              <label className="label">
                <a href="#" className="label-text-alt link link-hover text-primary">Forgot password?</a>
              </label>
            </div>
            
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary w-full shadow-lg shadow-primary/30">Sign In</button>
            </div>
          </form>

          <div className="divider text-sm text-base-content/60">OR</div>
          
          <div className="text-center text-sm">
            Don't have an account? <Link to="/signup" className="link link-primary font-medium">Sign up now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
