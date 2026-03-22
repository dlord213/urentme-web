import { PhilippinePeso, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import { StatsCard } from "../../components/StatsCard";

const MOCK_BILLS = [
  { id: "BLL-001", description: "April 2025 Rent", dueDate: "2025-04-01", amount: "₱1,450.00", status: "Unpaid" },
  { id: "BLL-002", description: "Trash / Valet Service (April)", dueDate: "2025-04-01", amount: "₱25.00", status: "Unpaid" },
];

const statusBadge = (s: string) => {
  if (s === "Unpaid") return <span className="badge badge-warning badge-sm font-semibold">Unpaid</span>;
  if (s === "Overdue") return <span className="badge badge-error badge-sm font-semibold">Overdue</span>;
  return <span className="badge badge-ghost badge-sm font-semibold">{s}</span>;
};

const amountCell = (val: string) => <span className="font-bold">{val}</span>;

export default function TenantPayments() {
  const totalDue = MOCK_BILLS.reduce((sum, bill) => {
    return sum + parseFloat(bill.amount.replace(/[^0-9.-]+/g,""));
  }, 0);

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Balances & Bills"
        description="View your open charges and make payments."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            Pay Total: ₱{totalDue.toLocaleString('en-PH', {minimumFractionDigits: 2})}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Open Charges</h2>
              <DataTable
                columns={[
                  { key: "description", label: "Description" },
                  { key: "dueDate", label: "Due Date" },
                  { key: "amount", label: "Amount", render: amountCell },
                  { key: "status", label: "Status", render: statusBadge },
                ]}
                data={MOCK_BILLS}
                emptyMessage="You have no open bills."
              />
            </div>
          </div>
        </div>

        <div>
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
              <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Rent</span>
                  <span className="font-semibold">₱1,450.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Fees & Utilities</span>
                  <span className="font-semibold">₱25.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Credits</span>
                  <span className="font-semibold text-success">-₱0.00</span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Due</span>
                  <span className="font-black">₱{totalDue.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              <button className="btn btn-primary w-full shadow-lg shadow-primary/30">
                Make Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
