import { useState } from "react";
import { Link, useNavigate, useParams, type MetaFunction } from "react-router";
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
  ShieldAlert,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";

export const meta: MetaFunction = () => {
  return [
    { title: "Transaction Details | URentMe" },
    {
      name: "description",
      content: "View detailed financial record info, including lease binding and settlement details.",
    },
  ];
};

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: transaction,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => apiFetch(`/transactions/${id}`),
    enabled: !!id,
  });

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
    if (confirm("Are you sure you want to delete this transaction record? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (isError || !transaction) return <div className="alert alert-error">Failed to load transaction details.</div>;

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12 print:pb-0 print:max-w-none print:m-0">
      <style>
        {`
          @media print {
            @page { size: auto; margin: 0mm; }
            html, body { 
              margin: 0 !important; 
              padding: 0 !important; 
              background-color: #191e24 !important; 
              color: #a6adbb !important;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              height: 100% !important;
            }
            aside, nav, header, footer, .sidebar, .navbar { display: none !important; }
            main { padding: 0 !important; margin: 0 !important; }
            .print-receipt-container { 
              display: flex !important;
              width: 100% !important;
              height: 100vh !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 10mm !important;
              box-sizing: border-box !important;
              page-break-inside: avoid;
            }
            .print-receipt-container > .card {
              flex: 1 !important;
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
            }
          }
        `}
      </style>

      {/* Premium Gradient Hero Cover - Hidden on Print */}
      <div className={`h-48 md:h-56 w-full rounded-b-3xl bg-gradient-to-r from-success/90 to-primary-focus/90 shadow-lg relative overflow-hidden -mt-6 sm:-mt-8 print:hidden`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <Link
            to="/dashboard/transactions"
            className="btn btn-circle btn-sm md:btn-md bg-base-100/20 hover:bg-base-100/40 border-none text-white backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn btn-sm md:btn-md bg-base-100/90 hover:bg-base-100 border-none text-base-content gap-2 shadow-xl hover:scale-105 transition-all">
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button 
              onClick={handleDelete} 
              className="btn btn-square btn-sm md:btn-md bg-error/90 hover:bg-error border-none text-white shadow-xl hover:scale-105 transition-all"
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 text-white shadow-xl`}>
              <Receipt className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="badge badge-success badge-sm font-bold tracking-wider drop-shadow-sm border-none uppercase text-[10px]">Payment Confirmed</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                Receipt #{transaction?.id.slice(0,8).toUpperCase()}
              </h1>
            </div>
          </div>
          <div className="text-right">
             <div className="text-sm font-bold tracking-widest text-white/50 uppercase mb-1">Total Amount</div>
             <div className="text-3xl lg:text-5xl font-black text-white drop-shadow-lg tracking-tighter tabular-nums">{formattedAmount}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 print:mt-0 print:px-0 print:space-y-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start print:flex print:w-full print-receipt-container">
          
          {/* Main Receipt Content */}
          <div className="lg:col-span-8 print:w-full print:max-w-3xl print:mx-auto">
            <div className="card bg-base-100 shadow-xl border border-base-200 relative overflow-hidden print:shadow-none print:border-none print:rounded-none">
              
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <ShieldCheck className="w-[300px] h-[300px]" />
              </div>

              <div className="absolute top-0 left-0 w-full h-2 bg-success"></div>

              <div className="card-body p-8 sm:p-12 relative z-10 flex flex-col min-h-[500px] print:h-full">
                
                {/* Header Document Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-2 border-dashed border-base-200/80 pb-8 mb-8">
                  <div className="space-y-1">
                    <div className="text-4xl font-black tracking-tighter text-base-content/90">
                      URENTME
                    </div>
                    <p className="text-xs uppercase tracking-widest text-primary font-black mt-1">
                      Official Payment Receipt
                    </p>
                  </div>
                  <div className="text-left sm:text-right p-4 bg-base-200/50 rounded-xl border border-base-200">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 mb-1">Transaction Date</p>
                    <p className="text-sm font-black font-mono text-base-content whitespace-nowrap">
                      {new Date(transaction.transactionDate).toUTCString()}
                    </p>
                  </div>
                </div>

                {/* Primary Financial Data Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 flex-1">
                   <div className="space-y-6">
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mb-2 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Tenant Details</h3>
                        <div className="p-4 rounded-xl bg-base-200/30 border border-base-200 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-base-300 text-base-content/40 flex items-center justify-center font-black">{tenant?.firstName?.charAt(0)}</div>
                           <div>
                              <p className="font-bold text-base leading-tight">
                                {tenant?.firstName} {tenant?.lastName}
                              </p>
                              <p className="text-xs font-mono font-bold opacity-60 mt-0.5">{tenant?.email}</p>
                           </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mb-2 flex items-center gap-1.5"><Home className="w-3 h-3" /> Property & Unit Details</h3>
                        <div className="p-4 rounded-xl bg-base-200/30 border border-base-200 space-y-1">
                            <p className="font-black text-lg text-primary">{property?.name}</p>
                            <p className="text-sm font-bold text-base-content/70 flex items-center gap-2">
                              Unit {unit?.unitNumber} <span className="opacity-40">&bull;</span> {unit?.floor || "Floor Unknown"}
                            </p>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="h-full rounded-2xl bg-base-200/50 border border-primary/10 p-6 flex flex-col justify-center gap-1 text-center sm:text-right relative overflow-hidden">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-xl mix-blend-multiply"></div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mb-1 relative text-center z-10">Total Amount Paid</h3>
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-base-content tracking-tighter tabular-nums drop-shadow-sm relative z-10 text-center text-success">
                          {formattedAmount}
                        </div>
                        
                        <div className="mt-6 flex flex-col sm:items-center gap-2 relative z-10">
                           <div className="bg-base-200 border border-base-300 shadow-sm px-4 py-2 rounded-lg font-mono text-[10px] font-bold leading-none inline-flex flex-col items-center">
                              <span className="text-[8px] tracking-widest text-base-content/50 mb-1 uppercase text-center block w-full">Reference ID</span>
                              <span className="text-base-content">{transaction.reference || "NO-REFERENCE"}</span>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="mt-auto mb-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mb-2 pb-2 border-b border-base-200/60">Additional Notes</h3>
                  <div className="bg-base-200/30 p-4 rounded-xl font-medium text-sm leading-relaxed text-base-content/80 border border-base-200/60 min-h-20">
                     {transaction.notes || <span className="italic opacity-50">No additional notes or remarks provided for this transaction record.</span>}
                  </div>
                </div>

                {/* Footer Disclaimers */}
                <div className="pt-6 border-t font-mono border-base-200/80 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 bg-base-200 text-base-content/20 rounded-full flex justify-center items-center">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-[9px] font-bold text-base-content/40 leading-relaxed uppercase max-w-lg tracking-widest">
                    This is a computer-generated receipt. No physical signature is required. Transaction Ref: <span className="text-base-content/60">{transaction.id}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 print:hidden">
            
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2 border-b border-base-200/80 pb-3">
                  <Info className="w-4 h-4" /> Related Information
                </h3>
                <div className="space-y-3">
                  <Link
                    to={`/dashboard/leases/${transaction.lease.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-300/50 hover:bg-base-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent opacity-80" />
                      <div>
                        <span className="text-sm font-bold block mb-0.5 tracking-tight">Lease Details</span>
                        <span className="text-[10px] font-bold block opacity-50 uppercase tracking-wider">File #{transaction.lease.id.slice(0,8).toUpperCase()}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    to={`/dashboard/tenants/${tenant.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-300/50 hover:bg-base-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary opacity-80" />
                      <div>
                        <span className="text-sm font-bold block mb-0.5 tracking-tight">Tenant Profile</span>
                        <span className="text-[10px] font-bold block opacity-50 uppercase tracking-wider">{tenant.email}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    to={`/dashboard/units/${unit.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-300/50 hover:bg-base-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-success opacity-80" />
                      <div>
                        <span className="text-sm font-bold block mb-0.5 tracking-tight">Unit Details</span>
                        <span className="text-[10px] font-bold block opacity-50 uppercase tracking-wider">Unit {unit.unitNumber}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="alert alert-info shadow-sm bg-info/10 border border-info/20 text-xs text-info-content/90 font-medium leading-relaxed rounded-2xl flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 mt-0.5 text-info" />
              <span>
                Transaction integrity is strictly maintained. To ensure financial record safety, transactions cannot be edited once verified. If a correction is needed, please delete and re-create the record.
              </span>
            </div>

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
