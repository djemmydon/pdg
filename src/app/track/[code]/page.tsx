import { notFound } from "next/navigation";
import {
  getChatMessages,
  getDeliveryByTrackingCode,
  getStatusHistory,
} from "@/lib/deliveries";
import { mintGuestToken } from "@/lib/auth/guestToken";
import { TrackingView } from "@/components/track/TrackingView";

export default async function TrackingResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const delivery = await getDeliveryByTrackingCode(code);

  if (!delivery) {
    notFound();
  }

  const [history, messages] = await Promise.all([
    getStatusHistory(delivery.id),
    getChatMessages(delivery.id),
  ]);

  const guestToken = mintGuestToken(delivery.id);

  return (
    <TrackingView
      delivery={delivery}
      initialHistory={history}
      initialMessages={messages}
      guestToken={guestToken}
    />
  );
}
