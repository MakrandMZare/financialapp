import { useCallback, useEffect, useState } from "react";
import { TxnAPI, UsersAPI } from "./App";

// src/Transactions.tsx

interface User {
  id: number;
  username: string;
  mobile: string;
}

interface Totals {
  total_given: number;
  total_received: number;
}

interface Transaction {
  id: number;
  txn_type: "Paid" | "Received";
  amount: number;
  txn_date: string;
  notes: string;
}

export default function Transactions() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [net, setNet] = useState<number>(0);
  const [form, setForm] = useState({
    txn_type: "Paid",
    amount: 0,
    txn_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [range, setRange] = useState({ from: "", to: "" });
  const [editingTxn, setEditingTxn] = useState<
    Record<number, Partial<Transaction>>
  >({});

  const loadUsers = useCallback(async () => {
    const { data } = await UsersAPI.list();
    setUsers(data);
    setSelectedUserId((prev) => prev ?? (data.length ? data[0].id : undefined));
  }, []);

  const loadTxns = useCallback(async () => {
    if (!selectedUserId) return;
    const { data } = await TxnAPI.listByUser(selectedUserId, {
      from: range.from || undefined,
      to: range.to || undefined,
    });
    setTransactions(data.transactions);
    setTotals(data.totals);
    setNet(data.net_balance);
  }, [selectedUserId, range.from, range.to]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  useEffect(() => {
    if (!selectedUserId) return;
    const fetchTxns = async () => {
      const { data } = await TxnAPI.listByUser(selectedUserId, {
        from: range.from || undefined,
        to: range.to || undefined,
      });
      setTransactions(data.transactions);
      setTotals(data.totals);
      setNet(data.net_balance);
    };
    fetchTxns();
  }, [selectedUserId, range.from, range.to]);

  const createTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    await TxnAPI.create({
      user_id: selectedUserId,
      txn_type: form.txn_type as "Paid" | "Received",
      amount: Number(form.amount),
      txn_date: form.txn_date,
      notes: form.notes,
    });
    setForm({ ...form, amount: 0, notes: "" });
    loadTxns();
  };

  const updateTxn = async (id: number) => {
    const edited = editingTxn[id];
    if (!edited) return;

    const original = transactions.find((t) => t.id === id);
    if (!original) return;

    await TxnAPI.update(id, {
      txn_type: (edited.txn_type ?? original.txn_type) as "Paid" | "Received",
      amount: Number(edited.amount ?? original.amount),
      txn_date: edited.txn_date ?? original.txn_date,
      notes: edited.notes ?? original.notes,
    });
    setEditingTxn((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    loadTxns();
  };

  const updateEditingTxn = (
    id: number,
    field: keyof Transaction,
    value: string | number
  ) => {
    setEditingTxn((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const getEditedValue = <K extends keyof Transaction>(
    t: Transaction,
    field: K
  ): Transaction[K] => {
    return (editingTxn[t.id]?.[field] ?? t[field]) as Transaction[K];
  };

  const deleteTxn = async (id: number) => {
    await TxnAPI.delete(id);
    loadTxns();
  };

  return (
    <div>
      <h2>Transactions</h2>
      <div>
        <select
          aria-label="Select user"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(Number(e.target.value))}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username} ({u.mobile})
            </option>
          ))}
        </select>
        <input
          type="date"
          aria-label="From date"
          value={range.from}
          onChange={(e) => setRange({ ...range, from: e.target.value })}
        />
        <input
          type="date"
          aria-label="To date"
          value={range.to}
          onChange={(e) => setRange({ ...range, to: e.target.value })}
        />
        <button onClick={loadTxns}>Load</button>
      </div>

      <form onSubmit={createTxn}>
        <select
          aria-label="Transaction type"
          value={form.txn_type}
          onChange={(e) => setForm({ ...form, txn_type: e.target.value })}
        >
          <option value="Paid">Paid (client paid user)</option>
          <option value="Received">Received (user paid client)</option>
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          required
        />
        <input
          type="date"
          aria-label="Transaction date"
          value={form.txn_date}
          onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
          required
        />
        <input
          placeholder="Notes"
          aria-label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      <div>
        <p>Total GIVEN: {totals?.total_given ?? 0}</p>
        <p>Total RECEIVED: {totals?.total_received ?? 0}</p>
        <p>Net balance (GIVEN - RECEIVED): {net ?? 0}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>
                <input
                  type="date"
                  aria-label="Transaction date"
                  value={getEditedValue(t, "txn_date").slice(0, 10)}
                  onChange={(e) =>
                    updateEditingTxn(t.id, "txn_date", e.target.value)
                  }
                />
              </td>
              <td>
                <select
                  aria-label="Transaction type"
                  value={getEditedValue(t, "txn_type")}
                  onChange={(e) =>
                    updateEditingTxn(
                      t.id,
                      "txn_type",
                      e.target.value as "Paid" | "Received"
                    )
                  }
                >
                  <option value="Paid">Paid</option>
                  <option value="Received">Received</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  aria-label="Amount"
                  value={getEditedValue(t, "amount")}
                  onChange={(e) =>
                    updateEditingTxn(t.id, "amount", Number(e.target.value))
                  }
                />
              </td>
              <td>
                <input
                  aria-label="Notes"
                  value={getEditedValue(t, "notes") || ""}
                  onChange={(e) =>
                    updateEditingTxn(t.id, "notes", e.target.value)
                  }
                />
              </td>
              <td>
                <button onClick={() => updateTxn(t.id)}>Save</button>
                <button onClick={() => deleteTxn(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
