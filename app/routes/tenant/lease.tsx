import { FileText, Download, CheckCircle2 } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";

export default function TenantLease() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="My Lease & Documents"
        description="Access your active lease agreement and related property documents."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Lease Card */}
        <div className="card bg-base-100 shadow-sm border border-success/30 ring-1 ring-success/10">
          <div className="card-body">
            <div className="flex items-center gap-2 text-success font-semibold text-sm mb-4">
              <CheckCircle2 className="w-5 h-5" /> ACTIVE LEASE
            </div>
            <h2 className="card-title text-2xl mb-1">Riverside – Unit 1A</h2>
            <p className="text-base-content/60 text-sm mb-6">12 Month Standard Lease</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between pb-3 border-b border-base-200">
                <span className="text-base-content/70">Start Date</span>
                <span className="font-semibold">September 1, 2024</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-base-200">
                <span className="text-base-content/70">End Date</span>
                <span className="font-semibold">August 31, 2025</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-base-200">
                <span className="text-base-content/70">Monthly Rent</span>
                <span className="font-semibold">$1,450.00</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-base-200">
                <span className="text-base-content/70">Security Deposit</span>
                <span className="font-semibold">$1,450.00 (Held)</span>
              </div>
            </div>

            <button className="btn btn-primary w-full shadow-sm">Review Lease Details</button>
          </div>
        </div>

        {/* Documents Section */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h2 className="card-title mb-6">Shared Documents</h2>
            
            <div className="space-y-3">
              {[
                { name: "Signed Lease Agreement.pdf", size: "2.4 MB", date: "Aug 15, 2024" },
                { name: "Move-in Condition Report.pdf", size: "1.1 MB", date: "Sep 1, 2024" },
                { name: "Pet Addendum.pdf", size: "0.4 MB", date: "Sep 5, 2024" },
                { name: "Community Rules Handbook.pdf", size: "3.8 MB", date: "Aug 15, 2024" },
              ].map(doc => (
                <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border border-base-200 hover:bg-base-200/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1">{doc.name}</h4>
                      <p className="text-xs text-base-content/50 mt-0.5">{doc.size} • Uploaded {doc.date}</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm btn-square">
                    <Download className="w-4 h-4 text-base-content/70" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
