import { FileSignature, CheckCircle2, Clock, XCircle, Eye, Send, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_SIGS = [
  { id: "SR001", document: "Lease Agreement – John Smith", recipient: "John Smith", email: "john@email.com", sent: "2025-03-10", signed: "2025-03-11", status: "Signed" },
  { id: "SR002", document: "Lease Renewal – Maria Garcia", recipient: "Maria Garcia", email: "maria@email.com", sent: "2025-03-15", signed: "—", status: "Pending" },
  { id: "SR003", document: "Move-in Addendum – Bob Martinez", recipient: "Bob Martinez", email: "bob@email.com", sent: "2025-03-08", signed: "—", status: "Expired" },
  { id: "SR004", document: "Lease Agreement – Alex Thompson", recipient: "Alex Thompson", email: "alex@email.com", sent: "2025-03-18", signed: "—", status: "Pending" },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Signed: "badge-success",
    Pending: "badge-warning",
    Expired: "badge-error",
    Void: "badge-ghost",
  };
  return <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>{s}</span>;
};

export default function SignatureRequests() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Signature Requests"
        description="Send, track, and manage electronic signature requests for documents."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Request Signature
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Requests" value={MOCK_SIGS.length} icon={FileSignature} color="primary" />
        <StatsCard title="Signed" value={MOCK_SIGS.filter(s => s.status === "Signed").length} icon={CheckCircle2} color="success" />
        <StatsCard title="Pending" value={MOCK_SIGS.filter(s => s.status === "Pending").length} icon={Clock} color="warning" subtitle="Awaiting signature" />
        <StatsCard title="Expired" value={MOCK_SIGS.filter(s => s.status === "Expired").length} icon={XCircle} color="error" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search requests..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-36">
              <option>All Statuses</option>
              <option>Signed</option>
              <option>Pending</option>
              <option>Expired</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "document", label: "Document" },
              { key: "recipient", label: "Recipient" },
              { key: "email", label: "Email" },
              { key: "sent", label: "Sent Date" },
              { key: "signed", label: "Signed Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_SIGS}
            actions={[
              { label: "View", icon: <Eye className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
              { label: "Resend", icon: <Send className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
            ]}
            emptyMessage="No signature requests found."
          />
        </div>
      </div>
    </div>
  );
}
