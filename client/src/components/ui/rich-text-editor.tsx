import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { forwardRef, useImperativeHandle } from 'react';

export interface RichTextEditorRef {
  getHTML: () => string;
  getText: () => string;
  setContent: (content: string) => void;
  focus: () => void;
}

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  className?: string;
  editorClassName?: string;
  showToolbar?: boolean;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ 
    content = '',
    placeholder = 'Start writing...',
    onChange,
    className,
    editorClassName,
    showToolbar = true
  }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline cursor-pointer',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'max-w-full h-auto rounded-md',
          },
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content,
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none max-w-none',
            'prose-headings:font-medium prose-headings:text-foreground',
            'prose-p:text-foreground prose-p:leading-relaxed',
            'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            'prose-strong:text-foreground prose-em:text-foreground',
            'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
            'prose-pre:bg-muted prose-pre:text-foreground',
            'prose-blockquote:text-foreground prose-blockquote:border-l-border',
            'prose-hr:border-border',
            'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
            'prose-table:text-foreground prose-thead:text-foreground prose-tbody:text-foreground',
            'prose-th:border-border prose-td:border-border',
            'min-h-[200px] px-3 py-2',
            editorClassName
          ),
        },
      },
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || '',
      getText: () => editor?.getText() || '',
      setContent: (content: string) => editor?.commands.setContent(content),
      focus: () => editor?.commands.focus(),
    }));

    if (!editor) {
      return null;
    }

    const ToolbarButton = ({ 
      onClick, 
      isActive = false, 
      disabled = false, 
      children,
      title 
    }: {
      onClick: () => void;
      isActive?: boolean;
      disabled?: boolean;
      children: React.ReactNode;
      title?: string;
    }) => (
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
          "h-8 w-8 p-0",
          isActive && "bg-primary text-primary-foreground"
        )}
      >
        {children}
      </Button>
    );

    const setLink = () => {
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('URL', previousUrl);

      if (url === null) {
        return;
      }

      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
      const url = window.prompt('Image URL');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };

    const insertTable = () => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    return (
      <div className={cn("border border-input bg-background rounded-md", className)}>
        {showToolbar && (
          <div className="border-b border-border p-2 flex flex-wrap items-center gap-1">
            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Headings */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Links and Media */}
            <ToolbarButton
              onClick={setLink}
              isActive={editor.isActive('link')}
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={addImage}
              title="Add Image"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={insertTable}
              title="Insert Table"
            >
              <TableIcon className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Undo/Redo */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>
        )}
        
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };