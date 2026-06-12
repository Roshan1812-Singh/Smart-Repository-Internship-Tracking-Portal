import React from "react";
import { Link } from "react-router-dom";

const Privacy = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
    <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
    <p className="mb-2">
      Your privacy is important to us. We do not share your data with third
      parties.
    </p>
    <Link to="/" className="text-primary underline">
      Back to Home
    </Link>
  </div>
);

export default Privacy;
