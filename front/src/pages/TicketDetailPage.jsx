import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ticketService from '../../services/ticketService';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentVisibility, setCommentVisibility] = useState('Público');

  useEffect(() => {
    const fetchTicket = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const fetchedTicket = await ticketService.getTicketById(token, id);
        setTicket(fetchedTicket);
      } catch (err) {
        console.error('Erro ao buscar ticket:', err);
        setError(err.message || 'Erro ao carregar ticket.');
        if (err.message === 'Token inválido ou expirado.') {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token, navigate, logout]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('O comentário não pode ser vazio.');
      return;
    }

    try {
      await ticketService.addCommentToTicket(token, id, {
        content: newComment,
        visibility: commentVisibility,
      });
      // Atualiza o ticket para mostrar o novo comentário
      const updatedTicket = await ticketService.getTicketById(token, id);
      setTicket(updatedTicket);
      setNewComment('');
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
      alert(err.message || 'Falha ao adicionar comentário.');
    }
  };

  const handleUpdateTicket = async (field, value) => {
    try {
      const updatedTicket = await ticketService.updateTicket(token, id, { [field]: value });
      setTicket(updatedTicket);
      alert(`Ticket atualizado: ${field} para ${value}`);
    } catch (err) {
      console.error(`Erro ao atualizar ${field}:`, err);
      alert(`Falha ao atualizar ${field}.`);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Carregando detalhes do ticket...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  if (!ticket) {
    return <div className="text-center mt-8 text-gray-600">Ticket não encontrado.</div>;
  }

  const isAgentOrAdmin = user?.role === 'admin' || user?.role === 'manager';
  const isClient = user?.role === 'user';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Detalhes do Ticket #{ticket.id}</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">{ticket.title}</h2>
        <p className="text-gray-700 mb-4">{ticket.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Status:</strong> 
              {isAgentOrAdmin ? (
                <select 
                  value={ticket.status}
                  onChange={(e) => handleUpdateTicket('status', e.target.value)}
                  className="ml-2 p-1 border rounded"
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Aguardando Cliente">Aguardando Cliente</option>
                  <option value="Resolvido">Resolvido</option>
                  <option value="Fechado">Fechado</option>
                </select>
              ) : (
                <span className="ml-2 font-semibold">{ticket.status}</span>
              )}
            </p>
            <p><strong>Prioridade:</strong> 
              {isAgentOrAdmin ? (
                <select
                  value={ticket.priority}
                  onChange={(e) => handleUpdateTicket('priority', e.target.value)}
                  className="ml-2 p-1 border rounded"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              ) : (
                <span className="ml-2 font-semibold">{ticket.priority}</span>
              )}
            </p>
            <p><strong>Nível de Suporte:</strong> 
              {isAgentOrAdmin ? (
                <select
                  value={ticket.support_level}
                  onChange={(e) => handleUpdateTicket('support_level', e.target.value)}
                  className="ml-2 p-1 border rounded"
                >
                  <option value="N1">N1</option>
                  <option value="N2">N2</option>
                  <option value="N3">N3</option>
                </select>
              ) : (
                <span className="ml-2 font-semibold">{ticket.support_level}</span>
              )}
            </p>
          </div>
          <div>
            <p><strong>Cliente:</strong> {ticket.client_name}</p>
            <p><strong>Agente Designado:</strong> {ticket.agent_name || 'Nenhum'}</p>
            <p><strong>Categoria:</strong> {ticket.category_name}</p>
            <p><strong>Criado em:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
            <p><strong>Última Atualização:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
          </div>
        </div>

        {isAgentOrAdmin && (
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Atribuir Agente:</h3>
            {/* TODO: Implementar seleção de agente real */}
            <select
              value={ticket.agent_id || ''}
              onChange={(e) => handleUpdateTicket('agent_id', e.target.value || null)}
              className="w-full p-2 border rounded"
            >
              <option value="">Nenhum</option>
              {/* Renderizar agentes disponíveis aqui */}
              <option value={user.id}>Atribuir a mim ({user.email})</option>
            </select>
          </div>
        )}

        <h3 className="text-xl font-bold mb-4">Comentários:</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto border p-4 rounded-md bg-gray-50">
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((comment) => (
              <div key={comment.id} className={`p-3 rounded-lg ${comment.visibility === 'Interno' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <p className="font-semibold">{comment.author_name} ({comment.visibility === 'Interno' ? 'Interno' : 'Público'}) - {new Date(comment.created_at).toLocaleString()}</p>
                <p className="text-gray-800">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Nenhum comentário ainda.</p>
          )}
        </div>

        <form onSubmit={handleAddComment} className="mt-6 space-y-4">
          <div>
            <label htmlFor="newComment" className="block text-gray-700 text-sm font-bold mb-2">Adicionar Comentário:</label>
            <textarea
              id="newComment"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
          </div>
          {isAgentOrAdmin && (
            <div>
              <label htmlFor="commentVisibility" className="block text-gray-700 text-sm font-bold mb-2">Visibilidade:</label>
              <select
                id="commentVisibility"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={commentVisibility}
                onChange={(e) => setCommentVisibility(e.target.value)}
              >
                <option value="Público">Público (Visível para o Cliente)</option>
                <option value="Interno">Interno (Apenas para a Equipe de TI)</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Adicionar Comentário
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetailPage;
