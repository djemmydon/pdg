import Link from "next/link";
import { PackageX } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TrackingNotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center border-b border-border px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <PackageX className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Delivery not found</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          We could not find a delivery with that code. Please double-check it and try again.
        </p>
        <Link href="/track" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
          Try again
        </Link>
      </main>
    </div>
  );
}
