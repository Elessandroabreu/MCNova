/**
 * Formata um valor para moeda brasileira
 * @param valor Valor numérico
 * @returns Valor formatado (R$ 0.000,00)
 */
export function formatarMoeda(valor: number): string {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata uma data ISO para formato brasileiro
 * @param dataISO Data em formato ISO (2025-01-01T10:00:00)
 * @returns Data formatada (01/01/2025 10:00)
 */
export function formatarData(dataISO: string): string {
  if (!dataISO) return '';
  
  const data = new Date(dataISO);
  
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata uma data ISO para formato brasileiro com hora
 * @param dataISO Data em formato ISO (2025-01-01T10:00:00)
 * @returns Data formatada (01/01/2025 10:00)
 */
export function formatarDataHora(dataISO: string): string {
  if (!dataISO) return '';
  
  const data = new Date(dataISO);
  
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

/**
 * Converte data brasileira para ISO
 * @param dataBR Data em formato brasileiro (dd/MM/yyyy)
 * @returns Data em formato ISO (yyyy-MM-dd)
 */
export function dataParaISO(dataBR: string): string {
  if (!dataBR) return '';
  
  const partes = dataBR.split('/');
  if (partes.length !== 3) return '';
  
  const [dia, mes, ano] = partes;
  return `${ano}-${mes}-${dia}`;
}

/**
 * Converte data e hora para formato ISO completo
 * @param data Data (dd/MM/yyyy)
 * @param hora Hora (HH:mm)
 * @returns Data e hora em formato ISO (yyyy-MM-ddTHH:mm:ss)
 */
export function dataHoraParaISO(data: string, hora: string): string {
  if (!data || !hora) return '';
  
  const dataISO = dataParaISO(data);
  return `${dataISO}T${hora}:00`;
}
