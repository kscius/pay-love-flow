import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, ChevronRight, AlertCircle, CheckCircle2, Bell } from "lucide-react";

const CollectorDashboard = () => {
  const { clients } = useApp();
  const navigate = useNavigate();

  const totalPending = clients.reduce(
    (acc, c) => acc + c.debts.filter((d) => d.status === "pending").length,
    0
  );
  const totalCollected = clients.reduce(
    (acc, c) =>
      acc + c.debts.filter((d) => d.status === "paid").reduce((s, d) => s + d.amount, 0),
    0
  );
  const totalOwed = clients.reduce(
    (acc, c) =>
      acc + c.debts.filter((d) => d.status === "pending").reduce((s, d) => s + d.amount, 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button onClick={() => navigate("/")} className="text-primary-foreground/60 hover:text-primary-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Salir
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground">Portal Cobrador</h1>
          <p className="text-primary-foreground/60 text-sm mt-1">Gestión de cobranza</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Por cobrar", value: `$${totalOwed.toLocaleString()}`, color: "bg-warning/20 text-warning" },
              { label: "Cobrado", value: `$${totalCollected.toLocaleString()}`, color: "bg-success/20 text-success" },
              { label: "Pendientes", value: totalPending.toString(), color: "bg-primary-foreground/10 text-primary-foreground" },
            ].map((stat) => (
              <div key={stat.label} className="bg-primary-foreground/5 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-primary-foreground/50 text-xs">{stat.label}</p>
                <p className={`text-lg font-bold text-primary-foreground mt-1`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Clientes ({clients.length})
        </h2>
        <div className="space-y-3">
          {clients.map((client, i) => {
            const pendingDebts = client.debts.filter((d) => d.status === "pending");
            const pendingAmount = pendingDebts.reduce((s, d) => s + d.amount, 0);
            const allPaid = client.debts.length > 0 && pendingDebts.length === 0;

            return (
              <motion.button
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/cobrador/${client.id}`)}
                className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-4 text-left transition-shadow hover:shadow-elevated"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${allPaid ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                  {client.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{client.name}</p>
                    {client.reminderSent && <Bell className="w-3.5 h-3.5 text-warning shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {allPaid ? (
                      <span className="text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sin deudas
                      </span>
                    ) : pendingDebts.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-warning" />
                        {pendingDebts.length} deuda{pendingDebts.length > 1 ? "s" : ""} · ${pendingAmount.toLocaleString()}
                      </span>
                    ) : (
                      "Sin registros"
                    )}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
