import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Support() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  const handleSend = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("subject", subject);
    formData.append("message", message);
    files.forEach((file) => formData.append("images", file));

    const res = await fetch("/support", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      alert(
        `Tracking ID: ${data.trackingId}\nYour request has been sent and we will contact you shortly.`
      );
      setEmail("");
      setSubject("");
      setMessage("");
      setFiles([]);
    }
  };

  const faqSections = [
    {
      title: "General",
      items: [
        {
          q: "How do I analyze a domain?",
          a: "Enter a domain on the home page and press Analyze.",
        },
        { q: "Is DNSCAP free?", a: "Yes, DNSCAP is an open source project." },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Tabs defaultValue="faq" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h3 className="font-semibold">{section.title}</h3>
                  {section.items.map((item, idx) => (
                    <details key={idx} className="border rounded p-2">
                      <summary className="cursor-pointer font-medium">
                        {item.q}
                      </summary>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Input
                placeholder="Message"
                className="h-24"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSend}>Send</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
