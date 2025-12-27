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

  const remove = async (id: number) => {
    await UsersAPI.remove(id);
    load();
  };

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email} - {user.mobile}
            <button onClick={() => remove(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <form onSubmit={create}>
        <input
          type="text"
}
