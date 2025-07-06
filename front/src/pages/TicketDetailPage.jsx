import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ticketService from '../services/ticketService';
import authService from '../services/authService'; // Importar authService
import BackButton from '../components/BackButton';
import { useAlert } from '../contexts/AlertContext';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user, token, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentVisibility, setCommentVisibility] = useState('Público');
  const [agents, setAgents] = useState([]); // Novo estado para armazenar agentes
  const [statuses, setStatuses] = useState([]); // Novo estado para armazenar status
  const [priorities, setPriorities] = useState([]); // Novo estado para armazenar prioridades
  const [supportLevels, setSupportLevels] = useState([]); // Novo estado para armazenar níveis de suporte
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchTicketAndOptions = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const fetchedTicket = await ticketService.getTicketById(token, id);
        setTicket(fetchedTicket);

        const fetchedAgents = await authService.getAgents(token);
        setAgents(fetchedAgents);

        const fetchedStatuses = await ticketService.getTicketStatuses(token);
        setStatuses(fetchedStatuses);

        const fetchedPriorities = await ticketService.getTicketPriorities(token);
        setPriorities(fetchedPriorities);

        const fetchedSupportLevels = await ticketService.getTicketSupportLevels(token);
        setSupportLevels(fetchedSupportLevels);

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(err.message || 'Erro ao carregar dados.');
        if (err.message === 'Token inválido ou expirado.') {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicketAndOptions();
  }, [id, token, navigate, logout, hasPermission]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showAlert('O comentário não pode ser vazio.', 'error');
      return;
    }

    try {
      await ticketService.addCommentToTicket(token, id, {
        content: newComment,
        visibility: commentVisibility,
      });
      const updatedTicket = await ticketService.getTicketById(token, id);
      setTicket(updatedTicket);
      setNewComment('');
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
      showAlert(err.message || 'Falha ao adicionar comentário.', 'error');
    }
  };

  const handleUpdateTicket = async (field, value) => {
    try {
      const updatedTicket = await ticketService.updateTicket(token, id, { [field]: value });
      setTicket(updatedTicket);
      showAlert(`Ticket atualizado: ${field} para ${value}`, 'success');
    } catch (err) {
      console.error(`Erro ao atualizar ${field}:`, err);
      showAlert(`Falha ao atualizar ${field}.`, 'error');
    }
  };

  if (loading) {
    return <div className="w-full text-center mt-8">Carregando detalhes do ticket...</div>;
  }

  if (error) {
    return <div className="w-full text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  if (!ticket) {
    return <div className="w-full text-center mt-8 text-gray-600">Ticket não encontrado.</div>;
  }

  const isAgentOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-zinc-800 dark:text-gray-100 border-0">
        <div className="rounded-t bg-white dark:bg-zinc-800 mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-gray-800 dark:text-gray-100 text-xl font-bold">Detalhes do Ticket #{ticket.id}</h6>
            <BackButton to="/tickets" />
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">Informações do Ticket</h6>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Título</label>
                <p className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow w-full">{ticket.title}</p>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Cliente</label>
                <p className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow w-full">{ticket.client_name}</p>
              </div>
            </div>
            <div className="w-full lg:w-12/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Descrição</label>
                <p className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow w-full min-h-[100px]">{ticket.description}</p>
              </div>
            </div>
          </div>

          <hr className="mt-6 border-b-1 border-gray-300 dark:border-zinc-600" />

          <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">Status e Atribuição</h6>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-4/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Status</label>
                {user && hasPermission('tickets:update') ? (
                  <select value={ticket.status} onChange={(e) => handleUpdateTicket('status', e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <p className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow w-full">{ticket.status}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-4/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Prioridade</label>
                {user && hasPermission('tickets:update') ? (
                  <select value={ticket.priority} onChange={(e) => handleUpdateTicket('priority', e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <p className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow w-full">{ticket.priority}</p>
                )}
              </div>
            </div>
            <div className="w-full lg:w-4/12 px-4">
              <div className="relative w-full mb-3">
                <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Nível de Suporte</label>
                {user && hasPermission('tickets:update') ? (
                  <select value={ticket.support_level} onChange={(e) => handleUpdateTicket('support_level', e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                    {supportLevels.map(sl => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                ) : (
                  <p className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow w-full">{ticket.support_level}</p>
                )}
              </div>
            </div>
            {user && hasPermission('tickets:assign') && (
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Atribuir Agente</label>
                  <select value={ticket.agent_id || ''} onChange={(e) => handleUpdateTicket('agent_id', e.target.value || null)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                    <option value="">Nenhum</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name} ({agent.email})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <hr className="mt-6 border-b-1 border-gray-300 dark:border-zinc-600" />

          <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">Comentários</h6>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-12/12 px-4">
              <div className="space-y-4 max-h-80 overflow-y-auto border p-4 rounded-md bg-gray-50 dark:bg-zinc-700 dark:border-zinc-600">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment) => (
                    <div key={comment.id} className={`p-3 rounded-lg ${comment.visibility === 'Interno' ? 'bg-blue-100 dark:bg-blue-800 dark:text-blue-100' : 'bg-gray-100 dark:bg-zinc-600 dark:text-gray-100'}`}>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{comment.author_name} ({comment.visibility}) - {new Date(comment.created_at).toLocaleString()}</p>
                      <p className="text-gray-800 dark:text-gray-100">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">Nenhum comentário ainda.</p>
                )}
              </div>
            </div>
          </div>

          <hr className="mt-6 border-b-1 border-gray-300 dark:border-zinc-600" />

          <form onSubmit={handleAddComment}>
            <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">Adicionar Comentário</h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <textarea id="newComment" value={newComment} onChange={(e) => setNewComment(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" rows="4" required></textarea>
                </div>
              </div>
              {user && hasPermission('comments:add_internal') && (
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Visibilidade</label>
                    <select id="commentVisibility" value={commentVisibility} onChange={(e) => setCommentVisibility(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                      <option value="Público">Público (Visível para o Cliente)</option>
                      <option value="Interno">Interno (Apenas para a Equipe de TI)</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="w-full lg:w-12/12 px-4">
                <button type="submit" className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150">Adicionar Comentário</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
