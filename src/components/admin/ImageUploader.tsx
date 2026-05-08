import { useState, useRef, useCallback } from "react";
import { Upload, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadProductImage } from "@/lib/upload";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  maxSize?: number;
}

export function ImageUploader({
  images,
  onChange,
  maxFiles = 10,
  maxSize = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const remaining = maxFiles - images.length;
      const toUpload = Array.from(files).slice(0, remaining);

      setUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        if (file.size > maxSize * 1024 * 1024) continue;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) continue;

        try {
          const result = await uploadProductImage(file);
          if (result.url) uploadedUrls.push(result.url);
        } catch (err) {
          console.error("Upload failed:", file.name, err);
        }
        setProgress(((i + 1) / toUpload.length) * 100);
      }

      onChange([...images, ...uploadedUrls]);
      setUploading(false);
      setProgress(0);
    },
    [images, maxFiles, onChange, maxSize],
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const setPrimary = (index: number) => {
    const newImages = [...images];
    const [img] = newImages.splice(index, 1);
    newImages.unshift(img);
    onChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dragRef.current?.classList.add("border-gold");
  };

  const handleDragLeave = () => {
    dragRef.current?.classList.remove("border-gold");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragRef.current?.classList.remove("border-gold");
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        ref={dragRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 p-8 transition-colors",
          "hover:border-gold/40 hover:bg-gold/5",
          uploading && "pointer-events-none opacity-50",
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          {uploading ? "Upload en cours..." : "Déposez vos images ici"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG ou WEBP • Max {maxSize}MB • {maxFiles - images.length} restantes
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Upload...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1 bg-white/5 [&>div]:bg-gold" />
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={url}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border border-white/5",
                index === 0 && "ring-1 ring-gold",
              )}
            >
              <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrimary(index);
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    index === 0
                      ? "bg-gold text-gold-foreground"
                      : "bg-white/20 text-white hover:bg-gold",
                  )}
                  title="Image principale"
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-500"
                  title="Supprimer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {index === 0 && (
                <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-semibold rounded bg-gold text-gold-foreground">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
