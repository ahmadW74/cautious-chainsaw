import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <p className="mb-4 text-red-500">{error}</p>
        <Link to="/blog" className="text-blue-500 hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return <div className="max-w-4xl mx-auto p-6 pt-24">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>
            {new Date(post.date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </CardContent>
      </Card>
      <Link to="/blog" className="text-blue-500 hover:underline">
        ← Back to all posts
      </Link>
    </div>
  );
}
