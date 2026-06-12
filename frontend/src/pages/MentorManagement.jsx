import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const MentorManagement = () => {
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mentorsRes, studentsRes] = await Promise.all([
        API.get("/admin/mentors"),
        API.get("/admin/students"),
      ]);

      setMentors(mentorsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudents = async (mentorId, updatedIds) => {
    try {
      await API.post("/admin/assign-students", {
        mentorId,
        studentIds: updatedIds,
      });
      toast.success("Updated successfully");
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  const toggleStudent = (mentor, studentId) => {
    const current = mentor.assignedStudents?.map((s) => s._id || s) || [];

    let updated;

    if (current.includes(studentId)) {
      updated = current.filter((id) => id !== studentId);
    } else {
      updated = [...current, studentId];
    }

    handleAssignStudents(mentor._id, updated);
  };

  if (loading)
    return <div className="text-center mt-10 text-white">Loading...</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Mentor Management</h1>

      <input
        type="text"
        placeholder="Search students..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-3 rounded bg-gray-800 border border-gray-700"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {mentors.map((mentor) => {
          const assignedIds =
            mentor.assignedStudents?.map((s) => s._id || s) || [];

          const filteredStudents = students.filter((student) => {
            const matchSearch = student.name
              .toLowerCase()
              .includes(search.toLowerCase());

            const allowed =
              !student.mentor ||
              student.mentor === mentor._id ||
              student.mentor?._id === mentor._id;

            return matchSearch && allowed;
          });

          return (
            <div
              key={mentor._id}
              className="bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-800"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{mentor.name}</h2>
                <p className="text-gray-400 text-sm">{mentor.email}</p>
                <p className="text-sm mt-1">Assigned: {assignedIds.length}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {assignedIds.map((id) => {
                  const student = students.find((s) => s._id === id);
                  return (
                    <span
                      key={id}
                      className="bg-blue-600 px-3 py-1 rounded-full text-sm"
                    >
                      {student?.name || "Student"}
                    </span>
                  );
                })}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredStudents.map((student) => {
                  const checked = assignedIds.includes(student._id);

                  return (
                    <label
                      key={student._id}
                      className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded cursor-pointer hover:bg-gray-700"
                    >
                      <span>{student.name}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudent(mentor, student._id)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MentorManagement;
