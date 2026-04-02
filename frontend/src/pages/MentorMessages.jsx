import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import ChatBubble from "../components/ui/ChatBubble";
import Badge from "../components/ui/Badge";

const MentorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [newMessage, setNewMessage] = useState({
    receiver: "",
    message: "",
    type: "general",
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    setUser(u);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const [messagesRes, studentsRes] = await Promise.all([
        API.get("/messages"),
        API.get("/mentor/assigned-students")
      ]);
      setMessages(messagesRes.data.messages || []);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedStudent || !newMessage.message.trim() || !user) return;

    try {
      const response = await API.post("/messages", {
        receiver: selectedStudent._id,
        message: newMessage.message.trim(),
        type: newMessage.type
      });

      // Optimistic update
      const newMsg = {
        _id: 'temp-' + Date.now(),
        sender: { _id: user._id, name: user.name },
        receiver: { _id: selectedStudent._id, name: selectedStudent.name },
        message: newMessage.message.trim(),
        type: newMessage.type,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, newMsg]);
      
      setNewMessage({ receiver: selectedStudent._id, message: "", type: "general" });
      
      // Refresh messages
      setTimeout(() => fetchData(), 500);
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setNewMessage(prev => ({ ...prev, receiver: student._id }));
    // Filter for this student
    const filtered = messages.filter(msg => 
      msg.sender?._id === student._id || msg.receiver?._id === student._id
    );
    setMessages(filtered);
  };

  const studentMessages = messages;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <HeroHeader title="Messages" subtitle="Chat with students" />
      
      <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
        {/* Students */}
        <div className="lg:col-span-1 text-black bg-white rounded-3xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Students ({students.length})</h2>
          {students.map((student) => (
            <div
              key={student._id}
              className={`p-4 rounded-2xl mb-4 cursor-pointer hover:bg-blue-50 ${
                selectedStudent?._id === student._id ? 'bg-blue-100 border-2 border-blue-300' : ''
              }`}
              onClick={() => selectStudent(student)}
            >
              <div className="font-bold">{student.name}</div>
              <div className="text-sm text-gray-600">{student.email}</div>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="lg:col-span-3 text-black bg-white rounded-3xl shadow-2xl flex flex-col h-[70vh]">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              {selectedStudent?.name || 'Select student'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-500">
            {studentMessages.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                No messages. Send first message!
              </div>
            ) : (
              studentMessages.map((msg) => (
                <ChatBubble
                  key={msg._id}
                  message={msg.message}
                  isOwn={msg.sender?._id === user?._id}
                  type={msg.type}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t">
            <div className="flex gap-3">
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                placeholder="Type message..."
                className="flex-1 p-4 border rounded-xl resize-none bg-gray-500"
                rows="2"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.message.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorMessages;
