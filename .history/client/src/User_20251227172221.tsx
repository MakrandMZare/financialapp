import { useEffect, useState } from "react";
import { UsersAPI } from "./App.tsx";

//src/Users.tsx

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState{ username: '', mobile: '', email: ''}); 
const load = async () => {
  const { data } = await UsersAPI.list();
  setUsers(data);
};
  }