import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
  showBack?: boolean;
}

export function PageHeader({ title, description, actionButton, showBack }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-circle btn-ghost btn-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">{title}</h1>
          {description && <p className="text-base-content/60 mt-1">{description}</p>}
        </div>
      </div>
      {actionButton && (
        <div className="flex-none">
          {actionButton}
        </div>
      )}
    </div>
  );
}
