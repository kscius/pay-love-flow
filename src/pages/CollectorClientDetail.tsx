import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CollectorClientDetail = () => {
  const { clientId } = useParams();
  const { clients, sendReminder } = useApp();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const client = clients.find((c) => c.id === clientId);
  if (!client) return <div className="p-8 text-center text-muted-foreground">Cliente no encontrado</div>;

  const pendingDebts = client.debts.filter((d) => d.status === "pending");
  const paidDebts = client.debts.filter((d) => d.status === "paid");

  const handleSendReminder = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    sendReminder(client.id);
    setSending(false);
    toast.success("Recordatorio enviado", {
      description: `Se envió un recordatorio a ${client.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button onClick={() => navigate("/cobrador")} className="text-primary-foreground/60 hover:text-primary-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Clientes
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center text-lg font-bold text-primary-foreground">
              {client.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">{client.name}</h1>
              <p className="text-primary-foreground/50 text-sm">{client.email} · {client.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Send reminder */}
        {pendingDebts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={handleSendReminder}
              disabled={sending || client.reminderSent}
              className="w-full bg-gradient-accent text-accent-foreground rounded-xl p-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {sending ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full" />
              ) : client.reminderSent ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Recordatorio enviado
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Enviar recordatorio de pago
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Pending debts */}
        {pendingDebts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Deudas pendientes ({pendingDebts.length})
            </h2>
            <div className="space-y-3">
              {pendingDebts.map((debt, i) => (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{debt.concept}</p>
                    <p className="text-sm text-muted-foreground">Vence: {new Date(debt.dueDate).toLocaleDateString("es-MX")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${debt.amount.toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Pendiente
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Paid debts */}
        {paidDebts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" /> Pagadas ({paidDebts.length})
            </h2>
            <div className="space-y-3">
              {paidDebts.map((debt) => (
                <div key={debt.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between opacity-70">
                  <div>
                    <p className="font-medium text-foreground">{debt.concept}</p>
                    <p className="text-sm text-muted-foreground">{new Date(debt.dueDate).toLocaleDateString("es-MX")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${debt.amount.toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Pagada
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {client.debts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success" />
            <p className="font-medium">Este cliente no tiene deudas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorClientDetail;
