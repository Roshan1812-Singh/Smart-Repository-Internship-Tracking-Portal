import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", mentorId: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, mentorsRes] = await Promise.all([
        API.get("/admin/students"),
        API.get("/admin/mentors"),
      ]);
      setStudents(studentsRes.data);
      setMentors(mentorsRes.data);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/students", formData);
      toast.success("Student added");
      setShowAddForm(false);
      setFormData({ name: "", email: "", password: "", mentorId: "" });
      fetchData();
    } catch (err) {
      toast.error("Failed to add student");
    }
  };

  const handleAssignMentor = async (studentId, mentorId) => {
    try {
      await API.post("/admin/assign-mentor", { studentId, mentorId });
      toast.success("Mentor assigned");
      fetchData();
    } catch (err) {
      toast.error("Failed to assign mentor");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await API.delete(`/admin/students/${id}`);
        toast.success("Student deleted");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete student");
      }
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Student Management</h1>

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {showAddForm ? "Cancel" : "Add Student"}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddStudent} className="bg-gray-900 p-4 rounded mb-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full mb-2 p-2 border"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full mb-2 p-2 border"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="block w-full mb-2 p-2 border"
            required
          />
          <select
            value={formData.mentorId}
            onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
            className="block w-full mb-2 p-2 border bg-gray-900"
          >
            <option value="">Select Mentor (Optional)</option>
            {mentors.map((mentor) => (
              <option key={mentor._id} value={mentor._id}>
                {mentor.name}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Add Student
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-900">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Mentor</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                <td className="border border-gray-300 px-4 py-2">{student.email}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <select
                    value={student.mentor?._id || ""}
                    onChange={(e) => handleAssignMentor(student._id, e.target.value)}
                    className="p-1 border bg-gray-900"
                  >
                    <option value="">No Mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor._id} value={mentor._id}>
                        {mentor.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleDelete(student._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManagement;