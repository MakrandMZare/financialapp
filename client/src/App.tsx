import "./App.css";
import Transactions from "./Transaction";
import Users from "./User";

export default function App() {
  return (
    <div className="app-container">
      <Users />
      <Transactions />
    </div>
  );
}
