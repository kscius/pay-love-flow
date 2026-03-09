import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, CreditCard, Landmark, Smartphone, CheckCircle2, AlertCircle, Loader2, Plus, Lock } from "lucide-react";
import { useState } from "react";

type Step = "debts" | "payment-method" | "card-details" | "processing" | "success";

interface SavedCard {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  holder: string;
  expiry: string;
}

interface DigitalWallet {
  id: string;
  provider: "apple" | "google";
  email: string;
}

const paymentMethods = [
  { id: "card", label: "Tarjeta de crédito/débito", icon: CreditCard, detail: "Visa, Mastercard, AMEX" },
  { id: "transfer", label: "Transferencia bancaria", icon: Landmark, detail: "SPEI · Inmediata" },
  { id: "digital", label: "Pago digital", icon: Smartphone, detail: "Apple Pay, Google Pay" },
];

const cardBrandColors: Record<string, string> = {
  visa: "bg-blue-600",
  mastercard: "bg-orange-500",
  amex: "bg-indigo-600",
};

const cardBrandNames: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "AMEX",
};

const detectCardBrand = (num: string): "visa" | "mastercard" | "amex" => {
  if (num.startsWith("3")) return "amex";
  if (num.startsWith("5")) return "mastercard";
  return "visa";
};

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
};

