// frontend/js/validador.js

import { parsePhoneNumber, AsYouType } from "libphonenumber-js/max";

// =============================================================
// HELPERS / MÁSCARAS
// =============================================================
export const apenasDigitos = (value = "") => value.replace(/\D/g, "");

export const maskCPF = (value) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);

export const maskCEP = (value) =>
  value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);

export const maskCelular = (value) => {
  let digits = apenasDigitos(value);
  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);
  if (!digits) return "";
  return new AsYouType("BR").input(digits);
};

// =============================================================
// VALIDAÇÃO DE CPF
// =============================================================
const validarCPFLocal = (cpfLimpo) => {
  if (!cpfLimpo || cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpfLimpo[i], 10) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo[9], 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpfLimpo[i], 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpfLimpo[10], 10);
};

export const validarCPF = (cpf) => {
  const cpfLimpo = apenasDigitos(cpf);

  if (cpfLimpo.length === 0) {
    return { valid: false, formatted: "", error: "Informe o CPF." };
  }
  if (cpfLimpo.length !== 11) {
    return {
      valid: false,
      formatted: maskCPF(cpfLimpo),
      error: "CPF deve conter 11 dígitos.",
    };
  }
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return {
      valid: false,
      formatted: maskCPF(cpfLimpo),
      error: "CPF inválido.",
    };
  }

  const valido = validarCPFLocal(cpfLimpo);
  return {
    valid: valido,
    formatted: maskCPF(cpfLimpo),
    error: valido ? undefined : "CPF inválido.",
  };
};

// =============================================================
// VALIDAÇÃO DE CELULAR
// =============================================================
export const validarCelular = (valor) => {
  let digits = apenasDigitos(valor);
  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  if (digits.length === 0) {
    return { valid: false, formatted: "", error: "Informe o celular." };
  }

  if (digits.length !== 11) {
    return {
      valid: false,
      formatted: maskCelular(digits),
      error: "Celular deve ter 11 dígitos (DDD + 9 dígitos).",
    };
  }

  try {
    const phone = parsePhoneNumber(`+55${digits}`, "BR");

    if (!phone || !phone.isValid()) {
      return {
        valid: false,
        formatted: maskCelular(digits),
        error: "Celular inválido.",
      };
    }

    const tipo = phone.getType();
    if (tipo !== "MOBILE") {
      return {
        valid: false,
        formatted: maskCelular(digits),
        error: "O número informado não é um celular.",
      };
    }

    return {
      valid: true,
      formatted: phone.formatNational(),
      e164: phone.number,
    };
  } catch (err) {
    return {
      valid: false,
      formatted: maskCelular(digits),
      error: "Número inválido.",
    };
  }
};

// =============================================================
// BUSCA CEP — ViaCEP
// =============================================================
export const buscarCEP = async (cep) => {
  const cepLimpo = apenasDigitos(cep);
  if (cepLimpo.length !== 8) throw new Error("CEP deve conter 8 dígitos.");

  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  if (!response.ok) throw new Error("CEP inválido ou serviço indisponível.");

  const data = await response.json();
  if (data.erro) throw new Error("CEP não encontrado.");
  return data;
};

