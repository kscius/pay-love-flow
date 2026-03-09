import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Debt {
  id: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid";
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  debts: Debt[];
  reminderSent: boolean;
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "María González",
    email: "maria@email.com",
    phone: "+52 55 1234 5678",
    avatar: "MG",
    reminderSent: false,
    debts: [
      { id: "d1", concept: "Mensualidad Marzo", amount: 4500, dueDate: "2026-03-01", status: "pending" },
      { id: "d2", concept: "Mensualidad Febrero", amount: 4500, dueDate: "2026-02-01", status: "pending" },
    ],
  },
  {
    id: "2",
    name: "Carlos Ramírez",
    email: "carlos@email.com",
    phone: "+52 55 9876 5432",
    avatar: "CR",
    reminderSent: false,
    debts: [
      { id: "d3", concept: "Servicio Premium", amount: 12000, dueDate: "2026-03-15", status: "pending" },
    ],
  },
  {
    id: "3",
    name: "Ana López",
    email: "ana@email.com",
    phone: "+52 55 5555 1234",
    avatar: "AL",
    reminderSent: false,
    debts: [
      { id: "d4", concept: "Consultoría Q1", amount: 28000, dueDate: "2026-03-10", status: "pending" },
    ],
  },
  {
    id: "4",
    name: "Roberto Mendoza",
    email: "roberto@email.com",
    phone: "+52 55 4321 8765",
    avatar: "RM",
    reminderSent: false,
    debts: [],
  },
];

interface AppContextType {
  clients: Client[];
  sendReminder: (clientId: string) => void;
  payDebt: (clientId: string, debtId: string) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const sendReminder = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, reminderSent: true } : c))
    );
  };

  const payDebt = (clientId: string, debtId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              debts: c.debts.map((d) =>
                d.id === debtId ? { ...d, status: "paid" as const } : d
              ),
            }
          : c
      )
    );
  };

  return (
    <AppContext.Provider value={{ clients, sendReminder, payDebt, selectedClientId, setSelectedClientId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
