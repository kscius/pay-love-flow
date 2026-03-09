import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, User } from "lucide-react";

const RoleSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-xl w-full"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent mb-6">
            <Shield className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-3 tracking-tight">
            CobraPay
          </h1>
          <p className="text-primary-foreground/60 text-lg">
            Portal de gestión de cobros
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/cobrador")}
            className="bg-card rounded-2xl p-8 shadow-elevated cursor-pointer text-left group transition-shadow hover:shadow-glow-accent"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Portal Cobrador</h2>
            <p className="text-muted-foreground text-sm">
              Gestiona clientes, envía recordatorios y da seguimiento a pagos.
            </p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/cliente/1")}
            className="bg-card rounded-2xl p-8 shadow-elevated cursor-pointer text-left group transition-shadow hover:shadow-glow-accent"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Portal Cliente</h2>
            <p className="text-muted-foreground text-sm">
              Consulta tus deudas pendientes y realiza pagos de forma segura.
            </p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelector;
