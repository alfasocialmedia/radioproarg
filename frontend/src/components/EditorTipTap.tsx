import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import {
    Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
    AlignJustify, Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
    Undo, Redo
} from 'lucide-react';

interface EditorTipTapProps {
    value: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const btnClass = (isActive: boolean) =>
        `p-2 rounded-lg transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/10'}`;

    const addImage = () => {
        const url = window.prompt('URL de la imagen (podés copiarla del Gestor de Medios):');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutube = () => {
        const url = window.prompt('URL del video de YouTube:');
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL del enlace:', previousUrl);
        
        if (url === null) return;
        
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-black/40 rounded-t-xl">
            {/* Historial */}
            <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnClass(false) + " disabled:opacity-30"}><Undo className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnClass(false) + " disabled:opacity-30"}><Redo className="w-4 h-4" /></button>
            </div>

            {/* Texto base */}
            <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Negrita"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Cursiva"><Italic className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))} title="Tachado"><Strikethrough className="w-4 h-4" /></button>
            </div>

            {/* Títulos */}
            <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Título 1"><Heading1 className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Título 2"><Heading2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="Título 3"><Heading3 className="w-4 h-4" /></button>
            </div>

            {/* Alineación */}
            <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Alinear a la izquierda"><AlignLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Alinear al centro"><AlignCenter className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Alinear a la derecha"><AlignRight className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={btnClass(editor.isActive({ textAlign: 'justify' }))} title="Justificar"><AlignJustify className="w-4 h-4" /></button>
            </div>

            {/* Listas y Citas */}
            <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Lista con viñetas"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Lista numerada"><ListOrdered className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Cita"><Quote className="w-4 h-4" /></button>
            </div>

            {/* Media e Insertos */}
            <div className="flex gap-1">
                <button type="button" onClick={setLink} className={btnClass(editor.isActive('link'))} title="Enlace"><LinkIcon className="w-4 h-4" /></button>
                <button type="button" onClick={addImage} className={btnClass(false)} title="Insertar Imagen"><ImageIcon className="w-4 h-4" /></button>
                <button type="button" onClick={addYoutube} className={btnClass(false)} title="Insertar Video YouTube"><YoutubeIcon className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

export default function EditorTipTap({ value, onChange }: EditorTipTapProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto my-4',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline hover:text-blue-400 transition-colors',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Youtube.configure({
                inline: false,
                HTMLAttributes: {
                    class: 'w-full aspect-video rounded-xl overflow-hidden my-4',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4 bg-black/30 text-slate-200 rounded-b-xl',
            },
        },
    });

    // Actualiza el editor si cambia el valor inicial (e.g., al abrir una noticia existente)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Evita actualizar si el contenido es esencialmente el mismo
            const currentContent = editor.getHTML();
            if (value !== '<p></p>' && value !== '' || currentContent !== '<p></p>') {
                // editor.commands.setContent(value); // Puede resetear el cursor
            }
        }
    }, [value, editor]);

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden shadow-inner focus-within:border-primary/50 transition-colors bg-[#0f172a]">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
