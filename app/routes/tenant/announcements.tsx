import { Megaphone, Calendar } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";

const MOCK_ANNOUNCEMENTS = [
  {
    id: "AN-1",
    date: "March 18, 2025",
    title: "Parking Lot Resurfacing",
    body: "Dear Residents,\n\nPlease be advised that the North parking lot will be closed for resurfacing starting this Thursday at 8:00 AM. Any vehicles remaining in the lot after this time will be towed at the owner's expense. The work is scheduled to be completed by Friday evening.\n\nTemporary parking will be available on the street.",
    isNew: true
  },
  {
    id: "AN-2",
    date: "February 25, 2025",
    title: "Quarterly HVAC Filter Replacement",
    body: "Maintenance will be coming around to all units next week to replace HVAC filters as part of our quarterly preventative maintenance. No action is required on your part, but please ensure the area around your return vent is clear.",
    isNew: false
  },
  {
    id: "AN-3",
    date: "January 10, 2025",
    title: "Welcome to 2025!",
    body: "Happy New Year! We hope you had a wonderful holiday season. Just a reminder that the community pool will be closed for routine maintenance until the end of January.",
    isNew: false
  }
];

export default function TenantAnnouncements() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Community Announcements"
        description="Important news and notices from property management."
      />

      <div className="max-w-3xl space-y-6">
        {MOCK_ANNOUNCEMENTS.map(ann => (
          <div key={ann.id} className="relative pl-6">
            {/* Timeline Line */}
            <div className="absolute left-2.5 top-2 bottom-0 w-px bg-base-300" />
            
            <div className="relative z-10 flex gap-4">
              <div className={`absolute -left-[28px] mt-1 w-6 h-6 rounded-full flex items-center justify-center ${ann.isNew ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/50'}`}>
                {ann.isNew ? <Megaphone className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              </div>
              
              <div className={`card w-full shadow-sm border ${ann.isNew ? 'bg-primary/5 border-primary/20' : 'bg-base-100 border-base-200'}`}>
                <div className="card-body p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{ann.title}</h3>
                    {ann.isNew && <span className="badge badge-primary badge-sm">New</span>}
                  </div>
                  <p className="text-xs font-semibold text-base-content/50 mb-4">{ann.date}</p>
                  <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                    {ann.body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
