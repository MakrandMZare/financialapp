import Transactions from "./components/Transactions";
import Users from "./components/Users";

export default function App() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
      <Users />
      <Transactions />
    </div>
  );
}
