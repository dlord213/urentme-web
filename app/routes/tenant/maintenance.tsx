import { Wrench, Plus, CircleDot, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";

type Update = { date: string; label: string; desc?: string; };
type Request = { id: string; title: string; status: string; submitted: string; urgency: string; updates: Update[]; };

const MOCK_REQUESTS: Request[] = [
  {
    id: "WO-1042",
    title: "Leaking Faucet in Kitchen",
    status: "In Progress",
    submitted: "Mar 19, 2025",
    urgency: "Low",
    updates: [
      { date: "Mar 19, 10:30 AM", label: "Request Submitted", desc: "You reported an issue: 'Kitchen sink is dripping constantly.'" },
      { date: "Mar 20, 09:15 AM", label: "Technician Assigned", desc: "Ace Plumbing Co. has been assigned. They will contact you shortly." },
    ]
  },
  {
    id: "WO-0988",
    title: "Broken Blinds in Bedroom",
    status: "Completed",
    submitted: "Jan 12, 2025",
    urgency: "Low",
    updates: [
      { date: "Jan 12, 02:20 PM", label: "Request Submitted" },
      { date: "Jan 14, 11:00 AM", label: "Technician Assigned" },
      { date: "Jan 15, 04:30 PM", label: "Job Completed" },
    ]
  }
];

export default function TenantMaintenance() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Maintenance & Repairs"
        description="Report issues and track repair status in real-time."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Report Issue
          </button>
        }
      />

      <div className="space-y-4">
        {MOCK_REQUESTS.map(req => (
          <div key={req.id} className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-200 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="card-title text-lg">{req.title}</h2>
                    {req.status === "Completed" ? (
                      <span className="badge badge-success badge-sm font-semibold">Completed</span>
                    ) : (
                      <span className="badge badge-warning badge-sm font-semibold">In Progress</span>
                    )}
                  </div>
                  <p className="text-sm text-base-content/60">Ticket #{req.id} • Submitted on {req.submitted} • Urgency: {req.urgency}</p>
                </div>
                {req.status !== "Completed" && (
                  <button className="btn btn-outline btn-sm">Cancel Request</button>
                )}
              </div>

              {/* Uber-style Timeline */}
              <div className="relative pl-6 space-y-6 py-2">
                <div className="absolute left-2.5 top-2 bottom-2 w-px bg-base-300" />
                
                {req.updates.map((update, i) => {
                  const isLatest = i === req.updates.length - 1 && req.status !== "Completed";
                  const isDone = req.status === "Completed" || i < req.updates.length - 1;
                  
                  return (
                    <div key={i} className="relative z-10 flex gap-4">
                      {isDone ? (
                        <div className="absolute -left-[28px] mt-0.5 w-6 h-6 rounded-full bg-base-100 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-success bg-base-100" />
                        </div>
                      ) : (
                        <div className="absolute -left-[28px] mt-0.5 w-6 h-6 rounded-full bg-base-100 flex items-center justify-center">
                          <CircleDot className="w-5 h-5 text-warning bg-base-100" />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${isLatest ? 'text-warning' : 'text-base-content'}`}>
                            {update.label}
                          </span>
                          <span className="text-xs text-base-content/50 font-medium">{update.date}</span>
                        </div>
                        {update.desc && <p className="text-sm text-base-content/70 mt-1">{update.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
