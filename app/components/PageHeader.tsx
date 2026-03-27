import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router";

interface PageHeaderProps {
  title: string;
  subTitle?: string; // Legacy support if needed
  description?: React.ReactNode;
  actionButton?: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
  titleSuffix?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  actionButton, 
  showBack, 
  backTo, 
  titleSuffix 
}: PageHeaderProps) {
  const navigate = useNavigate();

  const renderBack = () => {
    if (!showBack) return null;
    
    if (backTo) {
      return (
        <Link to={backTo} className="btn btn-circle btn-ghost btn-sm shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      );
    }

    return (
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-circle btn-ghost btn-sm shrink-0"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 animate-slide-in-right">
      <div className="flex items-center gap-3 min-w-0">
        {renderBack()}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content">{title}</h1>
            {titleSuffix}
          </div>
          {description && (
            <div className="text-sm sm:text-base text-base-content/60 mt-0.5 sm:mt-1">
              {description}
            </div>
          )}
        </div>
      </div>
      {actionButton && (
        <div className="flex items-center gap-2 shrink-0">
          {actionButton}
        </div>
      )}
    </div>
  );
}

