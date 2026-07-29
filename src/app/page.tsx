import Image from "next/image";
import { Package, MessageCircle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { TrackingCodeForm } from "@/components/TrackingCodeForm";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center border-b border-border px-6 py-4">
        <Logo />
      </header>

      <main className="flex-1 bg-brand-50/50">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-foreground sm:text-6xl">
              Track your delivery in real time
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
              Enter the delivery code we sent you to see live status updates, and chat instantly
              with support if anything needs attention.
            </p>

            <div className="mt-8 max-w-md">
              <TrackingCodeForm />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/map-card.png"
              alt="Delivery route map"
              width={750}
              height={367}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </main>

      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-16 sm:grid-cols-3">
        <FeatureCard
          icon={<Package className="h-5 w-5" />}
          title="Live status"
          description="Follow every step, from order confirmed to delivered."
        />
        <FeatureCard
          icon={<MessageCircle className="h-5 w-5" />}
          title="Instant support"
          description="Chat with our team the moment your delivery needs attention."
        />
        <FeatureCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Secure by design"
          description="Only your unique code unlocks your delivery's details."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 text-left">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-700">
        {icon}
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
