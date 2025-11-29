import { Component, inject, OnInit, AfterViewInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VendaService } from '../../../core/services/venda.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { AuthService } from '../../../core/services/auth.service';
import { Venda, VendaRequest, ItemVendaRequest, Cliente, Produto, FormaPagamento } from '../../../core/models';

declare var bootstrap: any;

interface ItemVendaLocal {
  cdProduto: number;
  produto: Produto;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

@Component({
  selector: 'app-vendas-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendas-lista.component.html',
  styleUrls: ['./vendas-lista.component.scss']
})
export class VendasListaComponent implements OnInit, AfterViewInit {
  private vendaService = inject(VendaService);
  private clienteService = inject(ClienteService);
  private produtoService = inject(ProdutoService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

 
  @ViewChild('vendaModal', { static: false }) vendaModalElement!: ElementRef;
  @ViewChild('detalhesModal', { static: false }) detalhesModalElement!: ElementRef;

  private vendaModalInstance: any;
  private detalhesModalInstance: any;

  vendas = signal<Venda[]>([]);
  vendasFiltradas = signal<Venda[]>([]);
  clientes = signal<Cliente[]>([]);
  produtos = signal<Produto[]>([]);

  isLoading = signal(false);
  isSubmitting = signal(false);

  vendaForm!: FormGroup;
  itensVenda = signal<ItemVendaLocal[]>([]);
  produtoSelecionado = signal<number | null>(null);
  quantidadeProduto = signal<number>(1);

  searchTerm = signal('');

  formasPagamento = [
    { value: FormaPagamento.DINHEIRO, label: 'Dinheiro' },
    { value: FormaPagamento.CARTAO_CREDITO, label: 'Cartão de Crédito' },
    { value: FormaPagamento.CARTAO_DEBITO, label: 'Cartão de Débito' },
    { value: FormaPagamento.PIX, label: 'PIX' }
  ];

  vendaSelecionada = signal<Venda | null>(null);

  ngOnInit(): void {
    this.inicializarForm();
    this.carregarDados();
  }

  ngAfterViewInit(): void {
    
    try {
      if (this.vendaModalElement?.nativeElement) {
        this.vendaModalInstance = new bootstrap.Modal(this.vendaModalElement.nativeElement);
      }
      if (this.detalhesModalElement?.nativeElement) {
        this.detalhesModalInstance = new bootstrap.Modal(this.detalhesModalElement.nativeElement);
      }
    } catch (err) {
      // caso bootstrap não esteja disponível no ambiente de testes, apenas logamos
      // Em produção o bootstrap deve estar carregado (bundle ou CDN).
      console.warn('Bootstrap modal init falhou (talvez não esteja carregado):', err);
    }
  }

  inicializarForm(): void {
    this.vendaForm = this.fb.group({
      cdCliente: [''],
      formaPagamento: ['', [Validators.required]]
    });
  }

  carregarDados(): void {
    this.isLoading.set(true);

    Promise.all([
      this.carregarVendas(),
      this.carregarClientes(),
      this.carregarProdutos()
    ]).finally(() => {
      this.isLoading.set(false);
    });
  }

  carregarVendas(): Promise<void> {
    return new Promise((resolve) => {
      this.vendaService.listarTodas().subscribe({
        next: (vendas) => {
          this.vendas.set(vendas);
          this.aplicarFiltro();
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar vendas:', error);
          resolve();
        }
      });
    });
  }

  carregarClientes(): Promise<void> {
    return new Promise((resolve) => {
      this.clienteService.listarAtivos().subscribe({
        next: (clientes) => {
          this.clientes.set(clientes);
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  carregarProdutos(): Promise<void> {
    return new Promise((resolve) => {
      this.produtoService.listarAtivos().subscribe({
        next: (produtos: Produto[]) => {
          this.produtos.set(produtos);
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  aplicarFiltro(): void {
    const termo = this.searchTerm().toLowerCase();

    if (!termo) {
      this.vendasFiltradas.set(this.vendas());
      return;
    }

    const filtradas = this.vendas().filter(venda => {
      const nomeCliente = venda.clienteModel?.nmCliente?.toLowerCase() || '';
      const nomeAtendente = venda.atendente?.nmUsuario?.toLowerCase() || '';

      return nomeCliente.includes(termo) || nomeAtendente.includes(termo);
    });

    this.vendasFiltradas.set(filtradas);
  }

  abrirModalNovo(): void {
    this.vendaForm.reset();
    this.itensVenda.set([]);
    this.produtoSelecionado.set(null);
    this.quantidadeProduto.set(1);
    this.vendaModalInstance?.show();
  }

  fecharModal(): void {
    this.vendaModalInstance?.hide();
    this.vendaForm.reset();
    this.itensVenda.set([]);
  }

  adicionarProduto(): void {
    const cdProduto = this.produtoSelecionado();
    const quantidade = this.quantidadeProduto();

    if (!cdProduto || quantidade <= 0) {
      alert('Selecione um produto e quantidade válida');
      return;
    }

    const produto = this.produtos().find(p => p.cdProduto === cdProduto);

    if (!produto) {
      alert('Produto não encontrado');
      return;
    }

    if (produto.qtdEstoque < quantidade) {
      alert(`Estoque insuficiente! Disponível: ${produto.qtdEstoque}`);
      return;
    }

    const itemExistente = this.itensVenda().find(i => i.cdProduto === cdProduto);

    if (itemExistente) {
      const novosItens = this.itensVenda().map(item => {
        if (item.cdProduto === cdProduto) {
          const novaQuantidade = item.quantidade + quantidade;
          if (produto.qtdEstoque < novaQuantidade) {
            alert(`Estoque insuficiente! Disponível: ${produto.qtdEstoque}`);
            return item;
          }
          return {
            ...item,
            quantidade: novaQuantidade,
            vlTotal: novaQuantidade * item.vlUnitario
          };
        }
        return item;
      });
      this.itensVenda.set(novosItens);
    } else {
      const novoItem: ItemVendaLocal = {
        cdProduto: produto.cdProduto,
        produto: produto,
        quantidade: quantidade,
        vlUnitario: produto.vlProduto,
        vlTotal: quantidade * produto.vlProduto
      };
      this.itensVenda.set([...this.itensVenda(), novoItem]);
    }

   
    this.produtoSelecionado.set(null);
    this.quantidadeProduto.set(1);
  }

  removerProduto(cdProduto: number): void {
    this.itensVenda.set(this.itensVenda().filter(i => i.cdProduto !== cdProduto));
  }

  calcularTotal(): number {
    return this.itensVenda().reduce((total, item) => total + item.vlTotal, 0);
  }

  
  calcularTotalVendas(): number {
    try {
      return this.vendasFiltradas().reduce((acc, v) => acc + Number(v.vlTotal ?? 0), 0);
    } catch (err) {
      console.error('Erro ao calcular total de vendas:', err);
      return 0;
    }
  }

  salvar(): void {
    if (this.vendaForm.invalid) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (this.itensVenda().length === 0) {
      alert('Adicione pelo menos um produto à venda');
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.vendaForm.value;
    const usuarioLogado = this.authService.getCurrentUser();

    const itens: ItemVendaRequest[] = this.itensVenda().map(item => ({
      cdProduto: item.cdProduto,
      quantidade: item.quantidade
    }));

    const dados: VendaRequest = {
      cdCliente: formValue.cdCliente || undefined,
      cdAtendente: usuarioLogado!.cdUsuario,
      formaPagamento: formValue.formaPagamento,
      itens: itens
    };

    this.vendaService.criar(dados).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.fecharModal();

        Promise.all([
          this.carregarVendas(),
          this.carregarProdutos()
        ]).then(() => {
          alert('Venda realizada com sucesso!');
        });
      },
      error: (error) => {
        console.error('Erro ao salvar venda:', error);
        this.isSubmitting.set(false);
        alert(error?.message || 'Erro ao salvar venda');
      }
    });
  }

  formatarMoeda(valor: number): string {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  getFormaPagamentoLabel(forma: FormaPagamento): string {
    const formaObj = this.formasPagamento.find(f => f.value === forma);
    return formaObj?.label || (forma as any);
  }

  getClienteNome(cdCliente?: number): string {
    if (!cdCliente) return 'Sem cliente';
    const cliente = this.clientes().find(c => c.cdCliente === cdCliente);
    return cliente?.nmCliente || 'Cliente não encontrado';
  }

  formatarData(dataISO: string | any): string {
    if (!dataISO) return '-';
    try {
      let data: Date;

      if (Array.isArray(dataISO)) {
        const [ano, mes, dia, hora = 0, min = 0, seg = 0] = dataISO;
        data = new Date(ano, mes - 1, dia, hora, min, seg);
      } else if (typeof dataISO === 'string' && dataISO.includes('T')) {
        data = new Date(dataISO);
      } else if (typeof dataISO === 'string' && dataISO.includes(' ')) {
        const [datePart, timePart] = dataISO.split(' ');
        data = new Date(`${datePart}T${timePart}`);
      } else {
        data = new Date(dataISO + 'T00:00:00');
      }

      if (isNaN(data.getTime())) {
        console.error('Data inválida:', dataISO);
        return '-';
      }

      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const hora = String(data.getHours()).padStart(2, '0');
      const min = String(data.getMinutes()).padStart(2, '0');

      return `${dia}/${mes}/${ano} ${hora}:${min}`;
    } catch (error) {
      console.error('Erro ao formatar data:', dataISO, error);
      return '-';
    }
  }

  contarItens(venda: Venda): number {
    if (venda.itens && Array.isArray(venda.itens)) {
      return venda.itens.length;
    }
    return 0;
  }

  abrirDetalhes(venda: Venda): void {
    this.vendaSelecionada.set(venda);
    this.detalhesModalInstance?.show();
  }

  fecharDetalhes(): void {
    this.detalhesModalInstance?.hide();
    this.vendaSelecionada.set(null);
  }

  calcularTotalItens(venda: Venda): number {
    if (!venda.itens || !Array.isArray(venda.itens)) return 0;
    return venda.itens.reduce((total: number, item: any) => total + (item.vlTotal || 0), 0);
  }

  getNomeProduto(cdProduto: number): string {
    const produto = this.produtos().find(p => p.cdProduto === cdProduto);
    return produto?.nmProduto || 'Produto não encontrado';
  }

  imprimirComprovante(venda: Venda): void {
    if (!venda) return;

    const conteudo = `

Venda Nº: ${venda.cdVenda}
Data: ${this.formatarData(venda.dataVenda)}


${venda.clienteModel?.nmCliente || 'Venda Avulsa'}
${venda.clienteModel?.cpf ? 'CPF: ' + venda.clienteModel.cpf : ''}


${(venda.itens?.map((item: any) => `
${this.getNomeProduto(item.cdProduto)}
Qtd: ${item.quantidade} x ${this.formatarMoeda(item.vlUnitario || 0)}
Subtotal: ${this.formatarMoeda(item.vlTotal || 0)}
`).join('\n')) || 'Nenhum item'}


Total: ${this.formatarMoeda(venda.vlTotal || 0)}
${(venda as any).desconto ? 'Desconto: ' + this.formatarMoeda((venda as any).desconto) : ''}

Forma de Pagamento: ${this.getFormaPagamentoLabel(venda.formaPagamento)}

${venda.atendente?.nmUsuario || '-'}

`;

    const janelaImpressao = window.open('', '_blank');
    if (janelaImpressao) {
      janelaImpressao.document.write('<html><head><title>Comprovante de Venda</title>');
      janelaImpressao.document.write('<style>');
      janelaImpressao.document.write('body { font-family: monospace; white-space: pre-wrap; padding: 20px; }');
      janelaImpressao.document.write('</style></head><body>');
      janelaImpressao.document.write(conteudo);
      janelaImpressao.document.write('</body></html>');
      janelaImpressao.document.close();
      janelaImpressao.print();
    }
  }


  exportarRelatorio(): void {
    const vendas = this.vendasFiltradas();

    if (vendas.length === 0) {
      alert('Nenhuma venda para exportar');
      return;
    }

    let csv = 'Data,Cliente,CPF,Atendente,Forma Pagamento,Total,Itens\n';

    vendas.forEach(venda => {
      const linha = [
        this.formatarData(venda.dataVenda),
        venda.clienteModel?.nmCliente || 'Venda Avulsa',
        venda.clienteModel?.cpf || '-',
        venda.atendente?.nmUsuario || '-',
        this.getFormaPagamentoLabel(venda.formaPagamento),
        (venda.vlTotal ?? 0).toString(),
        this.contarItens(venda).toString()
      ].join(',');

      csv += linha + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  filtrarPorPeriodo(dataInicio: string, dataFim: string): void {
    this.isLoading.set(true);

    this.vendaService.listarPorPeriodo(dataInicio, dataFim).subscribe({
      next: (vendas) => {
        this.vendas.set(vendas);
        this.aplicarFiltro();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao filtrar por período:', error);
        this.isLoading.set(false);
        alert('Erro ao filtrar vendas por período');
      }
    });
  }
}
