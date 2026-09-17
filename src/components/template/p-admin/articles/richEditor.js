"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { LuBold, LuItalic, LuStrikethrough, LuList, LuListOrdered, LuHeading2 } from "react-icons/lu";

export default function RichEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        immediatelyRender: false,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return <div className="skeleton h-72 w-full" />;

    const tools = [
        { icon: LuHeading2, label: "Heading", active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { icon: LuBold, label: "Bold", active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
        { icon: LuItalic, label: "Italic", active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
        { icon: LuStrikethrough, label: "Strike", active: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
        { icon: LuList, label: "Bullet list", active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
        { icon: LuListOrdered, label: "Ordered list", active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    ];

    return (
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-card focus-within:border-sage-500 focus-within:ring-4 focus-within:ring-sage-500/15 dark:border-white/10 dark:bg-ink-900">
            <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                {tools.map(({ icon: Icon, label, active, run }) => (
                    <button key={label} type="button" title={label} onClick={run}
                        className={`btn btn-sm btn-icon ${active ? "bg-white text-sage-700 shadow-card dark:bg-ink-700 dark:text-sage-300" : "btn-ghost"}`}>
                        <Icon className="size-4" />
                    </button>
                ))}
            </div>
            <EditorContent editor={editor} className="rich-editor text-sm text-gray-900 dark:text-gray-100" />
        </div>
    );
}
