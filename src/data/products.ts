import desk1 from "@/assets/product-desk-1.jpg";
import desk2 from "@/assets/product-desk-2.jpg";
import shelf1 from "@/assets/product-shelf-1.jpg";
import cabinet from "@/assets/product-cabinet.jpg";

export type Category = "Bureaux" | "Dressings" | "Cuisines" | "Aménagements";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number;
  material: "Bois massif" | "Cuir italien" | "Bois & laiton" | "Mélamine premium";
  color: string;
  size: "S" | "M" | "L";
  image: string;
  tagline: string;
  description: string;
  features: string[];
};

export const categoriesMeta: { name: Category; tagline: string; image: string }[] = [
  { name: "Bureaux", tagline: "Espaces de décision", image: desk1 },
  { name: "Dressings", tagline: "Sur mesure, jusqu'au cintre", image: cabinet },
  { name: "Cuisines", tagline: "Au cœur de la maison", image: shelf1 },
  { name: "Aménagements", tagline: "Intérieurs signés", image: desk2 },
];
