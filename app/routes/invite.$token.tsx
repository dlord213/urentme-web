import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useActionData } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  // Mock token validation
  if (!params.token) {
    throw new Response("Not Found", { status: 404 });
  }
  return { token: params.token };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }
  
  if (!password || (password as string).length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  // Simulate account creation & hashing
  // const hashed = await bcrypt.hash(password, 10);
  // await db.user.create({ data: { role: 'TENANT', tenantId: mockTenantId, password: hashed }});
  
  console.log("Mock: Created user record with role TENANT and hashed password for token", params.token);

  return redirect("/invite/success");
}

export default function InviteSetup() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-success mb-2">URentMe</h1>
            <h2 className="text-xl font-semibold">Set Up Your Tenant Portal Account</h2>
            <p className="text-base-content/70 mt-2">
              Please choose a password to complete your account setup and access your portal.
            </p>
          </div>
          
          {actionData?.error && (
            <div className="alert alert-error shadow-sm mb-4">
              <span>{actionData.error}</span>
            </div>
          )}

          <Form method="post" className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <input 
                type="password" 
                name="password"
                className="input input-bordered w-full" 
                required 
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                className="input input-bordered w-full" 
                required 
              />
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary w-full shadow-md shadow-primary/20">
                Set Password & Create Account
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
