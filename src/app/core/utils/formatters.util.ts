/**
 * Formata uma data ISO para formato brasileiro (APENAS DATA)
 * @param dataISO Data em formato ISO (2025-01-20)
 * @returns Data formatada (20/01/2025)
 */
export function formatarDataSimples(dataISO: string): string {
  if (!dataISO) return '';
  
  const data = new Date(dataISO + 'T00:00:00'); // ✅ Adiciona hora para evitar timezone
  
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}

/**
 * Converte data brasileira para ISO (APENAS DATA)
 * @param dataBR Data em formato brasileiro (dd/MM/yyyy)
 * @returns Data em formato ISO (yyyy-MM-dd)
 */
export function dataParaISO(dataBR: string): string {
  if (!dataBR) return '';
  
  const partes = dataBR.split('/');
  if (partes.length !== 3) return '';
  
  const [dia, mes, ano] = partes;
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}