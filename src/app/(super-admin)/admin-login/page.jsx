// AdminLogin.jsx or admin/login/page.jsx
"use client";
import { loginUser } from "@/redux/features/auth/authSlice";
import Link, { useRouter } from "expo-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth,
  );
  const router = useRouter();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(credentials));
    if (result.meta.requestStatus === "fulfilled") {
      // Redirect to admin dashboard
      router.push("/admin");
    }
  };

  return (
    <div className="px-4 min-h-screen bg-gray-50">
      <div className="mb-24 lg:mb-32">
        {/* Admin Header */}
        <div className="text-center pt-24 lg:pt-40 mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Admin Login
          </h2>
          <p className="mt-2 text-gray-600">
            Access your administrative dashboard
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* FORM */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  className="w-full border border-gray-300 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In to Admin Panel"
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-amber-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    This is a secure admin area. Only authorized personnel
                    should access this page.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to main site */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                ← Back to user login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
