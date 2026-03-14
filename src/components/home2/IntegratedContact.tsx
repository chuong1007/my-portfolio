"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { Loader2, Send } from "lucide-react";

export function IntegratedContact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const supabase = createClient();
    const { error } = await supabase
      .from("contact_submissions")
      .insert([formData]);

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <section className="px-6 md:px-12 py-32 bg-zinc-950">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <div className="space-y-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Contact</span>
            <h2 className="text-5xl md:text-7xl font-bold text-zinc-50 mt-4 tracking-tighter leading-none">
              Let's build <br /> something <br /> great.
            </h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-xl text-zinc-400 font-light max-w-md">
              Available for freelance opportunities and long-term collaborations. 
            </p>
            <div className="flex flex-col gap-2">
              <a href="mailto:hello@example.com" className="text-zinc-50 hover:text-zinc-400 transition-colors text-lg">hello@chuong.graphic</a>
              <a href="tel:+84123456789" className="text-zinc-50 hover:text-zinc-400 transition-colors text-lg">+84 123 456 789</a>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900/40 border border-zinc-800/50 p-8 md:p-12 rounded-[3.5rem] backdrop-blur-xl"
        >
          {status === 'success' ? (
            <div className="py-20 text-center space-y-4">
              <h3 className="text-2xl font-bold text-zinc-50">Thank you!</h3>
              <p className="text-zinc-400">Your message has been received. I'll get back to you soon.</p>
              <button onClick={() => setStatus('idle')} className="mt-8 text-sm font-bold uppercase tracking-widest text-white border-b border-white pb-1">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 ml-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-b border-zinc-800 py-4 text-zinc-50 focus:outline-none focus:border-zinc-100 transition-colors placeholder:text-zinc-700"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 ml-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-b border-zinc-800 py-4 text-zinc-50 focus:outline-none focus:border-zinc-100 transition-colors placeholder:text-zinc-700"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 ml-1">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-transparent border-b border-zinc-800 py-4 text-zinc-50 focus:outline-none focus:border-zinc-100 transition-colors placeholder:text-zinc-700 resize-none"
                  placeholder="Tell me about your project..."
                  rows={4}
                />
              </div>
              
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-white text-black py-6 rounded-2xl font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
              {status === 'error' && <p className="text-red-500 text-xs text-center">Something went wrong. Please try again.</p>}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
