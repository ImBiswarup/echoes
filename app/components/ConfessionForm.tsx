"use client";
import { useState } from "react";

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
    if (!content.trim()) return;

    setLoading(true);

    await fetch("/api/confessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category }),
    });

    setContent("");
    setCategory("Confession");
    setLoading(false);

    // onPostCreated(); // reload feed
    window.location.reload();
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
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:opacity-80 transition"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}