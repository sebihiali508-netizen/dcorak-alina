import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save, Upload } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { WILAYAS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    site_name: "Decorak Alina",
    contact_email: "",
    contact_phone: "",
    whatsapp_number: "",
    delivery_wilayas: [] as string[],
  });

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name || "Decorak Alina",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        whatsapp_number: settings.whatsapp_number || "",
        delivery_wilayas: settings.delivery_wilayas || [],
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form);
      toast.success("Paramètres enregistrés");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const toggleWilaya = (wilaya: string) => {
    setForm((prev) => ({
      ...prev,
      delivery_wilayas: prev.delivery_wilayas.includes(wilaya)
        ? prev.delivery_wilayas.filter((w) => w !== wilaya)
        : [...prev.delivery_wilayas, wilaya],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">Paramètres</h2>
          <p className="text-sm text-muted-foreground mt-1">Configuration du site</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-gold text-gold-foreground hover:bg-gold/90"
        >
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          {/* Site info */}
          <div className="rounded-xl border border-white/5 bg-surface p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Informations du site</h3>
            <div>
              <Label htmlFor="site_name">Nom du site</Label>
              <Input
                id="site_name"
                value={form.site_name}
                onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                className="bg-surface-2 border-white/5"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email de contact</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="contact@decorak-alina.dz"
                className="bg-surface-2 border-white/5"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Téléphone</Label>
              <Input
                id="contact_phone"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="+213 555 12 34 56"
                className="bg-surface-2 border-white/5"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="+213 555 12 34 56"
                className="bg-surface-2 border-white/5"
              />
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* Delivery wilayas */}
          <div className="rounded-xl border border-white/5 bg-surface p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Wilayas de livraison</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sélectionnez les wilayas desservies
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
              {WILAYAS.map((wilaya) => (
                <button
                  key={wilaya}
                  type="button"
                  onClick={() => toggleWilaya(wilaya)}
                  className={`text-xs px-3 py-2 rounded-lg border text-left transition-all ${
                    form.delivery_wilayas.includes(wilaya)
                      ? "bg-gold/10 text-gold border-gold/30"
                      : "bg-surface-2 text-muted-foreground border-white/5 hover:border-white/20"
                  }`}
                >
                  {wilaya}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
