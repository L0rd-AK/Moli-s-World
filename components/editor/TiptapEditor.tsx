'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Code2,
  Link2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function TiptapEditor({
  content = '',
  onChange,
  placeholder = 'আপনার লেখা এখানে লিখুন... ',
  editable = true,
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      CodeBlock,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    editable,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('লিংক দিন', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('ছবির URL দিন');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className={cn('rounded-lg border border-cream-200 bg-white', className)}>
      <div className="flex flex-wrap gap-1 border-b border-cream-200 p-2">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} className="min-h-[240px] p-4 bengali-text" />
    </div>
  );
}
