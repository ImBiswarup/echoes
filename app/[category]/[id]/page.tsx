'use client';

import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface User {
    id: string;
    username: string;
}
interface Reaction {
    id: string;
    type: string;
    userId: string;
}

interface Comment {
    id: string;
    text: string;
    userId: string;
    createdAt: string;
    user: User;
}

interface Confession {
    id: string;
    content: string;
    category: string;
    createdAt: string;
    reactions: Reaction[];
    comments: Comment[];
}

const Page = () => {
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<Confession | null>(null);
    const [error, setError] = useState('');

    const fetchSinglePost = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/confessions/${id}`);
            setPost(res.data);
            console.log(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to load confession');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchSinglePost();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin h-8 w-8 text-white" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-10 text-red-500">
                {error}
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="max-w-2xl mx-auto mt-10 px-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

                {/* Category */}
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                    {post.category}
                </span>

                {/* Content */}
                <p className="mt-4 text-lg leading-relaxed text-gray-800">
                    {post.content}
                </p>

                {/* Meta */}
                <div className="mt-4 text-sm text-gray-400">
                    {new Date(post.createdAt).toLocaleString()}
                </div>

                {/* Reactions */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="font-medium mb-2 text-black">
                        Reactions ({post.reactions.length})
                    </h3>
                </div>

                {/* Comments */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="font-medium mb-4 text-black">
                        Comments ({post.comments.length})
                    </h3>

                    {post.comments.length === 0 ? (
                        <p className="text-gray-400 text-sm">
                            No comments yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {post.comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="bg-gray-50 text-black p-3 rounded-lg text-sm"
                                >   {<span className="font-semibold mr-2">{comment?.user?.username}</span>}
                                    {comment.text}
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Page;