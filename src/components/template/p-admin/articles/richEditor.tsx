"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  LuBold,
  LuHeading2,
  LuHeading3,
  LuItalic,
  LuList,
  LuListOrdered,
  LuQuote,
  LuStrikethrough,
} from "react-icons/lu";
import type { IconType } from "react-icons";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}

export default function RichEditor({ value, onChange, invalid = false }: RichEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return <div className="skeleton h-72 w-full" />;

  const tools: Array<{ icon: IconType; label: string; active: boolean; run: () => void }> = [
    {
      icon: LuHeading2,
      label: "Heading",
      active: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: LuHeading3,
      label: "Subheading",
      active: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: LuBold,
      label: "Bold",
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: LuItalic,
      label: "Italic",
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: LuStrikethrough,
      label: "Strike",
      active: editor.isActive("strike"),
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      icon: LuList,
      label: "Bullet list",
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: LuListOrdered,
      label: "Numbered list",
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: LuQuote,
      label: "Quote",
      active: editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-card focus-within:ring-4 dark:bg-ink-900 ${
        invalid
          ? "border-danger-400 focus-within:ring-danger-400/20"
          : "border-gray-300 focus-within:border-brand-500 focus-within:ring-brand-500/15 dark:border-white/10"
      }`}
    >
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-1.5 dark:border-white/10 dark:bg-white/[0.03]">
        {tools.map(({ icon: Icon, label, active, run }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={run}
            className={`btn btn-sm btn-icon ${active ? "bg-white text-brand-700 shadow-card dark:bg-ink-700 dark:text-brand-300" : "btn-ghost"}`}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="rich-editor text-sm text-gray-900 dark:text-gray-100" />
    </div>
  );
}
