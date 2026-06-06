import { createFileRoute } from "@tanstack/react-router";
import { Users, Building2 } from "lucide-react";
import { ContactTable } from "@/components/crm/ContactTable";
import { CompanyTable } from "@/components/crm/CompanyTable";

type Search = {
  tab?: "contacts" | "companies";
  companyId?: string;
  id?: string;
};

export const Route = createFileRoute("/database")({
  head: () => ({
    meta: [
      { title: "Database — Catchh" },
      { name: "description", content: "Manage your contacts and companies." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    tab: search.tab === "companies" ? "companies" : "contacts",
    companyId: typeof search.companyId === "string" ? search.companyId : undefined,
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: DatabasePage,
});

function DatabasePage() {
  const { tab, companyId, id } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <main className="flex-1 min-h-0 p-4 lg:p-5">
      <div className="h-full max-w-[1600px] mx-auto flex flex-col">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground">Database</h1>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Your contacts and companies in one place.
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-1">
            <TabBtn
              active={tab === "contacts"}
              onClick={() => navigate({ search: { tab: "contacts" } })}
              icon={<Users className="h-3.5 w-3.5" />}
            >
              Contacts
            </TabBtn>
            <TabBtn
              active={tab === "companies"}
              onClick={() => navigate({ search: { tab: "companies" } })}
              icon={<Building2 className="h-3.5 w-3.5" />}
            >
              Companies
            </TabBtn>
          </div>
          <div className="flex-1 min-h-0">
            {tab === "contacts" ? (
              <ContactTable initialCompanyId={companyId} />
            ) : (
              <CompanyTable highlightId={id} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function TabBtn({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12.5px] font-medium transition",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}
