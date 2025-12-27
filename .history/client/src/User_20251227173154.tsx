import { useEffect, useState } from "react";
import { UsersAPI } from "./App.tsx";

//src/Users.tsx

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ username: "", mobile: "", email: "" });

  const load = async () => {
    const { data } = await UsersAPI.list();
    setUsers(data);
  };
  useEffect(() => {
    load();
  }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await UsersAPI.create(form);
    setForm({ username: "", mobile: "", email: "" });
    load();
  };
}
