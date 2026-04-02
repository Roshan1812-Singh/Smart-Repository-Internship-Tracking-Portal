import { useEffect, useState } from "react";
import API from "../api/axios";

const LoginMonitoring = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await API.get("/admin/login-monitoring");
    setUsers(res.data || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Login Monitoring</h1>

      {users.map((u) => (
        <div key={u._id} className="border p-3 mb-2">
          <p>{u.email}</p>
          <p>
            Last Login:{" "}
            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default LoginMonitoring;
