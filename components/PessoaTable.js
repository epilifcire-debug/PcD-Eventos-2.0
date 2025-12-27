import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye } from 'lucide-react';

export default function PessoaTable({ pessoas, eventos, onEdit, onDelete, onView }) {
  const getEventoNome = (eventoId) => {
    const evento = eventos.find(e => e.id === eventoId);
    return evento?.nome || 'Evento não encontrado';
  };

  if (pessoas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Nenhum cadastro encontrado</p>
        <p className="text-sm mt-1">Clique em "Novo Cadastro" para adicionar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50">
            <TableHead className="font-bold text-purple-800">Nome</TableHead>
            <TableHead className="font-bold text-purple-800">CPF</TableHead>
            <TableHead className="font-bold text-purple-800">Telefone</TableHead>
            <TableHead className="font-bold text-purple-800">Eventos</TableHead>
            <TableHead className="font-bold text-purple-800 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pessoas.map((pessoa, index) => (
            <TableRow 
              key={pessoa.id} 
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition-colors`}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  {pessoa.foto_url ? (
                    <img 
                      src={pessoa.foto_url} 
                      alt={pessoa.nome}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      {pessoa.nome?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{pessoa.nome}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-gray-600">{pessoa.cpf}</TableCell>
              <TableCell className="text-gray-600">{pessoa.telefone || '-'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {pessoa.eventos?.length > 0 ? (
                    pessoa.eventos.map((eventoId, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 text-xs"
                      >
                        {getEventoNome(eventoId)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Nenhum evento</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(pessoa)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(pessoa)}
                    className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(pessoa)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}