/**
 * Número de WhatsApp de ventas, en formato internacional y solo dígitos
 * (ej. 5491155555555). Es el destino del botón "Consultar" de los productos
 * sin precio publicado.
 */
export const whatsappNumber = "";

/** Link a WhatsApp con el mensaje ya escrito, o null si no hay número cargado. */
export function consultHref(productName: string) {
  if (!whatsappNumber) return null;

  const texto = `Hola! Quiero consultar por "${productName}" que vi en la tienda de Manish 3D.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(texto)}`;
}
