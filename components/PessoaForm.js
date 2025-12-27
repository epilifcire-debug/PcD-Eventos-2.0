import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CPFInput, PhoneInput } from './InputMask';
import { Save, X, Upload, Loader2, UserPlus } from 'lucide-react';

export default function PessoaForm({ pessoa, eventos, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    tipo_deficiencia: '',
    cid: '',
    acompanhante: '',
    cpf_acompanhante: '',
    observacoes: '',
    eventos: [],
    foto_url: '',
    documentos: []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  useEffect(() => {
    if (pessoa) {
      setFormData({
        nome: pessoa.nome || '',
        cpf: pessoa.cpf || '',
        telefone: pessoa.telefone || '',
        email: pessoa.email || '',
        tipo_deficiencia: pessoa.tipo_deficiencia || '',
        cid: pessoa.cid || '',
        acompanhante: pessoa.acompanhante || '',
        cpf_acompanhante: pessoa.cpf_acompanhante || '',
        observacoes: pessoa.observacoes || '',
        eventos: pessoa.eventos || [],
        foto_url: pessoa.foto_url || '',
        documentos: pessoa.documentos || []
      });
    }
  }, [pessoa]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEventoToggle = (eventoId) => {
    setFormData(prev => ({
      ...prev,
      eventos: prev.eventos.includes(eventoId)
        ? prev.eventos.filter(id => id !== eventoId)
        : [...prev.eventos, eventoId]
    }));
  };

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('foto_url', file_url);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }
    setUploadingFoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.cpf) {
      alert('Nome e CPF são obrigatórios!');
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          {pessoa ? 'Editar Cadastro' : 'Novo Cadastro PCD'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-purple-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                {formData.foto_url ? (
                  <img src={formData.foto_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-4xl">👤</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors shadow-lg">
                {uploadingFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-gray-700 font-semibold">Nome Completo *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome completo"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">CPF *</Label>
              <CPFInput
                value={formData.cpf}
                onChange={(value) => handleChange('cpf', value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">Telefone</Label>
              <PhoneInput
                value={formData.telefone}
                onChange={(value) => handleChange('telefone', value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">Tipo de Deficiência</Label>
              <Input
                value={formData.tipo_deficiencia}
                onChange={(e) => handleChange('tipo_deficiencia', e.target.value)}
                placeholder="Ex: Visual, Auditiva, Física..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">CID</Label>
              <Input
                value={formData.cid}
                onChange={(e) => handleChange('cid', e.target.value)}
                placeholder="Código CID"
                className="mt-1"
              />
            </div>
          </div>

          {/* Acompanhante */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Dados do Acompanhante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Nome do Acompanhante</Label>
                <Input
                  value={formData.acompanhante}
                  onChange={(e) => handleChange('acompanhante', e.target.value)}
                  placeholder="Nome completo"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-600">CPF do Acompanhante</Label>
                <CPFInput
                  value={formData.cpf_acompanhante}
                  onChange={(value) => handleChange('cpf_acompanhante', value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Eventos */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Eventos Vinculados</h3>
            {eventos.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum evento cadastrado. Cadastre um evento primeiro.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {eventos.map((evento) => (
                  <label
                    key={evento.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.eventos.includes(evento.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Checkbox
                      checked={formData.eventos.includes(evento.id)}
                      onCheckedChange={() => handleEventoToggle(evento.id)}
                    />
                    <div>
                      <p className="font-medium text-gray-800">{evento.nome}</p>
                      {evento.data && (
                        <p className="text-xs text-gray-500">
                          {new Date(evento.data).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <Label className="text-gray-700 font-semibold">Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {pessoa ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}