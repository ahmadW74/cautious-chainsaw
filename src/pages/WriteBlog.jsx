import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WriteBlog() {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const q = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
          handlers: {
            image: () => selectLocalImage(q),
          },
        },
      },
    });
    quillRef.current = q;
  }, []);

  const selectLocalImage = (quill) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        try {
          const res = await fetch("/upload_image", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          const range = quill.getSelection();
          quill.insertEmbed(range ? range.index : quill.getLength(), "image", data.url);
        } catch {
          // ignore errors
        }
      }
    };
  };

  const handlePost = async () => {
    const content = quillRef.current.root.innerHTML;
    await fetch("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    navigate("/blog");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 pt-24 space-y-4">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div ref={editorRef} className="bg-white" />
      <Button onClick={handlePost}>Post</Button>
    </div>
  );
}

