"use client";
import axios from "axios";
import { useEffect, useState, useRef } from "react";

type User = { id: string; username: string };

type Post = {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  reactions: Record<string, number>;
  userReaction: string | null;
  user: User;
};

const reactionConfig: Record<
  string,
  { emoji: string; label: string }
> = {
  SUPPORT: { emoji: "🤝", label: "Support" },
  RELATE: { emoji: "🫶", label: "Relate" },
  HUG: { emoji: "🤗", label: "Hug" },
  STAY_STRONG: { emoji: "💪", label: "Stay Strong" },
  PROUD_OF_YOU: { emoji: "🌟", label: "Proud of You" },
  THATS_TOUGH: { emoji: "💔", label: "That's Tough" },
};

export default function ConfessionFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePost, setActivePost] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await axios.get("/api/confessions");
    setPosts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedPosts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const react = async (id: string, type: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== id) return post;

        const current = post.userReaction;
        const updated = { ...post.reactions };

        if (current) {
          updated[current] = (updated[current] || 1) - 1;
          if (updated[current] <= 0) delete updated[current];
        }

        let newReaction: string | null = type;

        if (current === type) {
          newReaction = null;
        } else {
          updated[type] = (updated[type] || 0) + 1;
        }

        return {
          ...post,
          reactions: updated,
          userReaction: newReaction,
        };
      })
    );

    setActivePost(null);
    await axios.patch(`/api/confessions/${id}/like`, { type });
  };

  const handlePressStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      setActivePost(id);
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <p>No confessions</p>
      ) : (
        posts.map(post => {
          const words = post.content.trim().split(/\s+/);
          const exceedsLimit = words.length > 50;
          const isExpanded = expandedPosts[post.id];

          const displayedText = exceedsLimit && !isExpanded
            ? words.slice(0, 50).join(" ")
            : post.content;

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 transition hover:shadow-md"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">
                    {post?.user?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-3 py-3 font-bold rounded-full bg-gray-100 text-gray-600 border">
                  {post.category}
                </span>
              </div>

              <p className="text-lg mb-2 whitespace-pre-wrap">
                {displayedText}
                {exceedsLimit && !isExpanded && " ..."}
              </p>

              {exceedsLimit && (
                <button
                  onClick={() => toggleExpand(post.id)}
                  className="text-sm text-indigo-600 hover:underline mb-4 cursor-pointer"
                >
                  {isExpanded ? "Read less" : "Read more"}
                </button>
              )}

              <div className="flex items-center gap-6 text-sm">
                <button
                  onClick={() => setActivePost(post.id)}
                  onTouchStart={() => handlePressStart(post.id)}
                  onTouchEnd={handlePressEnd}
                  className="px-3 py-1 rounded hover:bg-gray-100 transition"
                >
                  {post.userReaction && reactionConfig[post.userReaction]
                    ? `${reactionConfig[post.userReaction].emoji} ${reactionConfig[post.userReaction].label}`
                    : "React"}
                </button>

                <button className="hover:text-black">💬 Comment</button>
                <button className="hover:text-black">↗ Share</button>
              </div>

              <div className="flex gap-3 text-sm text-gray-600 mt-2">
                {Object.entries(post.reactions).map(([type, count]) => (
                  <span key={type}>
                    {reactionConfig[type]?.emoji} {count}
                  </span>
                ))}
              </div>

              {activePost === post.id && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
                  onClick={() => setActivePost(null)}
                >
                  <div
                    className="bg-white rounded-full px-6 py-4 flex gap-4 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.entries(reactionConfig).map(([type, config]) => (
                      <button
                        key={type}
                        onClick={() => react(post.id, type)}
                        className="text-3xl transform transition duration-200 hover:scale-125 active:scale-110"
                      >
                        {config.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}