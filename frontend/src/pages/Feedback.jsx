import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import Card from "../components/ui/Card";
import ChatBubble from "../components/ui/ChatBubble";

const Feedback = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mentorId, setMentorId] = useState(null);

  const messagesEndRef = useRef(null);

  // ✅ FIX: define user once
  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const profileRes = await API.get("/students/profile");
        if (profileRes.data.student.mentor) {
          setMentorId(profileRes.data.student.mentor);
        }

        const res = await API.get("/messages");
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }
      }
    };

    fetchData();
  }, []);

  const sendMessage = async () => {
    if (!mentorId) {
      alert("Mentor not assigned yet");
      return;
    }

    try {
      await API.post("/messages", {
        receiver: mentorId,
        message: newMessage,
        type: "general",
      });

      setNewMessage("");

      const res = await API.get("/messages");
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Failed to send message");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900/50 dark:to-purple-900/20">
      <div className="max-w-4xl mx-auto space-y-12">
        <HeroHeader
          title="💬 Feedback & Communication"
          subtitle="Send feedback to your mentor and track conversation history."
        />

        <div className="flex flex-col h-[600px] lg:h-[700px] max-w-2xl mx-auto">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-6 backdrop-blur-xl rounded-3xl shadow-2xl border bg-gray-500 mb-6 text-black">
            {messages.map((msg, index) => {
              const isMe = msg.sender?._id === user?._id;

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isMe ? "flex-row-reverse" : ""}`}
                >
                  <ChatBubble
                    message={msg.message}
                    sender={msg.sender?.name}
                    time={new Date(msg.createdAt).toLocaleString()}
                    type={isMe ? "sent" : "received"}
                  />
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <Card className="p-6">
            <div className="flex gap-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-4 border rounded-xl resize-none bg-gray-500"
              />

              <motion.button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !mentorId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              >
                ➤
              </motion.button>
            </div>

            {!mentorId && (
              <p className="text-center text-red-500 mt-3">
                Mentor not assigned yet
              </p>
            )}
          </Card>
        </div>

        {/* Stats */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 bg-gray-400 text-black">
              <h2 className="text-3xl font-bold">{messages.length}</h2>
              <p>Total Messages</p>
            </Card>

            <Card className="text-center p-6 bg-gray-400 text-black">
              <h2 className="text-3xl font-bold">
                {messages.filter((msg) => msg.sender?._id === user?._id).length}
              </h2>
              <p>Sent</p>
            </Card>

            <Card className="text-center p-6 bg-gray-400 text-black">
              <h2 className="text-3xl font-bold">
                {messages.filter((msg) => msg.sender?._id !== user?._id).length}
              </h2>
              <p>Received</p>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Feedback;
