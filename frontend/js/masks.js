// Máscara de CPF: 000.000.000-00

export const maskCPF = (value) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
};

// Mascara de Celular
export const maskCelular = (value) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

export const maskCEP = (value) => {
  return value
    .replace(/\\D/g, "")
    .replace(/^(\\d{5})(\\d)/, "$1-$2")
    .slice(0, 9);
};
