import { useEffect, useState } from "react";
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

export default function Transactions() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined
  );
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [net, setNet] = useState<number>(0);
  const [form, setForm] = useState({
    txn_type: "GIVEN",
    amount: 0,
    txn_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [range, setRange] = useState({ from: "", to: "" });

  const loadUsers = async () => {
    const { data } = await UsersAPI.list();
    setUsers(data);
    if (data.length && !selectedUserId) setSelectedUserId(data[0].id);
  };

  const loadTxns = async () => {
    if (!selectedUserId) return;
    const { data } = await TxnAPI.listByUser(selectedUserId, {
      from: range.from || undefined,
      to: range.to || undefined,
    });
    setTransactions(data.transactions);
    setTotals(data.totals);
    setNet(data.net_balance);
  };

  useEffect(() => {
    loadUsers();
  }, []);
  useEffect(() => {
    loadTxns();
  }, [selectedUserId]);

  const createTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    await TxnAPI.create({
      user_id: selectedUserId,
      txn_type: form.txn_type as "GIVEN" | "RECEIVED",
      amount: Number(form.amount),
      txn_date: form.txn_date,
      notes: form.notes,
    });
    setForm({ ...form, amount: 0, notes: "" });
    loadTxns();
  };

  const updateTxn = async (id: number, t: any) => {
    await TxnAPI.update(id, {
      txn_type: t.txn_type,
      amount: Number(t.amount),
      txn_date: t.txn_date,
      notes: t.notes,
    });
    loadTxns();
  };

  const deleteTxn = async (id: number) => {
    await TxnAPI.remove(id);
    loadTxns();
  };

  return (
    <div>
      <h2>Transactions</h2>
      <div>
        <select
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
          value={range.from}
          onChange={(e) => setRange({ ...range, from: e.target.value })}
        />
        <input
          type="date"
          value={range.to}
          onChange={(e) => setRange({ ...range, to: e.target.value })}
        />
        <button onClick={loadTxns}>Load</button>
      </div>

      <form onSubmit={createTxn}>
        <select
          value={form.txn_type}
          onChange={(e) => setForm({ ...form, txn_type: e.target.value })}
        >
          <option value="GIVEN">GIVEN (client paid user)</option>
          <option value="RECEIVED">RECEIVED (user paid client)</option>
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
          value={form.txn_date}
          onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
          required
        />
        <input
          placeholder="Notes"
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
                  value={t.txn_date.slice(0, 10)}
                  onChange={(e) => (t.txn_date = e.target.value)}
                />
              </td>
              <td>
                <select
                  value={t.txn_type}
                  onChange={(e) => (t.txn_type = e.target.value)}
                >
                  <option value="GIVEN">GIVEN</option>
                  <option value="RECEIVED">RECEIVED</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={t.amount}
                  onChange={(e) => (t.amount = e.target.value)}
                />
              </td>
              <td>
                <input
                  value={t.notes || ""}
                  onChange={(e) => (t.notes = e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => updateTxn(t.id, t)}>Save</button>
                <button onClick={() => deleteTxn(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
