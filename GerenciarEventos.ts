import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function GerenciarEventos() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    logo_url: '',
    ativo: true,
    vagas_pcd: ''
  });

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => base44.entities.Evento.list('-created_date'),
  });

  const { data: cadastros = [] } = useQuery({
    queryKey: ['cadastros'],
    queryFn: () => base44.entities.CadastroPCD.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Evento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventos']);
      toast.success('Evento criado com sucesso!');
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao criar evento');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Evento.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventos']);
      toast.success('Evento atualizado com sucesso!');
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao atualizar evento');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Evento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventos']);
      toast.success('Evento excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir evento');
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, logo_url: file_url }));
      toast.success('Logo enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome) {
      toast.error('Nome do evento é obrigatório');
      return;
    }

    const dataToSave = {
      ...formData,
      vagas_pcd: formData.vagas_pcd ? Number(formData.vagas_pcd) : null
    };

    if (editingEvento) {
      updateMutation.mutate({ id: editingEvento.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
    setFormData({
      nome: evento.nome || '',
      descricao: evento.descricao || '',
      data_inicio: evento.data_inicio || '',
      data_fim: evento.data_fim || '',
      local: evento.local || '',
      logo_url: evento.logo_url || '',
      ativo: evento.ativo ?? true,
      vagas_pcd: evento.vagas_pcd || ''
    });
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      local: '',
      logo_url: '',
      ativo: true,
      vagas_pcd: ''
    });
    setEditingEvento(null);
    setShowDialog(false);
  };

  const getCadastrosCount = (eventoId) => {
    return cadastros.filter(c => c.evento_id === eventoId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Eventos</h1>
          <p className="text-gray-600 mt-1">Crie e organize seus eventos PCD</p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)}
          className="gradient-bg text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Eventos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200" />
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : eventos.length === 0 ? (
        <Card className="text-center p-12 border-2 border-dashed">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum evento cadastrado</h3>
          <p className="text-gray-500 mb-4">Crie seu primeiro evento para começar</p>
          <Button onClick={() => setShowDialog(true)} className="gradient-bg text-white">
            <Plus className="w-4 h-4 mr-2" />
            Criar Evento
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map(evento => {
            const cadastrosCount = getCadastrosCount(evento.id);
            
            return (
              <Card key={evento.id} className="card-hover border-0 shadow-lg overflow-hidden">
                {evento.logo_url ? (
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
                    <img 
                      src={evento.logo_url} 
                      alt={evento.nome}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{evento.nome}</h3>
                    <Badge 
                      variant={evento.ativo ? 'default' : 'secondary'}
                      className={evento.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {evento.ativo ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Ativo</>
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" /> Inativo</>
                      )}
                    </Badge>
                  </div>
                  
                  {evento.descricao && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{evento.descricao}</p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {evento.data_inicio && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(evento.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    )}
                    {evento.local && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {evento.local}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {cadastrosCount} cadastro(s)
                      {evento.vagas_pcd && ` de ${evento.vagas_pcd} vagas`}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(evento)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(evento.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Criar/Editar Evento */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingEvento ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do evento
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome do Evento *</Label>
              <Input 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Semana da Inclusão 2024"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea 
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descreva o evento"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data de Início</Label>
                <Input 
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                />
              </div>
              <div>
                <Label>Data de Término</Label>
                <Input 
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Local do Evento</Label>
              <Input 
                value={formData.local}
                onChange={(e) => setFormData({...formData, local: e.target.value})}
                placeholder="Ex: Centro de Convenções"
              />
            </div>

            <div>
              <Label>Número de Vagas PCD</Label>
              <Input 
                type="number"
                value={formData.vagas_pcd}
                onChange={(e) => setFormData({...formData, vagas_pcd: e.target.value})}
                placeholder="Ex: 100"
              />
            </div>

            <div>
              <Label>Logo do Evento</Label>
              <Input 
                type="file"
                onChange={handleLogoUpload}
                accept="image/*"
              />
              {formData.logo_url && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={formData.logo_url} alt="Preview" className="h-20 w-20 object-contain border rounded" />
                  <Badge className="bg-green-100 text-green-800">✓ Logo enviada</Badge>
                </div>
              )}
              {uploading && (
                <div className="flex items-center gap-2 text-purple-600 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Enviando...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="ativo" className="cursor-pointer">Evento ativo (aceitar cadastros)</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending || uploading}
                className="gradient-bg text-white"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {editingEvento ? 'Atualizar' : 'Criar'} Evento
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}