import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { MentionList } from './MentionList';
import { createClient } from "@/lib/supabase";

export default {
  char: '/#', // Trigger exactly when user types /# 
  items: async ({ query }: { query: string }) => {
    try {
      // Create a temporary client since we are client-side
      const supabase = createClient();
      const { data } = await supabase.from('projects').select('tags');
      
      const allTags = new Set<string>();
      if (data) {
        data.forEach(p => {
          if (Array.isArray(p.tags)) {
            p.tags.forEach((t: string) => allTags.add(t));
          } else if (typeof p.tags === 'string') {
            try { 
              JSON.parse(p.tags).forEach((t: string) => allTags.add(t)); 
            } catch { 
              p.tags.split(',').forEach((t: string) => allTags.add(t.trim())); 
            }
          }
        });
      }
      
      const DEFAULT_TAGS = [
        "Poster Design", "Branding", "Logo Design", "UX/UI", "Graphic Design", 
        "Packaging Design", "E-Commerce Design", "Illustration", "Web Design", 
        "App Design", "Motion Graphics", "3D Modeling"
      ];
      
      const finalItems = Array.from(new Set([...DEFAULT_TAGS, ...allTags]))
        .filter(item => item.toLowerCase().includes(query.toLowerCase()))
        .sort();

      // Ensure the typed query is always available as an option if it's not exactly in the list
      if (query && !finalItems.some(i => i.toLowerCase() === query.toLowerCase())) {
        finalItems.unshift(query);
      }

      return finalItems.slice(0, 100);
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        if (popup && popup.length > 0) {
          popup[0].destroy();
        }
        if (component) {
          component.destroy();
        }
      },
    };
  },
};