const ClientPortal = () => {
  const { clientId } = useParams();
  const { clients, payDebt } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("debts");
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Card details
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: "default-card", type: "visa", last4: "4242", holder: "María González", expiry: "12/28" },
  ]);
  const [savedWallets, setSavedWallets] = useState<DigitalWallet[]>([
    { id: "default-wallet", provider: "apple", email: "maria@icloud.com" },
  ]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [walletEmail, setWalletEmail] = useState("");
  const [walletProvider, setWalletProvider] = useState<"apple" | "google">("apple");
  const [tokenizedLabel, setTokenizedLabel] = useState("");

  const client = clients.find((c) => c.id === clientId);
  if (!client) return <div className="p-8 text-center text-muted-foreground">Cliente no encontrado</div>;

  const pendingDebts = client.debts.filter((d) => d.status === "pending");
  const paidDebts = client.debts.filter((d) => d.status === "paid");
  const selectedDebt = client.debts.find((d) => d.id === selectedDebtId);

  const handleSelectDebt = (debtId: string) => {
    setSelectedDebtId(debtId);
    setStep("payment-method");
  };

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    if (methodId === "card" || methodId === "digital") {
      setStep("card-details");
      setSelectedCardId(null);
      setShowAddCard(false);
      setShowAddWallet(false);
    }
  };

  const handleAddCard = () => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 15 || !cardHolder || cardExpiry.length < 4 || cardCvv.length < 3) return;
    const brand = detectCardBrand(digits);
    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      type: brand,
      last4: digits.slice(-4),
      holder: cardHolder.toUpperCase(),
      expiry: formatExpiry(cardExpiry),
    };
    setSavedCards((prev) => [...prev, newCard]);
    setSelectedCardId(newCard.id);
    setShowAddCard(false);
    setCardNumber("");
    setCardHolder("");
    setCardExpiry("");
    setCardCvv("");
    setTokenizedLabel(`${cardBrandNames[brand]} •••• ${newCard.last4}`);
  };

  const handleAddWallet = () => {
    if (!walletEmail) return;
    const newWallet: DigitalWallet = {
      id: `wallet-${Date.now()}`,
      provider: walletProvider,
      email: walletEmail,
    };
    setSavedWallets((prev) => [...prev, newWallet]);
    setSelectedCardId(newWallet.id);
    setShowAddWallet(false);
    setWalletEmail("");
    setTokenizedLabel(`${walletProvider === "apple" ? "Apple Pay" : "Google Pay"} · ${walletEmail}`);
  };

  const handlePay = async () => {
    if (!selectedDebtId || !selectedCardId) return;
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2500));
    payDebt(client.id, selectedDebtId);
    setStep("success");
  };

  const handlePayDirect = async () => {
    if (!selectedDebtId || !selectedMethod) return;
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2500));
    payDebt(client.id, selectedDebtId);
    setTokenizedLabel("SPEI · Transferencia");
    setStep("success");
  };

  const goBack = () => {
    if (step === "card-details") setStep("payment-method");
    else if (step === "payment-method") setStep("debts");
    else navigate("/");
  };

  const stepLabel = step === "card-details" ? "Método" : step === "payment-method" ? "Deudas" : "Salir";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={goBack}
            className="text-primary-foreground/60 hover:text-primary-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {stepLabel}
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
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Deudas pendientes</h2>
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
                          <p className="text-sm text-muted-foreground">Vence: {new Date(debt.dueDate).toLocaleDateString("es-MX")}</p>
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
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Historial de pagos</h2>
                  {paidDebts.map((debt) => (
                    <div key={debt.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between opacity-60 mb-2">
                      <p className="font-medium text-foreground">{debt.concept}</p>
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

              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Selecciona método de pago</h2>
              <div className="space-y-3">
                {paymentMethods.map((method, i) => (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectMethod(method.id)}
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

              {/* Only transfer pays directly */}
              {selectedMethod === "transfer" && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handlePayDirect}
                  className="w-full mt-6 bg-gradient-accent text-accent-foreground rounded-xl p-4 font-bold text-lg transition-opacity"
                >
                  Pagar ${selectedDebt.amount.toLocaleString()}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Step: Card / Digital Details */}
          {step === "card-details" && selectedDebt && (
            <motion.div key="card-details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-card rounded-xl p-5 shadow-card mb-6">
                <p className="text-sm text-muted-foreground">Pagando</p>
                <p className="text-lg font-bold text-foreground">{selectedDebt.concept}</p>
                <p className="text-3xl font-bold text-foreground mt-1">${selectedDebt.amount.toLocaleString()}</p>
              </div>

              {selectedMethod === "card" && (
                <>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Selecciona o agrega tarjeta</h2>

                  {/* Saved cards */}
                  <div className="space-y-3 mb-4">
                    {savedCards.map((card, i) => (
                      <motion.button
                        key={card.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setTokenizedLabel(`${cardBrandNames[card.type]} •••• ${card.last4}`);
                          setShowAddCard(false);
                        }}
                        className={`w-full rounded-xl p-4 text-left flex items-center gap-4 transition-all border-2 ${
                          selectedCardId === card.id
                            ? "border-accent bg-accent/5 shadow-elevated"
                            : "border-transparent bg-card shadow-card hover:shadow-elevated"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xs ${cardBrandColors[card.type]}`}>
                          {cardBrandNames[card.type]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">•••• •••• •••• {card.last4}</p>
                          <p className="text-sm text-muted-foreground">{card.holder} · {card.expiry}</p>
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    ))}
                  </div>

                  {/* Add new card toggle */}
                  {!showAddCard ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowAddCard(true); setSelectedCardId(null); }}
                      className="w-full rounded-xl p-4 text-left flex items-center gap-4 border-2 border-dashed border-muted-foreground/30 bg-card shadow-card hover:shadow-elevated transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-secondary text-foreground">
                        <Plus className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-foreground">Agregar nueva tarjeta</p>
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-card rounded-xl p-5 shadow-elevated border-2 border-accent space-y-4"
                    >
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Número de tarjeta</label>
                        <input
                          type="text"
                          value={formatCardNumber(cardNumber)}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="w-full mt-1 bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-accent font-mono text-lg tracking-wider"
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Titular</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                          className="w-full mt-1 bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-accent uppercase"
                        />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vencimiento</label>
                          <input
                            type="text"
                            value={formatExpiry(cardExpiry)}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/AA"
                            className="w-full mt-1 bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-accent font-mono"
                            maxLength={5}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="•••"
                            className="w-full mt-1 bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-accent font-mono"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>Datos encriptados y tokenizados · No almacenamos tu información</span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddCard}
                        disabled={cardNumber.replace(/\D/g, "").length < 15 || !cardHolder || cardExpiry.replace(/\D/g, "").length < 4 || cardCvv.length < 3}
                        className="w-full bg-accent text-accent-foreground rounded-xl p-3 font-bold disabled:opacity-40 transition-opacity"
                      >
                        Tokenizar y guardar tarjeta
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}

              {selectedMethod === "digital" && (
                <>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Selecciona o vincula wallet</h2>

                  {/* Saved wallets */}
                  <div className="space-y-3 mb-4">
                    {savedWallets.map((wallet, i) => (
                      <motion.button
                        key={wallet.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCardId(wallet.id);
                          setTokenizedLabel(`${wallet.provider === "apple" ? "Apple Pay" : "Google Pay"} · ${wallet.email}`);
                          setShowAddWallet(false);
                        }}
                        className={`w-full rounded-xl p-4 text-left flex items-center gap-4 transition-all border-2 ${
                          selectedCardId === wallet.id
                            ? "border-accent bg-accent/5 shadow-elevated"
                            : "border-transparent bg-card shadow-card hover:shadow-elevated"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                          wallet.provider === "apple" ? "bg-gray-900" : "bg-blue-500"
                        }`}>
                          {wallet.provider === "apple" ? "🍎" : "G"}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{wallet.provider === "apple" ? "Apple Pay" : "Google Pay"}</p>
                          <p className="text-sm text-muted-foreground">{wallet.email}</p>
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    ))}
                  </div>

                  {!showAddWallet ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowAddWallet(true); setSelectedCardId(null); }}
                      className="w-full rounded-xl p-4 text-left flex items-center gap-4 border-2 border-dashed border-muted-foreground/30 bg-card shadow-card hover:shadow-elevated transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-secondary text-foreground">
                        <Plus className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-foreground">Vincular wallet digital</p>
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-card rounded-xl p-5 shadow-elevated border-2 border-accent space-y-4"
                    >
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Proveedor</label>
                        <div className="flex gap-3">
                          {(["apple", "google"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setWalletProvider(p)}
                              className={`flex-1 rounded-xl p-3 font-semibold text-sm border-2 transition-all ${
                                walletProvider === p
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-transparent bg-secondary text-muted-foreground"
                              }`}
                            >
                              {p === "apple" ? "🍎 Apple Pay" : "G Google Pay"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email vinculado</label>
                        <input
                          type="email"
                          value={walletEmail}
                          onChange={(e) => setWalletEmail(e.target.value)}
                          placeholder="tu@email.com"
                          className="w-full mt-1 bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>Autenticación tokenizada · Conexión segura</span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddWallet}
                        disabled={!walletEmail}
                        className="w-full bg-accent text-accent-foreground rounded-xl p-3 font-bold disabled:opacity-40 transition-opacity"
                      >
                        Vincular wallet
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}

              {/* Pay button */}
              {selectedCardId && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handlePay}
                  className="w-full mt-6 bg-gradient-accent text-accent-foreground rounded-xl p-4 font-bold text-lg transition-opacity"
                >
                  Pagar ${selectedDebt.amount.toLocaleString()}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Step: Processing */}
          {step === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="mx-auto mb-6">
                <Loader2 className="w-16 h-16 text-accent mx-auto" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground mb-2">Procesando pago...</h2>
              <p className="text-muted-foreground">No cierres esta ventana</p>
              <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-accent" />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Success */}
          {step === "success" && selectedDebt && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-center py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 300 }} className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">¡Pago exitoso!</h2>
              <p className="text-muted-foreground mb-1">{selectedDebt.concept}</p>
              <p className="text-3xl font-bold text-foreground mb-8">${selectedDebt.amount.toLocaleString()}</p>

              <div className="bg-card rounded-xl p-4 shadow-card max-w-xs mx-auto text-left text-sm space-y-2 mb-8">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método</span>
                  <span className="font-medium text-foreground">{tokenizedLabel}</span>
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
                  setSelectedCardId(null);
                  setTokenizedLabel("");
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
