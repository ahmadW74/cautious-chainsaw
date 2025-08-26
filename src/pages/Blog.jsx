import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24 space-y-6">
      {posts.map((post) => {
        const text = post.content.replace(/<[^>]+>/g, "");
        const snippet = text.length > 200 ? text.slice(0, 200) + "..." : text;
        return (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>
                <Link to={`/blog/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription>
                {new Date(post.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{snippet}</p>
              <Link
                to={`/blog/${post.id}`}
                className="text-blue-500 hover:underline"
              >
                Read more
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
