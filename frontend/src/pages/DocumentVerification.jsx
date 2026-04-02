import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const DocumentVerification = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const res = await API.get("/admin/internships");
      setInternships(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to fetch internships");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (internshipId, documentType, verified) => {
    setVerifying({ [internshipId]: documentType });
    try {
      await API.post("/admin/verify-document", {
        internshipId,
        documentType,
        verified: !verified,
      });

      toast.success(`Document ${verified ? "unverified" : "verified"}`);

      setInternships((prev) =>
        prev.map((int) =>
          int._id === internshipId
            ? {
                ...int,
                documents: {
                  ...int.documents,
                  [documentType]: {
                    ...int.documents?.[documentType],
                    verified: !verified,
                  },
                },
              }
            : int,
        ),
      );
    } catch (err) {
      toast.error("Verification failed");
      fetchInternships();
    } finally {
      setVerifying({});
    }
  };

  if (loading)
    return <div className="text-center mt-10">Loading all internships...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Document Verification (Admin)</h1>
        <button
          onClick={fetchInternships}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {internships.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow p-8">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 text-xl mb-2">No internships found</p>
          <p className="text-gray-400">
            Students need to create internships first.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div
              key={internship._id}
              className="bg-white dark:bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">
                  {internship.companyName || "N/A"}
                </h3>
                <p className="text-sm text-gray-500">
                  {internship.student?.name || "Student"} -{" "}
                  {internship.role || internship.domain || "N/A"}
                </p>
              </div>

              <div className="space-y-3">
                {renderDoc({
                  internship,
                  label: "Offer Letter",
                  key: "offerLetter",
                  verifying,
                  handleVerify,
                })}

                {renderDoc({
                  internship,
                  label: "Completion Certificate",
                  key: "completionCertificate",
                  verifying,
                  handleVerify,
                })}

                {renderDoc({
                  internship,
                  label: "Final Report",
                  key: "finalReport",
                  verifying,
                  handleVerify,
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderDoc = ({ internship, label, key, verifying, handleVerify }) => {
  const doc = internship.documents?.[key];
  const isVerifying = verifying[internship._id] === key;

  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-gray-400">
          {doc?.url
            ? `Uploaded by ${internship.student?.name}`
            : "Not Uploaded"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {doc?.url ? (
          <>
            <a
              href={`http://localhost:5000${doc.url}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
            >
              View
            </a>

            <button
              onClick={() => handleVerify(internship._id, key, doc.verified)}
              disabled={isVerifying}
              className={`px-3 py-1 text-xs rounded ${
                doc.verified ? "bg-orange-500" : "bg-green-500"
              }`}
            >
              {isVerifying ? "..." : doc.verified ? "Unverify" : "Verify"}
            </button>
          </>
        ) : (
          <span className="text-xs text-gray-400">Waiting...</span>
        )}
      </div>
    </div>
  );
};

export default DocumentVerification;
