import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-12 p-8 bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Recipe Manager</h1>
        <p className="text-slate-300 max-w-xl">
          A simple recipe app built with Next.js App Router + TypeScript + shadcn/ui
        </p>
        <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
          <Link href="/recipes">Let's go</Link>
        </Button>
      </section>
    </main>
  );
} 