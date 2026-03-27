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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-circle btn-ghost btn-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content truncate">{title}</h1>
          {description && <p className="text-sm sm:text-base text-base-content/60 mt-0.5 sm:mt-1 line-clamp-2">{description}</p>}
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
