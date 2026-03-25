import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Clock,
  Home,
  User,
  DollarSign,
  FileText,
  CreditCard,
  Receipt,
  Download,
  Printer,
  ChevronRight,
  Info,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Transaction Data
  const {
    data: transaction,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => apiFetch(`/transactions/${id}`),
    enabled: !!id,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["lease", transaction?.leaseId],
      });
      navigate("/dashboard/transactions");
    },
  });

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this transaction record? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate();
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  if (isError || !transaction)
    return <div className="alert alert-error">Transaction not found.</div>;

  const lease = transaction.lease;
  const tenant = lease?.tenant;
  const unit = lease?.unit;
  const property = unit?.property;
  const owner = property?.owner;

  const formattedAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(transaction.amount);

  return (
    <div className="animate-in fade-in duration-300 space-y-8 max-w-4xl mx-auto pb-12 print:pb-0 print:max-w-none print:m-0">
      <style>
        {`
          @media print {
            /* Hide the default browser headers and footers (URL, Date, Page No.) */
            @page { 
              size: auto;   /* auto is the initial value */
              margin: 0mm;  /* this affects the margin in the printer settings */
            }

            /* Reset body/container padding/margins for printer */
            html, body { 
              margin: 0 !important; 
              padding: 0 !important; 
              background-color: white !important; 
            }
            
            /* Hide theme-wide sidebars, navbars, or any other global layout elements */
            aside, nav, header, footer, .sidebar, .navbar { display: none !important; }
            
            main { padding: 0 !important; margin: 0 !important; }
            
            /* Ensure the receipt is the only thing visible and takes up proper space */
            .print-receipt-container { 
              display: block !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 20mm !important; /* Provide a safe margin around the receipt */
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/transactions"
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Transaction Details</h1>
            <p className="text-sm opacity-60">
              ID: {transaction.id.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn btn-ghost btn-sm gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-ghost text-error btn-sm btn-square"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:block print-receipt-container">
        {/* Receipt Visual */}
        <div className="lg:col-span-2 print:w-full print:max-w-2xl print:mx-auto">
          <div className="card bg-base-100 shadow-xl border border-base-200 relative overflow-hidden print:shadow-none print:border-none">
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="absolute top-2 right-4 opacity-5">
              <Receipt className="w-48 h-48 rotate-12" />
            </div>

            <div className="card-body p-8 sm:p-12 space-y-10">
              {/* Receipt Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="text-3xl font-black tracking-tighter text-primary">
                    URENTME
                  </div>
                  <p className="text-xs uppercase tracking-widest opacity-50 font-bold">
                    Official Payment Receipt
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {new Date(transaction.transactionDate).toLocaleDateString(
                      undefined,
                      { dateStyle: "long" },
                    )}
                  </p>
                  <p className="text-xs opacity-60">
                    {new Date(transaction.transactionDate).toLocaleTimeString(
                      undefined,
                      { timeStyle: "short" },
                    )}
                  </p>
                </div>
              </div>

              {/* Amount Focus */}
              <div className="py-8 border-y-2 border-dashed border-base-200 flex flex-col items-center justify-center space-y-2">
                <p className="text-sm uppercase tracking-widest opacity-40 font-bold">
                  Amount Paid
                </p>
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-base-content">
                  {formattedAmount}
                </div>
                {transaction.reference && (
                  <div className="badge badge-outline gap-2 mt-4 px-4 py-3 font-mono text-xs">
                    REF: {transaction.reference}
                  </div>
                )}
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">
                      Paid To
                    </h3>
                    <p className="font-bold text-sm">
                      {owner?.firstName} {owner?.lastName}
                    </p>
                    <p className="text-xs opacity-60">{owner?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">
                      Payer (Tenant)
                    </h3>
                    <p className="font-bold text-sm">
                      {tenant?.firstName} {tenant?.lastName}
                    </p>
                    <p className="text-xs opacity-60">{tenant?.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">
                      For Unit
                    </h3>
                    <p className="font-bold text-sm">{property?.name}</p>
                    <p className="text-xs opacity-60">
                      Unit {unit?.unitNumber} — {unit?.floor || "No Floor Info"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">
                      Allocation
                    </h3>
                    <p className="font-bold text-sm capitalize">
                      {transaction.notes || "Rent Payment"}
                    </p>
                    <p className="text-xs opacity-60">
                      Lease: #{transaction.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-8 border-t border-base-200 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 opacity-10">
                    <ShieldCheck className="w-full h-full" />
                  </div>
                </div>
                <p className="text-[10px] opacity-40 leading-relaxed max-w-xs mx-auto italic">
                  This is a computer-generated receipt and does not require a
                  physical signature. For any discrepancies, please contact
                  management immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Side Info */}
        <div className="space-y-4 print:hidden">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">
                Related Records
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/dashboard/leases/${transaction.leaseId}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 opacity-50" />
                    <span className="text-sm font-medium">Lease Agreement</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  to={`/dashboard/tenants/${tenant?.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 opacity-50" />
                    <span className="text-sm font-medium">Tenant Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  to={`/dashboard/units/${unit?.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 opacity-50" />
                    <span className="text-sm font-medium">Unit Details</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>

          <div className="alert alert-info bg-info/10 border-info/20 text-xs">
            <Info className="w-4 h-4" />
            <span>
              Payments are processed instantly and added to the tenant's ledger.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
