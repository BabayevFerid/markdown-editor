import React, { useState, useEffect, useMemo, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  Bold, Italic, Heading1, List, ListOrdered, Link, Code, Quote,
  Download, Upload, Clipboard, Moon, Sun
} from "lucide-react";

export default function App() {
  const [markdown, setMarkdown] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef();

  // Markdown HTML preview
  const html = useMemo(() => {
    const raw = marked.parse(markdown || "");
    return DOMPurify.sanitize(raw);
  }, [markdown]);

  // Autosave to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("markdown-editor-content");
    if (saved) setMarkdown(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("markdown-editor-content", markdown);
  }, [markdown]);

  // Toolbar insert text
  const insertAtCursor = (before, after = "") => {
    const textarea = document.getElementById("editor");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end);
    setMarkdown(newText);
  };

  // File import
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setMarkdown(event.target.result);
    reader.readAsText(file);
  };

  // File export
  const handleExport = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy markdown
  const copyMarkdown = () => navigator.clipboard.writeText(markdown);

  return (
    <div className={`${darkMode ? "dark" : ""} h-screen flex flex-col`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-100 dark:bg-gray-800">
        <button onClick={() => insertAtCursor("**", "**")}><Bold size={18} /></button>
        <button onClick={() => insertAtCursor("*", "*")}><Italic size={18} /></button>
        <button onClick={() => insertAtCursor("# ")}><Heading1 size={18} /></button>
        <button onClick={() => insertAtCursor("- ")}><List size={18} /></button>
        <button onClick={() => insertAtCursor("1. ")}><ListOrdered size={18} /></button>
        <button onClick={() => insertAtCursor("> ")}><Quote size={18} /></button>
        <button onClick={() => insertAtCursor("[Link text](url)") }><Link size={18} /></button>
        <button onClick={() => insertAtCursor("```\n", "\n```")}><Code size={18} /></button>
        <button onClick={handleExport}><Download size={18} /></button>
        <button onClick={() => fileInputRef.current.click()}><Upload size={18} /></button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".md,.txt"
          onChange={handleImport}
        />
        <button onClick={copyMarkdown}><Clipboard size={18} /></button>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        <textarea
          id="editor"
          className="w-1/2 p-3 outline-none border-r resize-none dark:bg-gray-900 dark:text-white"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Write your markdown here..."
        />
        <div
          className="w-1/2 p-3 overflow-auto prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
