import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, Loader2, User, FileText, Users as UsersIcon, ArrowRight, ArrowLeft, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import GoogleDriveConnect from '../components/GoogleDriveConnect';

export default function CadastroPCD() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    evento_id: '',
    nome_completo: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    tipo_deficiencia: '',
    descricao_deficiencia: '',
    usa_cadeira_rodas: false,
    necessita_acompanhante: false,
    nome_acompanhante: '',
    cpf_acompanhante: '',
    telefone_acompanhante: '',
    doc_identidade_url: '',
    doc_laudo_url: '',
    doc_comprovante_url: '',
    doc_foto_url: '',
    doc_acompanhante_url: '',
    status: 'pendente'
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => base44.entities.Evento.list('-created_date'),
  });

  const eventosAtivos = eventos.filter(e => e.ativo);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CadastroPCD.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cadastros']);
      toast.success('Cadastro realizado com sucesso!');
      setFormData({
        evento_id: '',
        nome_completo: '',
        cpf: '',
        data_nascimento: '',
        telefone: '',
        email: '',
        tipo_deficiencia: '',
        descricao_deficiencia: '',
        usa_cadeira_rodas: false,
        necessita_acompanhante: false,
        nome_acompanhante: '',
        cpf_acompanhante: '',
        telefone_acompanhante: '',
        doc_identidade_url: '',
        doc_laudo_url: '',
        doc_comprovante_url: '',
        doc_foto_url: '',
        doc_acompanhante_url: '',
        status: 'pendente'
      });
      setStep(1);
    },
    onError: () => {
      toast.error('Erro ao realizar cadastro');
    }
  });

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Faz upload para o storage do app
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
      
      // 2. Tenta enviar também para o Google Drive (se conectado)
      if (formData.evento_id && formData.nome_completo) {
        const evento = eventos.find(e => e.id === formData.evento_id);
        
        try {
          const driveResult = await base44.functions.uploadToGoogleDrive({
            file_url: file_url,
            file_name: file.name,
            evento_nome: evento?.nome || 'Evento',
            participante_nome: formData.nome_completo
          });
          
          if (driveResult.success) {
            toast.success('✓ Arquivo salvo no app e no Google Drive!');
          } else {
            toast.success('✓ Arquivo salvo no app (Google Drive não conectado)');
          }
        } catch (driveError) {
          // Se falhar no Drive, não tem problema - arquivo já está no storage
          toast.success('✓ Arquivo salvo no app');
        }
      } else {
        toast.success('Arquivo enviado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.evento_id || !formData.nome_completo || !formData.cpf || !formData.telefone || !formData.tipo_deficiencia) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    createMutation.mutate(formData);
  };

  const nextStep = () => {
    if (step === 1 && (!formData.evento_id || !formData.nome_completo || !formData.cpf || !formData.telefone)) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (step === 2 && !formData.tipo_deficiencia) {
      toast.error('Selecione o tipo de deficiência');
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cadastro PCD</h1>
        <p className="text-gray-600">Preencha o formulário para se inscrever no evento</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-1 mx-2 ${step > s ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-600">
          <span className={step === 1 ? 'font-bold' : ''}>Dados Pessoais</span>
          <span className={step === 2 ? 'font-bold' : ''}>Deficiência</span>
          <span className={step === 3 ? 'font-bold' : ''}>Acompanhante</span>
          <span className={step === 4 ? 'font-bold' : ''}>Documentos</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-xl">
          <CardHeader className="gradient-bg text-white">
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <><User className="w-6 h-6" /> Etapa 1: Dados Pessoais</>}
              {step === 2 && <><FileText className="w-6 h-6" /> Etapa 2: Informações da Deficiência</>}
              {step === 3 && <><UsersIcon className="w-6 h-6" /> Etapa 3: Dados do Acompanhante</>}
              {step === 4 && <><Upload className="w-6 h-6" /> Etapa 4: Upload de Documentos</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Step 1: Dados Pessoais */}
            {step === 1 && (
              <>
                <div>
                  <Label>Evento *</Label>
                  <Select value={formData.evento_id} onValueChange={(v) => setFormData({...formData, evento_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventosAtivos.map(evento => (
                        <SelectItem key={evento.id} value={evento.id}>{evento.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input 
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label>CPF *</Label>
                    <Input 
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Data de Nascimento</Label>
                    <Input 
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Telefone/WhatsApp *</Label>
                    <Input 
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: formatPhone(e.target.value)})}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div>
                  <Label>E-mail</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
              </>
            )}

            {/* Step 2: Deficiência */}
            {step === 2 && (
              <>
                <div>
                  <Label>Tipo de Deficiência *</Label>
                  <Select value={formData.tipo_deficiencia} onValueChange={(v) => setFormData({...formData, tipo_deficiencia: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisica">Física</SelectItem>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditiva">Auditiva</SelectItem>
                      <SelectItem value="intelectual">Intelectual</SelectItem>
                      <SelectItem value="multipla">Múltipla</SelectItem>
                      <SelectItem value="outra">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Descrição da Deficiência</Label>
                  <Textarea 
                    value={formData.descricao_deficiencia}
                    onChange={(e) => setFormData({...formData, descricao_deficiencia: e.target.value})}
                    placeholder="Descreva com detalhes sua condição"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="cadeira"
                    checked={formData.usa_cadeira_rodas}
                    onChange={(e) => setFormData({...formData, usa_cadeira_rodas: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="cadeira" className="cursor-pointer">Utiliza cadeira de rodas</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="acompanhante"
                    checked={formData.necessita_acompanhante}
                    onChange={(e) => setFormData({...formData, necessita_acompanhante: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="acompanhante" className="cursor-pointer">Necessita de acompanhante</Label>
                </div>
              </>
            )}

            {/* Step 3: Acompanhante */}
            {step === 3 && (
              <>
                {formData.necessita_acompanhante ? (
                  <>
                    <div>
                      <Label>Nome do Acompanhante</Label>
                      <Input 
                        value={formData.nome_acompanhante}
                        onChange={(e) => setFormData({...formData, nome_acompanhante: e.target.value})}
                        placeholder="Nome completo do acompanhante"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>CPF do Acompanhante</Label>
                        <Input 
                          value={formData.cpf_acompanhante}
                          onChange={(e) => setFormData({...formData, cpf_acompanhante: formatCPF(e.target.value)})}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      </div>
                      <div>
                        <Label>Telefone do Acompanhante</Label>
                        <Input 
                          value={formData.telefone_acompanhante}
                          onChange={(e) => setFormData({...formData, telefone_acompanhante: formatPhone(e.target.value)})}
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>Você não marcou que necessita de acompanhante.</p>
                    <p className="text-sm mt-2">Clique em "Voltar" se precisar alterar.</p>
                  </div>
                )}
              </>
            )}

            {/* Step 4: Documentos */}
            {step === 4 && (
              <div className="space-y-4">
                {/* Google Drive Connection */}
                <GoogleDriveConnect />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <div className="flex gap-2">
                    <Cloud className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Organização Automática</p>
                      <p className="text-blue-700">
                        Os documentos serão organizados no seu Google Drive em: 
                        <span className="font-mono text-xs block mt-1">
                          Sistema PCD → {eventos.find(e => e.id === formData.evento_id)?.nome || 'Evento'} → {formData.nome_completo || 'Participante'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Documento de Identidade (RG/CNH)</Label>
                    <Input 
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'doc_identidade_url')}
                      accept="image/*,.pdf"
                    />
                    {formData.doc_identidade_url && <Badge className="mt-2 bg-green-100 text-green-800">✓ Enviado</Badge>}
                  </div>

                  <div>
                    <Label>Laudo Médico</Label>
                    <Input 
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'doc_laudo_url')}
                      accept="image/*,.pdf"
                    />
                    {formData.doc_laudo_url && <Badge className="mt-2 bg-green-100 text-green-800">✓ Enviado</Badge>}
                  </div>

                  <div>
                    <Label>Comprovante de Residência</Label>
                    <Input 
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'doc_comprovante_url')}
                      accept="image/*,.pdf"
                    />
                    {formData.doc_comprovante_url && <Badge className="mt-2 bg-green-100 text-green-800">✓ Enviado</Badge>}
                  </div>

                  <div>
                    <Label>Foto 3x4</Label>
                    <Input 
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'doc_foto_url')}
                      accept="image/*"
                    />
                    {formData.doc_foto_url && <Badge className="mt-2 bg-green-100 text-green-800">✓ Enviado</Badge>}
                  </div>

                  {formData.necessita_acompanhante && (
                    <div>
                      <Label>Documento do Acompanhante</Label>
                      <Input 
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'doc_acompanhante_url')}
                        accept="image/*,.pdf"
                      />
                      {formData.doc_acompanhante_url && <Badge className="mt-2 bg-green-100 text-green-800">✓ Enviado</Badge>}
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando arquivo...</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              {step < 4 ? (
                <Button type="button" onClick={nextStep} className="gradient-bg text-white ml-auto">
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || uploading}
                  className="gradient-bg text-white ml-auto"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finalizar Cadastro
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}