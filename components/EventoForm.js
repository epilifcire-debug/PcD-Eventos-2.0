import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X, Loader2, Calendar } from 'lucide-react';

export default function EventoForm({ evento, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    data: '',
    local: '',
    descricao: '',
    ativo: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (evento) {
      setFormData({
        nome: evento.nome || '',
        data: evento.data || '',
        local: evento.local || '',
        descricao: evento.descricao || '',
        ativo: evento.ativo !== false
      });
    } else {
      setFormData({
        nome: '',
        data: '',
        local: '',
        descricao: '',
        ativo: true
      });
    }
  }, [evento, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome) {
      alert('Nome do evento é obrigatório!');
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-700">
            <Calendar className="w-5 h-5" />
            {evento ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-700 font-semibold">Nome do Evento *</Label>
            <Input
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Pré-Caju 2025"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-semibold">Data</Label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => handleChange('data', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-semibold">Local</Label>
            <Input
              value={formData.local}
              onChange={(e) => handleChange('local', e.target.value)}
              placeholder="Local do evento"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-semibold">Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descrição do evento..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}