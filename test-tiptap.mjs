import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { generateHTML } from '@tiptap/html';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle', 'heading', 'paragraph'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize} !important;` };
            },
          },
        },
      },
    ];
  },
});

const content = '<h2 style="font-size: 16px !important;"><span style="font-size: 16px !important;">Anh/ chị có dự án cần thực hiện:</span></h2><p></p><h2 style="font-size: 40px !important;"></h2><p></p>';

const html = generateHTML({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Example test',
        },
      ],
    },
  ],
}, [StarterKit, TextStyle, FontSize]);

console.log('Result:', html);
