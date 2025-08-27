import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24 space-y-6">
      {posts.map((post) => (
        <Link to={`/blog/${post.id}`} key={post.id} className="block">
          <Card
            className="relative h-60 cursor-pointer text-white overflow-hidden"
            style={{
              backgroundImage: `url(http://127.0.0.1:8000${post.coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-md p-3">
              <CardTitle>{post.title}</CardTitle>
              <CardDescription className="text-gray-200">
                {new Date(post.date).toLocaleDateString()}
              </CardDescription>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
