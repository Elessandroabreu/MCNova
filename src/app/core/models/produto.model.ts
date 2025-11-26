// src/app/core/models/produto.model.ts

export interface Produto {
  cdProduto: number;
  nmProduto: string;
  dsProduto?: string;
  categoria?: string;
  vlCusto: number;
  vlVenda: number;
  qtdEstoque: number;
  qtdMinimo: number;
  ativo: boolean;
  dataCadastro: Date;
}

export interface ProdutoRequest {
  nmProduto: string;
  dsProduto?: string | null;
  categoria?: string | null;
  vlCusto: number;
  vlVenda: number;
  qtdEstoque: number;
  qtdMinimo: number;
}