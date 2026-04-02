import React from "react";
import { Link } from "react-router-dom";

const Terms = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
    <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
    <p className="mb-2">
      These are the terms and conditions. Use the site responsibly.
    </p>
    <Link to="/" className="text-primary underline">
      Back to Home
    </Link>
  </div>
);

export default Terms;
