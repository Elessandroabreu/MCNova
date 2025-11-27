// src/app/core/utils/formatters.util.ts
// Funcao formatarData estava faltando

export function formatarDataSimples(dataISO: string): string {
  if (!dataISO) return '';
  
  const data = new Date(dataISO + 'T00:00:00');
  
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}

export function dataParaISO(dataBR: string): string {
  if (!dataBR) return '';
  
  const partes = dataBR.split('/');
  if (partes.length !== 3) return '';
  
  const [dia, mes, ano] = partes;
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

// Adicionar esta funcao que esta sendo usada no cliente
export function formatarData(dataISO: string): string {
  return formatarDataSimples(dataISO);
}