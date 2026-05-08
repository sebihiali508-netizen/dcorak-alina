import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/213555000000"
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="pulse-glow fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold text-gold-foreground shadow-elegant transition hover:scale-105 md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
