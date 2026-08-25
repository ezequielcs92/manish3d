import type { ProductLine } from "./lines";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  line: ProductLine;
  description: string | null;
  price: number;
  stock: number | null;
  images: string[];
};

export type CartItem = StoreProduct & {
  quantity: number;
};

export type CheckoutItem = {
  productId: string;
  quantity: number;
};
