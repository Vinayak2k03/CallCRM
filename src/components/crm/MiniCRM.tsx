import { useState } from "react";
import { Users, Building2 } from "lucide-react";
import { ContactTable } from "./ContactTable";
import { CompanyTable } from "./CompanyTable";

type Tab = "contacts" | "companies";

export function MiniCRM() {
  const [tab, setTab] = useState<Tab>("contacts");

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-1">
        <TabBtn active={tab === "contacts"} onClick={() => setTab("contacts")} icon={<Users className="h-3.5 w-3.5" />}>
          Contacts
        </TabBtn>
        <TabBtn active={tab === "companies"} onClick={() => setTab("companies")} icon={<Building2 className="h-3.5 w-3.5" />}>
          Companies
        </TabBtn>
      </div>
      <div className="flex-1 min-h-0">
        {tab === "contacts" ? <ContactTable compact /> : <CompanyTable compact />}
      </div>
    </div>
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
