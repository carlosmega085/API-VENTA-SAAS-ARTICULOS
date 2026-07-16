export const enviarWhatsApp = (telefono, mensaje) => {
  if (!telefono || !mensaje) {
    return null;
  }
  
  // Limpiar el teléfono (quitar espacios, +, etc.) si es necesario,
  // aquí lo dejamos básico asumiendo que el cliente pone un número válido.
  const numeroLimpio = telefono.replace(/\D/g, '');
  const mensajeCodificado = encodeURIComponent(mensaje);
  
  return `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
};
