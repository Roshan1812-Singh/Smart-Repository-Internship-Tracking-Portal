import { useEffect, useState } from "react";
import API from "../api/axios";

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const res = await API.get("/admin/access-logs");
    setLogs(res.data || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Access Logs</h1>

      {logs.map((log, i) => (
        <div key={i} className="border p-3 mb-2">
          <p>
            <strong>User:</strong> {log.user}
          </p>
          <p>
            <strong>Route:</strong> {log.route}
          </p>
          <p>
            <strong>Time:</strong> {new Date(log.time).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AccessLogs;
