/**
 * Datos que aparecen en las páginas legales. Los campos vacíos simplemente no
 * se muestran, para no publicar una política con marcadores a medio completar.
 */
export const legalConfig = {
  brandName: "Manish 3D",
  contactEmail: "manishagencia@gmail.com",
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
