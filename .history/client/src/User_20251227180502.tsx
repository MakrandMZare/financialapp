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
    await UsersAPI.delete(id);
    load();
  };

  return (
    <div>
      <h2>Users</h2>
      <form onSubmit={create}>
        <input
          placeholder="UserName"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          placeholder="Mobile"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button type="submit">Create</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>UserName</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u => (
            <tr key={{u.id}>
              <td><input value={u.username} onChange={e=>u.username=e.target.value} /></td>
              <td><input value={u.mobile} onChange={e=>u.mobile=e.target.value} /></td>
              <td><input value={u.email || ''} onChange={e=>u.email=e.target.value}/></td>
              <td>
                <button onClick={() => update(u.id, u)}>Save</button>
                <button onClick={() => remove(u.id)}>Delete</button>
              </td>
            </tr>
          )))
        </tbody>
      </table>
    </div>
  );


          <tbody>
            <tr>


            </tr>
        </tbody>
      </table>
    </div>
  );
}