// =============================================================
// VERIFICADOR DE SENHA FORTE
// =============================================================
export const verificarForcaSenha = (senha = "") => {
  const requisitos = {
    minimo8: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[!@#$%^&*(),.?":{}|<>_\-+=;'/\\[\]~`]/.test(senha),
  };
  const atendidos = Object.values(requisitos).filter(Boolean).length;

  const mapa = [
    { min: 5, forca: "forte", label: "Forte", cor: "#22c55e" },
    { min: 4, forca: "boa", label: "Boa", cor: "#84cc16" },
    { min: 3, forca: "media", label: "Média", cor: "#eab308" },
    { min: 2, forca: "fraca", label: "Fraca", cor: "#f97316" },
    { min: 0, forca: "muito-fraca", label: "Muito Fraca", cor: "#ef4444" },
  ];
  const info = mapa.find((m) => atendidos >= m.min);

  return {
    valida: atendidos === 5,
    forca: info.forca,
    label: info.label,
    cor: info.cor,
    requisitos,
    percentual: (atendidos / 5) * 100,
  };
};

// =============================================================
// MONTAR ENDEREÇO ÚNICO
// =============================================================
export const montarEndereco = (e = {}) => {
  const partes = [];
  if (e.logradouro) {
    let linha = e.logradouro;
    if (e.numero) linha += `, ${e.numero}`;
    if (e.complemento) linha += ` - ${e.complemento}`;
    partes.push(linha);
  }
  if (e.bairro) partes.push(e.bairro);
  if (e.cidade || e.estado) {
    partes.push(`${e.cidade || ""}${e.estado ? "/" + e.estado : ""}`);
  }
  if (e.cep) partes.push(`CEP ${e.cep}`);
  return partes.join(" - ");
};

// =============================================================
// PARSE REVERSO — desmonta a string de endereço em campos
// =============================================================
export const parseEndereco = (endereco = "") => {
  const vazio = {
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  };
  if (!endereco || typeof endereco !== "string") return vazio;

  let resto = endereco.trim();
  let cep = "";
  const cepMatch = resto.match(/-\s*CEP\s*([\d-]{8,9})\s*$/i);
  if (cepMatch) {
    cep = cepMatch[1];
    resto = resto.slice(0, cepMatch.index).trim();
    resto = resto.replace(/\s*-\s*$/, "").trim();
  }

  let cidade = "";
  let estado = "";
  const cidadeUfMatch = resto.match(/([A-Za-zÀ-ú\s.]+)\/([A-Z]{2})\s*$/);
  if (cidadeUfMatch) {
    cidade = cidadeUfMatch[1].trim();
    estado = cidadeUfMatch[2];
    resto = resto.slice(0, cidadeUfMatch.index).trim();
    resto = resto.replace(/\s*-\s*$/, "").trim();
  }

  let bairro = "";
  let logradouroNumCompl = resto;
  const partes = resto.split(" - ");
  if (partes.length >= 2) {
    bairro = partes[partes.length - 1].trim();
    logradouroNumCompl = partes.slice(0, -1).join(" - ").trim();
  }

  let logradouro = "";
  let numero = "";
  let complemento = "";
  const compMatch = logradouroNumCompl.match(
    /^(.+?),\s*([^-]+?)\s*(?:-\s*(.+))?$/,
  );
  if (compMatch) {
    logradouro = compMatch[1].trim();
    numero = compMatch[2].trim();
    complemento = (compMatch[3] || "").trim();
  } else {
    logradouro = logradouroNumCompl;
  }

  return { cep, logradouro, numero, complemento, bairro, cidade, estado };
};

// =============================================================
// 🆕 VALIDAÇÃO DE MAIORIDADE (18+)
// =============================================================
export const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento + "T00:00:00");
  if (isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
};

/**
 * Valida se o usuário tem a idade mínima (padrão: 18 anos).
 * @returns {{ valid: boolean, idade?: number, error?: string }}
 */
export const validarMaioridade = (dataNascimento, idadeMinima = 18) => {
  if (!dataNascimento) {
    return { valid: false, error: "Data de nascimento é obrigatória." };
  }
  const nasc = new Date(dataNascimento + "T00:00:00");
  if (isNaN(nasc.getTime())) {
    return { valid: false, error: "Data de nascimento inválida." };
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (nasc > hoje) {
    return {
      valid: false,
      error: "Data de nascimento não pode ser no futuro.",
    };
  }
  const idade = calcularIdade(dataNascimento);
  if (idade < idadeMinima) {
    return {
      valid: false,
      idade,
      error: `É necessário ter ${idadeMinima} anos ou mais. Idade informada: ${idade} anos.`,
    };
  }
  if (idade > 120) {
    return { valid: false, error: "Data de nascimento inválida." };
  }
  return { valid: true, idade };
};

/**
 * Retorna a data máxima (YYYY-MM-DD) que um usuário
 * pode informar para ter N anos.
 */
export const dataMaximaNascimento = (idadeMinima = 18) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - idadeMinima);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

// =============================================================
// 🆕 VALIDAÇÃO DE PERÍODO DE CAMPANHA
// =============================================================
/**
 * Valida se data_fim >= data_inicio.
 * @returns {{ valid: boolean, error?: string }}
 */
export const validarPeriodoCampanha = (dataInicio, dataFim) => {
  if (!dataInicio) {
    return { valid: false, error: "A data de início é obrigatória." };
  }
  if (!dataFim) {
    return { valid: true };
  }
  const ini = new Date(dataInicio + "T00:00:00");
  const fim = new Date(dataFim + "T00:00:00");
  if (isNaN(ini.getTime()) || isNaN(fim.getTime())) {
    return { valid: false, error: "Datas inválidas." };
  }
  if (fim < ini) {
    return {
      valid: false,
      error: "A data de fim não pode ser anterior à data de início.",
    };
  }
  return { valid: true };
};
