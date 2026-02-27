'use client';

import axios from "axios";
import { useState } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function AuthModal({ open, onClose }: Props) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!username.trim()) return;

        setLoading(true);

        const res = await axios.post(`/api/user/auth/${mode}`, {
            username,
        });

        setLoading(false);

        if (res.data) {
            onClose();
            window.location.reload();
        } else {
            alert("Something went wrong");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center text-black">
                    {mode === "login" ? "Login" : "Create Account"}
                </h2>

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading
                        ? "Please wait..."
                        : mode === "login"
                            ? "Login"
                            : "Register"}
                </button>

                <div className="text-center mt-4 text-sm text-gray-600">
                    {mode === "login" ? (
                        <>
                            Don't have an account?{" "}
                            <button
                                onClick={() => setMode("register")}
                                className="text-indigo-600 hover:underline"
                            >
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={() => setMode("login")}
                                className="text-indigo-600 hover:underline"
                            >
                                Login
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}