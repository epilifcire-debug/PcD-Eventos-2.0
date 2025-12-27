import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Calendar, Users, CheckCircle, Clock, Plus, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Home() {
  const { data: eventos = [], isLoading: loadingEventos } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => base44.entities.Evento.list('-created_date'),
  });

  const { data: cadastros = [], isLoading: loadingCadastros } = useQuery({
    queryKey: ['cadastros'],
    queryFn: () => base44.entities.CadastroPCD.list(),
  });

  const eventosAtivos = eventos.filter(e => e.ativo);
  const cadastrosPendentes = cadastros.filter(c => c.status === 'pendente');
  const cadastrosAprovados = cadastros.filter(c => c.status === 'aprovado');

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <Calendar className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{eventosAtivos.length}</div>
            <p className="text-xs mt-1 opacity-90">Total de eventos disponíveis</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cadastros</CardTitle>
            <Users className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cadastros.length}</div>
            <p className="text-xs mt-1 opacity-90">Participantes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cadastrosPendentes.length}</div>
            <p className="text-xs mt-1 opacity-90">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cadastrosAprovados.length}</div>
            <p className="text-xs mt-1 opacity-90">Participantes confirmados</p>
          </CardContent>
        </Card>
      </div>

      {/* Eventos em Destaque */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-purple-600" />
            Eventos em Destaque
          </h2>
          <Link to={createPageUrl('CadastroPCD')}>
            <Button className="gradient-bg text-white shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cadastro
            </Button>
          </Link>
        </div>

        {loadingEventos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : eventosAtivos.length === 0 ? (
          <Card className="text-center p-12 border-2 border-dashed">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum evento ativo</h3>
            <p className="text-gray-500">Eventos aparecerão aqui quando forem criados</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosAtivos.map(evento => {
              const cadastrosEvento = cadastros.filter(c => c.evento_id === evento.id);
              const aprovadosEvento = cadastrosEvento.filter(c => c.status === 'aprovado').length;
              
              return (
                <Card key={evento.id} className="card-hover border-0 shadow-lg overflow-hidden">
                  {evento.logo_url && (
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
                      <img 
                        src={evento.logo_url} 
                        alt={evento.nome}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{evento.nome}</h3>
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
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {cadastrosEvento.length} inscritos
                        </Badge>
                        {evento.vagas_pcd && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {evento.vagas_pcd} vagas
                          </Badge>
                        )}
                      </div>
                      <Link to={createPageUrl('CadastroPCD')}>
                        <Button size="sm" className="gradient-bg text-white">
                          Inscrever-se
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cadastros Recentes */}
      {cadastros.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Cadastros Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cadastros.slice(0, 5).map(cadastro => (
                <div key={cadastro.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{cadastro.nome_completo}</p>
                    <p className="text-sm text-gray-600">{cadastro.telefone}</p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      cadastro.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                      cadastro.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {cadastro.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link to={createPageUrl('GerenciarCadastros')}>
                <Button variant="outline" className="w-full">
                  Ver todos os cadastros
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}