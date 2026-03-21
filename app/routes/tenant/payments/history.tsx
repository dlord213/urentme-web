import { Receipt, CheckCircle2, Download } from "lucide-react";
import { PageHeader } from "../../../components/PageHeader";
import { DataTable } from "../../../components/DataTable";

const MOCK_HISTORY = [
  { id: "PAY-003", date: "2025-03-01", description: "March Rent & Fees", method: "ACH •••• 1234", amount: "$1,475.00", status: "Posted" },
  { id: "PAY-002", date: "2025-02-01", description: "February Rent & Fees", method: "ACH •••• 1234", amount: "$1,475.00", status: "Posted" },
  { id: "PAY-001", date: "2025-01-01", description: "January Rent & Deposit", method: "Card •••• 9876", amount: "$2,900.00", status: "Posted" },
];

const statusBadge = (s: string) => <span className="badge badge-success badge-sm font-semibold">{s}</span>;

const amountCell = (val: string) => <span className="font-bold text-success">{val}</span>;

export default function TenantPaymentHistory() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Payment History"
        description="Review past payments and download receipts."
      />

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <DataTable
            columns={[
              { key: "date", label: "Date" },
              { key: "description", label: "Description" },
              { key: "method", label: "Payment Method" },
              { key: "amount", label: "Amount", render: amountCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_HISTORY}
            actions={[
              { label: "Receipt", icon: <Download className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
            ]}
            emptyMessage="No payment history found."
          />
        </div>
      </div>
    </div>
  );
}
