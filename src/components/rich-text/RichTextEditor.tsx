import { FunctionComponent } from 'react';
import { Link, RichTextEditor as RTE } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';

const RichTextEditor: FunctionComponent<{
    value: string | undefined;
    onChange: (newValue: string) => void;
    placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            Link,
            SubScript,
            Superscript,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: (e) => onChange(e.editor.getHTML()),
    });

    return (
        <RTE editor={editor}>
            <RTE.Toolbar
                sticky
                stickyOffset={60}
            >
                <RTE.ControlsGroup>
                    <RTE.Bold />
                    <RTE.Italic />
                    <RTE.Underline />
                    <RTE.Strikethrough />
                    <RTE.Subscript />
                    <RTE.Superscript />
                    <RTE.Highlight />
                    <RTE.ClearFormatting />
                </RTE.ControlsGroup>

                <RTE.ControlsGroup>
                    <RTE.BulletList />
                    <RTE.OrderedList />
                    <RTE.AlignLeft />
                    <RTE.AlignCenter />
                    <RTE.AlignRight />
                </RTE.ControlsGroup>

                <RTE.ControlsGroup>
                    <RTE.H1 />
                    <RTE.H2 />
                    <RTE.H3 />
                    <RTE.H4 />
                </RTE.ControlsGroup>

                <RTE.ControlsGroup>
                    <RTE.Link />
                    <RTE.Unlink />
                    <RTE.Blockquote />
                    <RTE.Code />
                </RTE.ControlsGroup>
            </RTE.Toolbar>

            <RTE.Content />
        </RTE>
    );
};

export default RichTextEditor;
