import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';

// Extension personnalisée pour le fond coloré
const CustomBackgroundColor = Extension.create({
  name: 'backgroundColor',

  addAttributes() {
    return {
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle', 'paragraph', 'codeBlock'],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      },
    ];
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
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
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md p-4',
          },
        },
      }),
      Link,
      Image,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      CustomBackgroundColor.configure({
        types: ['paragraph', 'codeBlock'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'strike':
        editor.chain().focus().toggleStrike().run();
        break;
      case 'code':
        editor.chain().focus().toggleCode().run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'horizontalRule':
        editor.chain().focus().setHorizontalRule().run();
        break;
    }
  };

  const setHeading = (level: number) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(align).run();
  };

  const addImage = () => {
    const url = window.prompt('URL de l\'image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('URL du lien:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-lg" onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.stopPropagation();
      }
    }}>
      <div className="border-b p-2 bg-gray-50 flex flex-wrap gap-2 items-center">
        {/* Niveaux de titre */}
        <select
          onChange={(e) => setHeading(parseInt(e.target.value))}
          className="border rounded px-3 py-1.5 min-w-[120px]"
          value={editor.isActive('heading', { level: 1 }) ? '1' : 
                 editor.isActive('heading', { level: 2 }) ? '2' :
                 editor.isActive('heading', { level: 3 }) ? '3' : '0'}
        >
          <option value="0">Paragraphe</option>
          <option value="1">Titre 1</option>
          <option value="2">Titre 2</option>
          <option value="3">Titre 3</option>
        </select>

        {/* Annuler/Rétablir */}
        <div className="flex border rounded">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`p-1.5 ${!editor.can().undo() ? 'opacity-50' : ''}`}
          >
            ↩
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`p-1.5 border-l ${!editor.can().redo() ? 'opacity-50' : ''}`}
          >
            ↪
          </button>
        </div>

        {/* Alignement */}
        <div className="flex border rounded">
          <button
            type="button"
            onClick={() => setTextAlign('left')}
            className={`p-1.5 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setTextAlign('center')}
            className={`p-1.5 border-l ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => setTextAlign('right')}
            className={`p-1.5 border-l ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
          >
            →
          </button>
          <button
            type="button"
            onClick={() => setTextAlign('justify')}
            className={`p-1.5 border-l ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
          >
            ⇔
          </button>
        </div>

        {/* Formatage de base */}
        <div className="flex border rounded">
          <button
            type="button"
            onClick={() => toggleFormat('bold')}
            className={`p-1.5 font-bold ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            G
          </button>
          <button
            type="button"
            onClick={() => toggleFormat('italic')}
            className={`p-1.5 border-l italic ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => toggleFormat('underline')}
            className={`p-1.5 border-l underline ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => toggleFormat('strike')}
            className={`p-1.5 border-l line-through ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
          >
            S
          </button>
        </div>

        {/* Couleurs */}
        <div className="flex space-x-2">
          <input
            type="color"
            onChange={(e) => {
              const color = e.target.value;
              editor.chain().focus().setColor(color).run();
            }}
            className="w-8 h-8 rounded cursor-pointer"
            title="Couleur du texte"
          />
          <input
            type="color"
            onChange={(e) => {
              const color = e.target.value;
              editor.commands.updateAttributes('paragraph', {
                backgroundColor: color
              });
            }}
            className="w-8 h-8 rounded cursor-pointer"
            title="Couleur de fond"
          />
        </div>

        {/* Listes */}
        <div className="flex border rounded">
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleBulletList().run();
            }}
            className={`p-1.5 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          >
            •
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={`p-1.5 border-l ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          >
            1.
          </button>
        </div>

        {/* Code */}
        <div className="flex border rounded items-center">
          <button
            type="button"
            onClick={() => toggleFormat('code')}
            className={`p-1.5 font-mono ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
          >
            {'</>'}
          </button>
          <div className="flex items-center border-l">
            <button
              type="button"
              onClick={() => toggleFormat('codeBlock')}
              className={`p-1.5 font-mono ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
              title="Bloc de code"
            >
              {'{ }'}
            </button>
            <input
              type="color"
              onChange={(e) => {
                const color = e.target.value;
                if (editor.isActive('codeBlock')) {
                  editor.commands.updateAttributes('codeBlock', {
                    backgroundColor: color
                  });
                } else {
                  editor.commands.toggleCodeBlock().updateAttributes('codeBlock', {
                    backgroundColor: color
                  });
                }
              }}
              className="w-6 h-6 mx-1 rounded cursor-pointer"
              title="Couleur de fond du bloc de code"
            />
          </div>
        </div>

        {/* Citation */}
        <button
          type="button"
          onClick={() => toggleFormat('blockquote')}
          className={`p-1.5 border rounded ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        >
          "
        </button>

        {/* Séparateur */}
        <button
          type="button"
          onClick={() => toggleFormat('horizontalRule')}
          className="p-1.5 border rounded"
        >
          ―
        </button>

        {/* Image et lien */}
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 border rounded"
        >
          🖼
        </button>
        <button
          type="button"
          onClick={addLink}
          className="p-1.5 border rounded"
        >
          🔗
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
