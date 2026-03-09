import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, CreditCard, Landmark, Smartphone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

type Step = "debts" | "payment-method" | "processing" | "success";

const paymentMethods = [
  { id: "card", label: "Tarjeta de crédito/débito", icon: CreditCard, detail: "Visa, Mastercard, AMEX" },
  { id: "transfer", label: "Transferencia bancaria", icon: Landmark, detail: "SPEI · Inmediata" },
  { id: "digital", label: "Pago digital", icon: Smartphone, detail: "Apple Pay, Google Pay" },
];

const ClientPortal = () => {
  const { clientId } = useParams();
  const { clients, payDebt } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("debts");
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const client = clients.find((c) => c.id === clientId);
  if (!client) return <div className="p-8 text-center text-muted-foreground">Cliente no encontrado</div>;

  const pendingDebts = client.debts.filter((d) => d.status === "pending");
  const paidDebts = client.debts.filter((d) => d.status === "paid");
  const selectedDebt = client.debts.find((d) => d.id === selectedDebtId);

  const handleSelectDebt = (debtId: string) => {
    setSelectedDebtId(debtId);
    setStep("payment-method");
  };

  const handlePay = async () => {
    if (!selectedDebtId || !selectedMethod) return;
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2500));
    payDebt(client.id, selectedDebtId);
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => {
              if (step === "payment-method") setStep("debts");
              else if (step === "debts") navigate("/");
              else navigate("/");
            }}
            className="text-primary-foreground/60 hover:text-primary-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {step === "payment-method" ? "Deudas" : "Salir"}
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground">Hola, {client.name.split(" ")[0]}</h1>
          <p className="text-primary-foreground/50 text-sm mt-1">Portal de pagos</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step: Debts */}
          {step === "debts" && (
            <motion.div key="debts" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {pendingDebts.length > 0 ? (
                <>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Deudas pendientes
                  </h2>
                  <div className="space-y-3">
                    {pendingDebts.map((debt, i) => (
                      <motion.button
                        key={debt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectDebt(debt.id)}
                        className="w-full bg-card rounded-xl p-5 shadow-card text-left flex items-center justify-between transition-shadow hover:shadow-elevated"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{debt.concept}</p>
                          <p className="text-sm text-muted-foreground">
                            Vence: {new Date(debt.dueDate).toLocaleDateString("es-MX")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">${debt.amount.toLocaleString()}</p>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Pendiente
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" />
                  <h2 className="text-xl font-bold text-foreground mb-2">¡Estás al día!</h2>
                  <p className="text-muted-foreground">No tienes deudas pendientes.</p>
                </div>
              )}

              {paidDebts.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Historial de pagos
                  </h2>
                  {paidDebts.map((debt) => (
                    <div key={debt.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between opacity-60 mb-2">
                      <div>
                        <p className="font-medium text-foreground">{debt.concept}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">${debt.amount.toLocaleString()}</p>
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Payment Method */}
          {step === "payment-method" && selectedDebt && (
            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-card rounded-xl p-5 shadow-card mb-6">
                <p className="text-sm text-muted-foreground">Pagando</p>
                <p className="text-lg font-bold text-foreground">{selectedDebt.concept}</p>
                <p className="text-3xl font-bold text-foreground mt-1">${selectedDebt.amount.toLocaleString()}</p>
              </div>

              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Selecciona método de pago
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method, i) => (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full rounded-xl p-4 text-left flex items-center gap-4 transition-all border-2 ${
                      selectedMethod === method.id
                        ? "border-accent bg-accent/5 shadow-elevated"
                        : "border-transparent bg-card shadow-card hover:shadow-elevated"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      selectedMethod === method.id ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                    }`}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.detail}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handlePay}
                disabled={!selectedMethod}
                className="w-full mt-6 bg-gradient-accent text-accent-foreground rounded-xl p-4 font-bold text-lg disabled:opacity-40 transition-opacity"
              >
                Pagar ${selectedDebt.amount.toLocaleString()}
              </motion.button>
            </motion.div>
          )}

          {/* Step: Processing */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="mx-auto mb-6"
              >
                <Loader2 className="w-16 h-16 text-accent mx-auto" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground mb-2">Procesando pago...</h2>
              <p className="text-muted-foreground">No cierres esta ventana</p>
              <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-accent"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Success */}
          {step === "success" && selectedDebt && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">¡Pago exitoso!</h2>
              <p className="text-muted-foreground mb-1">{selectedDebt.concept}</p>
              <p className="text-3xl font-bold text-foreground mb-8">${selectedDebt.amount.toLocaleString()}</p>

              <div className="bg-card rounded-xl p-4 shadow-card max-w-xs mx-auto text-left text-sm space-y-2 mb-8">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método</span>
                  <span className="font-medium text-foreground">{paymentMethods.find((m) => m.id === selectedMethod)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ref.</span>
                  <span className="font-medium text-foreground">CP-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="font-medium text-foreground">{new Date().toLocaleDateString("es-MX")}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep("debts");
                  setSelectedDebtId(null);
                  setSelectedMethod(null);
                }}
                className="bg-primary text-primary-foreground rounded-xl px-8 py-3 font-semibold hover:opacity-90 transition-opacity"
              >
                Volver a mis deudas
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientPortal;
