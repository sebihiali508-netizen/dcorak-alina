import { createClient } from "@/lib/supabase/client";
import { uploadFileBase64, saveProductImage } from "@/lib/api/products";

interface UploadResult {
  url: string;
  path: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(
  file: File,
  productId?: string,
  isPrimary?: boolean,
  sortOrder?: number,
): Promise<UploadResult> {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  // Try client-side upload first (requires auth session + RLS policies)
  const supabase = createClient();
  const { data: session } = await supabase.auth.getSession();

  // Only attempt client-side if we have a session, otherwise fall back to server
  if (session?.session || (session as any)?.user) {
    const filePath = `products/${fileName}`;
    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(data.path);

      if (productId) {
        await saveProductImage({
          data: {
            productId,
            url: publicUrl,
            altText: file.name,
            isPrimary: !!isPrimary,
            sortOrder: sortOrder ?? 0,
            fileName: file.name,
            fileSize: file.size,
          },
        } as any);
      }

      return { url: publicUrl, path: data.path };
    }

    if (
      !error.message.includes("policy") &&
      !error.message.includes("row-level security") &&
      !error.message.includes("JWT")
    ) {
      if (error.message.includes("bucket")) {
        throw new Error("Le bucket 'product-images' n'existe pas. Contactez l'administrateur.");
      }
      if (error.message.includes("duplicate")) {
        throw new Error("Un fichier avec le même nom existe déjà.");
      }
      throw new Error(`Erreur de téléchargement: ${error.message}`);
    }
  }

  // Fallback: server-side upload with service role key (bypasses RLS)
  try {
    const base64 = await fileToBase64(file);
    const result = await uploadFileBase64({
      data: { base64, fileName, contentType: file.type },
    } as any);

    if (productId) {
      await saveProductImage({
        data: {
          productId,
          url: result.url,
          altText: file.name,
          isPrimary: !!isPrimary,
          sortOrder: sortOrder ?? 0,
          fileName: file.name,
          fileSize: file.size,
        },
      } as any);
    }

    return result;
  } catch (serverErr) {
    const msg = serverErr instanceof Error ? serverErr.message : "Erreur inconnue";
    if (msg.includes("bucket") || msg.includes("Bucket") || msg.includes("not found")) {
      throw new Error(
        "Le bucket 'product-images' n'existe pas. Créez-le via le dashboard Supabase (Storage → Créer un bucket) ou exécutez le script SQL fourni.",
      );
    }
    throw new Error(`Erreur de téléchargement: ${msg}`);
  }
}
