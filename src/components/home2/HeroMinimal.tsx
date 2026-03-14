"use client";

import { motion } from "framer-motion";

export function HeroMinimal() {
  return (
    <section className="px-6 md:px-12 py-24 md:py-32 flex flex-col items-start justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-zinc-50 leading-[0.9]">
          Elevating <br />
          Digital <br />
          Experiences.
        </h1>
        <p className="mt-8 text-xl md:text-2xl text-zinc-400 font-light max-w-2xl leading-relaxed">
          A design-driven developer focused on building high-performance, minimalist digital products that stand the test of time.
        </p>
      </motion.div>
    </section>
  );
}
