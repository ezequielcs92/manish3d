import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/productos" className="text-sm font-bold text-[#8b8490] hover:text-[#6f2fa3]">
          ← Productos
        </Link>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#10091b]">Nuevo producto</h1>
        <p className="mt-1 text-sm text-[#6b6472]">Se suma al catálogo de Manish 3D apenas lo guardás.</p>
      </header>
      <ProductForm />
    </div>
  );
}
