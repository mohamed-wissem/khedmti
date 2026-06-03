import Link from "next/link";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <Swords className="h-10 w-10 text-ember" strokeWidth={1.5} />
      <h1 className="mt-4 font-display text-5xl font-bold tracking-wide text-moon">404</h1>
      <p className="mt-2 text-smoke">This path leads into the dark. The page you sought isn&apos;t here.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/"><Button>Return home</Button></Link>
        <Link href="/shop"><Button variant="secondary">Browse the armory</Button></Link>
      </div>
    </div>
  );
}
