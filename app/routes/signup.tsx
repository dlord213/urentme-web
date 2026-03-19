import { Link, useNavigate } from "react-router";
import { Building, Lock, Mail, User } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy signup, go to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-primary text-primary-content p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-content text-primary flex items-center justify-center font-bold text-2xl shadow-lg">U</div>
          <span className="text-2xl font-bold">URentMe</span>
        </div>
        
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight mb-6">Start managing your properties like a pro.</h1>
          <ul className="space-y-4 text-lg opacity-90">
            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-primary-content/20 flex items-center justify-center text-sm">✓</span> Automate rent collection</li>
            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-primary-content/20 flex items-center justify-center text-sm">✓</span> Streamline work orders</li>
            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-primary-content/20 flex items-center justify-center text-sm">✓</span> Powerful accounting tools</li>
            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-primary-content/20 flex items-center justify-center text-sm">✓</span> Secure tenant screening</li>
          </ul>
        </div>
        
        <div className="relative z-10 opacity-70 text-sm">
          © 2026 URentMe. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-base-100">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-2xl shadow-lg">U</div>
              <span className="text-2xl font-bold text-primary">URentMe</span>
            </div>
          </div>
        
          <h2 className="text-3xl font-bold mb-2">Create an account</h2>
          <p className="text-base-content/60 mb-8">Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">First Name</span></label>
                <label className="input input-bordered flex items-center gap-2">
                  <User className="w-4 h-4 opacity-70" />
                  <input type="text" className="grow" placeholder="John" required />
                </label>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Last Name</span></label>
                <input type="text" className="input input-bordered w-full" placeholder="Doe" required />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Company / Portfolio Name</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <Building className="w-4 h-4 opacity-70" />
                <input type="text" className="grow" placeholder="Doe Properties LLC" />
              </label>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Email Address</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-70" />
                <input type="email" className="grow" placeholder="john@example.com" required />
              </label>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Password</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock className="w-4 h-4 opacity-70" />
                <input type="password" className="grow" placeholder="Create a strong password" minLength={8} required />
              </label>
            </div>
            
            <div className="form-control mt-8">
              <button type="submit" className="btn btn-primary w-full shadow-lg shadow-primary/30">Create Account</button>
            </div>
            <p className="text-xs text-center text-base-content/60 mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
          
          <div className="mt-8 text-center text-sm border-t border-base-200 pt-8">
            Already have an account? <Link to="/login" className="link link-primary font-medium text-base">Log in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
