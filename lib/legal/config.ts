/**
 * Datos que aparecen en las páginas legales. Los campos vacíos simplemente no
 * se muestran, para no publicar una política con marcadores a medio completar.
 */
export const legalConfig = {
  brandName: "Manish 3D",
  /**
   * Casilla propia de Manish 3D para ejercer derechos sobre datos personales.
   * Mientras esté vacía, las páginas legales remiten a los canales de venta en
   * vez de publicar una dirección que no le pertenece a la marca.
   */
  contactEmail: "",
  /** Razón social inscripta, si difiere del nombre comercial. */
  legalName: "",
  /** CUIT del responsable de la base de datos. */
  taxId: "",
  /** Domicilio legal para notificaciones. */
  address: "",
  lastUpdated: "24 de agosto de 2026",
};

export const cookieNames = {
  session: "sb-<proyecto>-auth-token",
  cart: "manish3d.cart.v1",
};
