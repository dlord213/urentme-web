import {
  PhilippinePeso,
  CreditCard,
  ArrowDownLeft,
  ReceiptText,
  Eye,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { Link } from "react-router";

export interface Transaction {
  id: string;
  amount: number;
  transactionDate: string;
  notes?: string;
  reference?: string;
  lease: {
    unit: {
      unitNumber: string;
      property?: {
        name: string;
      };
    };
    tenant: {
      firstName: string;
      lastName: string;
    };
  };
}

const amountCell = (val: number) => {
  const formatted = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(val);

  return (
    <span
      className={`font-bold text-sm ${val < 0 ? "text-error" : "text-success"}`}
    >
      {formatted}
    </span>
  );
};

export default function Transactions() {
  const {
    data: rawTxns = [],
    isLoading,
    isError,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: () => apiFetch("/transactions"),
  });

  const transactions = rawTxns.map((t) => ({
    ...t,
    tenantDisplay: `${t.lease.tenant.firstName} ${t.lease.tenant.lastName}`,
    unitDisplay: `${t.lease.unit.property?.name ? t.lease.unit.property.name + " - " : ""}${t.lease.unit.unitNumber}`,
    dateDisplay: new Date(t.transactionDate).toISOString().split("T")[0],
    notes: t.notes || "No description",
  }));

  const totalCollected = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>Failed to load transactions.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Transactions"
        description="View all financial transactions, rent payments, and charges."
        actionButton={
          <Link
            to="/dashboard/transactions/new"
            className="btn btn-primary shadow-sm shadow-primary/20 gap-2"
          >
            <Plus className="w-4 h-4" /> New Transaction
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Collected"
          value={new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(totalCollected)}
          icon={PhilippinePeso}
          color="success"
        />
        <StatsCard
          title="Total Transactions"
          value={transactions.length}
          icon={ReceiptText}
          color="primary"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search transactions..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <input
              type="month"
              className="input input-bordered input-sm w-40"
            />
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "dateDisplay", label: "Date" },
              { key: "tenantDisplay", label: "Tenant" },
              { key: "unitDisplay", label: "Unit" },
              { key: "notes", label: "Notes" },
              { key: "reference", label: "Reference" },
              { key: "amount", label: "Amount", render: amountCell },
            ]}
            data={transactions}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                to: (t: any) => `/dashboard/transactions/${t.id}`,
                variant: "ghost",
              },
            ]}
            emptyMessage="No transactions found."
          />
        </div>
      </div>
    </div>
  );
}
