"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { useEffect } from "react";
import { Undo2, Redo2, List, ListOrdered } from "lucide-react";
import "./rich-text-editor.css";

interface RichTextEditorContentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditorContent({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorContentProps) {
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        // Keep default features (bold, italic, strike, paragraph, hardBreak)
        // Configure heading levels
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Keep lists (bulletList, orderedList, listItem are enabled by default)

        // Disable features not requested
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Markdown.configure({
        html: false, // Don't allow HTML in markdown
        transformPastedText: true, // Transform pasted text to markdown
        transformCopiedText: true, // Transform copied text to markdown
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert focus:outline-none max-w-none min-h-[400px] px-4 py-3",
        placeholder: placeholder || "",
      },
    },
    onUpdate: ({ editor }) => {
      // Get markdown from editor using tiptap-markdown extension
      const markdown = (editor.storage as any).markdown?.getMarkdown?.() || "";
      onChange(markdown);
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== (editor.storage as any).markdown?.getMarkdown?.()) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border border-border bg-background ${className || ""}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors hover:bg-muted ${
            editor.isActive("bold") ? "bg-muted" : ""
          }`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-3 py-1 text-sm font-medium italic transition-colors hover:bg-muted ${
            editor.isActive("italic") ? "bg-muted" : ""
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`rounded px-3 py-1 text-sm font-medium line-through transition-colors hover:bg-muted ${
            editor.isActive("strike") ? "bg-muted" : ""
          }`}
          title="Strikethrough"
        >
          S
        </button>

        <div className="mx-1 w-px bg-border" />

        {/* Headings */}
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                .run()
            }
            className={`rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-muted ${
              editor.isActive("heading", { level }) ? "bg-muted" : ""
            }`}
            title={`Heading ${level}`}
          >
            H{level}
          </button>
        ))}

        <div className="mx-1 w-px bg-border" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted ${
            editor.isActive("bulletList") ? "bg-muted" : ""
          }`}
          title="Bullet List"
        >
          <List />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted ${
            editor.isActive("orderedList") ? "bg-muted" : ""
          }`}
          title="Numbered List"
        >
          <ListOrdered />
        </button>

        <div className="mx-1 w-px bg-border" />

        {/* Undo */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="rounded px-3 py-1 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="rounded px-3 py-1 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
