import React from "react";
import TransactionDetails from "./components/TransactionDetails";
import Transactions from "./components/Transactions";
import UserDetails from "./components/UserDetails";
import Users from "./components/Users";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
      <Users />
      <Transactions />
    </div>
  );
}
