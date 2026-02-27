"use client";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

const categories = ["Confession", "Regret", "Secret", "Advice"];

export default function ConfessionForm({
  onPostCreated,
}: {
  onPostCreated: () => void;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Confession");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.warning(`${category} cannot be empty`);
      return;
    }

    setLoading(true);

    const promise = axios.post("/api/confessions", {
      content,
      category,
    });

    try {
      await toast.promise(promise, {
        loading: `Posting ${category}...`,
        success: `${category} posted successfully`,
        error: `Failed to post ${category}`,
      });

      setContent("");
      setCategory("Confession");

    } catch {
    } finally {
      setLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
      <form onSubmit={submit}>
        <textarea
          placeholder="Start a confession..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full resize-none text-lg bg-transparent focus:outline-none placeholder-gray-400"
        />

        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm border transition ${category === cat
                ? "bg-black text-white border-black"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-end items-center mt-5">
          {/* <span></span> */}

          <button
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:opacity-80 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}

            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}