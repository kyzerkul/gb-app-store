import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

interface RichTextContentProps {
  content: string;
}

export default function RichTextContent({ content }: RichTextContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable: false,
  });

  return (
    <div className="prose prose-lg max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}
