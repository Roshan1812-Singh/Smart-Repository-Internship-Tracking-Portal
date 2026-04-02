import { useEffect, useState } from "react";
import API from "../api/axios";

const ExportReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const res = await API.get("/admin/export-data");
    setReports(res.data.reports || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Export Reports</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Student</th>
            <th>Mentor</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r) => (
            <tr key={r._id}>
              <td>{r.student?.name}</td>
              <td>{r.mentor?.name}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExportReports;