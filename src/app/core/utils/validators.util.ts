/**
 * Valida um CPF
 * @param cpf CPF com ou sem formatação
 * @returns true se válido, false se inválido
 */
export function validarCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  // Remove formatação
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Valida primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cpf.charAt(9))) return false;
  
  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (digito !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

/**
 * Formata um CPF
 * @param cpf CPF sem formatação
 * @returns CPF formatado (000.000.000-00)
 */
export function formatarCPF(cpf: string): string {
  if (!cpf) return '';
  
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length <= 11) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

/**
 * Formata um telefone
 * @param telefone Telefone sem formatação
 * @returns Telefone formatado ((00) 00000-0000 ou (00) 0000-0000)
 */
export function formatarTelefone(telefone: string): string {
  if (!telefone) return '';
  
  telefone = telefone.replace(/[^\d]/g, '');
  
  if (telefone.length === 11) {
    // Celular: (00) 00000-0000
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefone.length === 10) {
    // Fixo: (00) 0000-0000
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}

/**
 * Remove formatação de CPF ou telefone
 * @param valor Valor formatado
 * @returns Valor sem formatação (apenas números)
 */
export function removerFormatacao(valor: string): string {
  return valor ? valor.replace(/[^\d]/g, '') : '';
}
