import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Download,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function GerenciarCadastros() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedCadastro, setSelectedCadastro] = useState(null);
  const queryClient = useQueryClient();

  const { data: cadastros = [], isLoading } = useQuery({
    queryKey: ['cadastros'],
    queryFn: () => base44.entities.CadastroPCD.list('-created_date'),
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => base44.entities.Evento.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CadastroPCD.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cadastros']);
      toast.success('Status atualizado com sucesso!');
      setSelectedCadastro(null);
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CadastroPCD.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['cadastros']);
      toast.success('Cadastro excluído com sucesso!');
      setSelectedCadastro(null);
    },
    onError: () => {
      toast.error('Erro ao excluir cadastro');
    }
  });

  const handleStatusChange = (id, newStatus) => {
    updateMutation.mutate({ 
      id, 
      data: { 
        status: newStatus,
        data_aprovacao: newStatus === 'aprovado' ? new Date().toISOString() : null
      } 
    });
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este cadastro?')) {
      deleteMutation.mutate(id);
    }
  };

  const getEvento = (eventoId) => {
    return eventos.find(e => e.id === eventoId);
  };

  const filteredCadastros = cadastros.filter(cadastro => {
    const matchesSearch = cadastro.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cadastro.cpf.includes(searchTerm) ||
                         cadastro.telefone.includes(searchTerm);
    const matchesStatus = filterStatus === 'todos' || cadastro.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const configs = {
      pendente: { className: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      em_analise: { className: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Em Análise' },
      aprovado: { className: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aprovado' },
      reprovado: { className: 'bg-red-100 text-red-800', icon: XCircle, label: 'Reprovado' },
      documentos_pendentes: { className: 'bg-orange-100 text-orange-800', icon: FileText, label: 'Docs Pendentes' }
    };
    const config = configs[status] || configs.pendente;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cadastros</h1>
          <p className="text-gray-600 mt-1">Total de {cadastros.length} cadastros</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                  <SelectItem value="documentos_pendentes">Docs Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo Def.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredCadastros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum cadastro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCadastros.map((cadastro) => {
                    const evento = getEvento(cadastro.evento_id);
                    return (
                      <TableRow key={cadastro.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{cadastro.nome_completo}</TableCell>
                        <TableCell className="font-mono text-sm">{cadastro.cpf}</TableCell>
                        <TableCell>{cadastro.telefone}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {evento?.nome || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{cadastro.tipo_deficiencia}</TableCell>
                        <TableCell>{getStatusBadge(cadastro.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {format(new Date(cadastro.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedCadastro(cadastro)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(cadastro.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCadastro} onOpenChange={() => setSelectedCadastro(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes do Cadastro</DialogTitle>
            <DialogDescription>
              Visualize e gerencie as informações do participante
            </DialogDescription>
          </DialogHeader>
          
          {selectedCadastro && (
            <div className="space-y-6">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alterar Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['pendente', 'em_analise', 'aprovado', 'reprovado', 'documentos_pendentes'].map(status => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedCadastro.status === status ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(selectedCadastro.id, status)}
                        className={selectedCadastro.status === status ? 'gradient-bg text-white' : ''}
                      >
                        {status.replace(/_/g, ' ').toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome Completo</p>
                    <p className="font-medium">{selectedCadastro.nome_completo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPF</p>
                    <p className="font-medium font-mono">{selectedCadastro.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{selectedCadastro.telefone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">E-mail</p>
                    <p className="font-medium">{selectedCadastro.email || 'Não informado'}</p>
                  </div>
                  {selectedCadastro.data_nascimento && (
                    <div>
                      <p className="text-sm text-gray-600">Data de Nascimento</p>
                      <p className="font-medium">
                        {format(new Date(selectedCadastro.data_nascimento), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Evento</p>
                    <p className="font-medium">{getEvento(selectedCadastro.evento_id)?.nome || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Disability Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações da Deficiência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Deficiência</p>
                    <p className="font-medium capitalize">{selectedCadastro.tipo_deficiencia}</p>
                  </div>
                  {selectedCadastro.descricao_deficiencia && (
                    <div>
                      <p className="text-sm text-gray-600">Descrição</p>
                      <p className="font-medium">{selectedCadastro.descricao_deficiencia}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <Badge variant={selectedCadastro.usa_cadeira_rodas ? 'default' : 'secondary'}>
                      {selectedCadastro.usa_cadeira_rodas ? '✓' : '✗'} Cadeira de Rodas
                    </Badge>
                    <Badge variant={selectedCadastro.necessita_acompanhante ? 'default' : 'secondary'}>
                      {selectedCadastro.necessita_acompanhante ? '✓' : '✗'} Acompanhante
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Companion Info */}
              {selectedCadastro.necessita_acompanhante && selectedCadastro.nome_acompanhante && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dados do Acompanhante</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">{selectedCadastro.nome_acompanhante}</p>
                    </div>
                    {selectedCadastro.cpf_acompanhante && (
                      <div>
                        <p className="text-sm text-gray-600">CPF</p>
                        <p className="font-medium font-mono">{selectedCadastro.cpf_acompanhante}</p>
                      </div>
                    )}
                    {selectedCadastro.telefone_acompanhante && (
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="font-medium">{selectedCadastro.telefone_acompanhante}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: 'Identidade', url: selectedCadastro.doc_identidade_url },
                      { label: 'Laudo Médico', url: selectedCadastro.doc_laudo_url },
                      { label: 'Comprovante', url: selectedCadastro.doc_comprovante_url },
                      { label: 'Foto 3x4', url: selectedCadastro.doc_foto_url },
                      { label: 'Doc. Acompanhante', url: selectedCadastro.doc_acompanhante_url }
                    ].map(doc => doc.url && (
                      <a
                        key={doc.label}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-sm">{doc.label}</span>
                        <Download className="w-4 h-4 text-purple-600" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}