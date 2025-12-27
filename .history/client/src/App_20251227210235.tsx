import Transactions from "./Transaction";
import Users from "./User";

export default function App() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
      <Users />
      <Transactions />
    </div>
  );
}
