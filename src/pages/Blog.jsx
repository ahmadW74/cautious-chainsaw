import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const posts = [
  {
    title: "Welcome to DNSCAP",
    date: "January 5, 2025",
    excerpt: "Learn how DNSCAP helps you explore DNSSEC chains.",
    tag: "News",
  },
  {
    title: "Understanding DNSSEC",
    date: "February 12, 2025",
    excerpt: "A primer on DNS security extensions and why they matter.",
    tag: "Guide",
  },
  {
    title: "Behind the Scenes",
    date: "March 20, 2025",
    excerpt: "How we build visualizations with open data and modern tools.",
    tag: "Insights",
  },
];

export default function Blog() {
  return (
    <div className="max-w-4xl mx-auto p-6 pt-24 space-y-6">
      {posts.map((post) => (
        <Card key={post.title}>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription>{post.date}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{post.excerpt}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Badge>{post.tag}</Badge>
            <Button variant="secondary">Read more</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
