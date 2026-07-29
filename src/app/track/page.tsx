import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TrackingCodeForm } from "@/components/TrackingCodeForm";

export default function TrackEntryPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center border-b border-border px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-16 text-center sm:py-24">
        <h1 className="font-display max-w-xl text-3xl font-extrabold text-foreground sm:text-4xl">
          Track your delivery
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Enter the delivery code from your confirmation email below.
        </p>
        <div className="mt-8 w-full">
          <TrackingCodeForm />
        </div>
      </main>
    </div>
  );
}
