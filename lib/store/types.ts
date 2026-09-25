import type { ProductLine } from "./lines";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  line: ProductLine;
  description: string | null;
  /** Nulo significa "a consultar": se cotiza por mensaje y no entra al carrito. */
  price: number | null;
  stock: number | null;
  images: string[];
};

export type CartItem = Omit<StoreProduct, "price"> & {
  price: number;
  quantity: number;
};

export type CheckoutItem = {
  productId: string;
  quantity: number;
};
