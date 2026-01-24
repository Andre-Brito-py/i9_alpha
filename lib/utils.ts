import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

export function validateCNPJ(cnpj: string) {
  const cleanCNPJ = cnpj.replace(/[^\d]+/g, "")

  if (cleanCNPJ.length !== 14) return false

  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false

  // Valida DVs
  let tamanho = cleanCNPJ.length - 2
  let numeros = cleanCNPJ.substring(0, tamanho)
  const digitos = cleanCNPJ.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0))) return false

  tamanho = tamanho + 1
  numeros = cleanCNPJ.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1))) return false

  return true
}

export function formatPhone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2")
    .slice(0, 15)
}

export function validatePhone(phone: string) {
  const cleanPhone = phone.replace(/\D/g, "")
  // Aceita 10 ou 11 dígitos (fixo ou celular)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

export function formatMatricula(value: string) {
  // Exemplo: T3274876 (Letra + Números)
  // Remove caracteres não alfanuméricos
  let clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  
  // Garante que o primeiro caractere seja letra
  if (clean.length > 0 && !/[A-Z]/.test(clean[0])) {
    return ""
  }
  
  // Garante que o restante sejam números (se houver mais de 1 char)
  if (clean.length > 1) {
    const letter = clean[0]
    const rest = clean.slice(1).replace(/\D/g, "")
    clean = letter + rest
  }

  return clean
}

export function validateMatricula(matricula: string) {
  // Deve começar com letra e ter pelo menos 1 número
  // Ex: T1234
  return /^[A-Z]\d+$/.test(matricula)
}
