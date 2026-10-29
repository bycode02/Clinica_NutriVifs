// Mensaje de error que se muestra bajo cada campo del formulario.
export const CampoError = ({ mensaje }: { mensaje?: string }) =>
  mensaje ? <small className="invalid-feedback d-block campo-error">{mensaje}</small> : null;
