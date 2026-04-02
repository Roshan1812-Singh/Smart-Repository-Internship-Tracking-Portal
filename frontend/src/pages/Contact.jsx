import React from "react";
import { Link } from "react-router-dom";

const Contact = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
    <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
    <p className="mb-2">Email: support@sritp.com</p>
    <p className="mb-2">Phone: +1-800-123-4567</p>
    <Link to="/" className="text-primary underline">
      Back to Home
    </Link>
  </div>
);

export default Contact;
