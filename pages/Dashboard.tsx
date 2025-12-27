// src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";

import Header from "@/components/Header";
import PessoaForm from "@/components/PessoaForm";
import PessoaTable from "@/components/PessoaTable";
import EventoForm from "@/components/EventoForm";
import PDFGenerator from "@/components/PDFGenerator";
import BackupManager from "@/components/BackupManager";

import {
  getPessoas,
  savePessoas,
  getEventos,
  saveEventos,
} from "@/storage/storage";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

// ===================== TYPES =====================
type Pessoa = any;
type Evento = any;

export default function Dashboard() {
  // ===================== STATE =====================
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);

  const [viewPessoa, setViewPessoa] = useState<Pessoa | null>(null);

  const [eventoModalOpen, setEventoModalOpen] = useState(false);

  // ===================== LOAD LOCAL =====================
  useEffect(() => {
    setPessoas(getPessoas());
    setEventos(getEventos());
  }, []);

  // ===================== PESSOA =====================
  const handleSavePessoa = async (data: Pessoa) => {
    let lista = [...pessoas];

    if (editingPessoa) {
      lista = lista.map((p) =>
        p.id === editingPessoa.id ? { ...data, id: p.id } : p
      );
    } else {
      lista.push({
        ...data,
        id: Date.now(),
      });
    }

    setPessoas(lista);
    savePessoas(lista);
    setEditingPessoa(null);
  };

  const handleDeletePessoa = (pessoa: Pessoa) => {
    if (!confirm("Deseja excluir este cadastro?")) return;

    const lista = pessoas.filter((p) => p.id !== pessoa.id);
    setPessoas(lista);
    savePessoas(lista);
  };

  // ===================== EVENTO =====================
  const handleSaveEvento = async (data: Evento) => {
    let lista = [...eventos];

    if (editingEvento) {
      lista = lista.map((e) =>
        e.id === editingEvento.id ? { ...data, id: e.id } : e
      );
    } else {
      lista.push({
        ...data,
        id: Date.now(),
      });
    }

    setEventos(lista);
    saveEventos(lista);
    setEditingEvento(null);
    setEventoModalOpen(false);
  };

  // ===================== VIEW =====================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto p-4 space-y-6">
        {/* BACKUP */}
        <BackupManager />

        {/* EVENTOS */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-700">Eventos</h2>
          <Button onClick={() => setEventoModalOpen(true)}>
            Novo Evento
          </Button>
        </div>

        {/* FORM PESSOA */}
        <PessoaForm
          pessoa={editingPessoa}
          eventos={eventos}
          onSave={handleSavePessoa}
          onCancel={() => setEditingPessoa(null)}
        />

        {/* TABELA */}
        <PessoaTable
          pessoas={pessoas}
          eventos={eventos}
          onEdit={setEditingPessoa}
          onDelete={handleDeletePessoa}
          onView={setViewPessoa}
        />

        {/* PDF */}
        <div className="flex justify-end">
          <PDFGenerator pessoas={pessoas} evento={null} loading={false} />
        </div>
      </main>

      {/* MODAL EVENTO */}
      <EventoForm
        evento={editingEvento}
        open={eventoModalOpen}
        onOpenChange={setEventoModalOpen}
        onSave={handleSaveEvento}
      />

      {/* MODAL VISUALIZAR PESSOA */}
      <Dialog open={!!viewPessoa} onOpenChange={() => setViewPessoa(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Cadastro</DialogTitle>
          </DialogHeader>

          {viewPessoa && (
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700">Nome</h4>
                <p className="text-gray-600">{viewPessoa.nome}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700">CPF</h4>
                <p className="text-gray-600">{viewPessoa.cpf}</p>
              </div>

              {viewPessoa.telefone && (
                <div>
                  <h4 className="font-semibold text-gray-700">Telefone</h4>
                  <p className="text-gray-600">{viewPessoa.telefone}</p>
                </div>
              )}

              {viewPessoa.email && (
                <div>
                  <h4 className="font-semibold text-gray-700">Email</h4>
                  <p className="text-gray-600">{viewPessoa.email}</p>
                </div>
              )}

              {viewPessoa.tipo_deficiencia && (
                <div>
                  <h4 className="font-semibold text-gray-700">
                    Tipo de Deficiência
                  </h4>
                  <p className="text-gray-600">
                    {viewPessoa.tipo_deficiencia}
                  </p>
                </div>
              )}

              {viewPessoa.cid && (
                <div>
                  <h4 className="font-semibold text-gray-700">CID</h4>
                  <p className="text-gray-600">{viewPessoa.cid}</p>
                </div>
              )}

              {viewPessoa.observacoes && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Observações
                  </h4>
                  <p className="text-gray-600">
                    {viewPessoa.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        Sistema PCD — Eventos © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
