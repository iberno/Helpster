import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import ticketService from '../services/ticketService';
import { useNavigate, Link } from 'react-router-dom';

const TicketListPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && user === null) {
      setLoading(true);
      return;
    }

    if (!token || user === null) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        let fetchedTickets;
        if (user.role === 'admin' || user.role === 'manager') {
          fetchedTickets = await ticketService.getAllTickets(token);
        } else if (user.role === 'user') {
          fetchedTickets = await ticketService.getMyTickets(token);
        } else {
          setError('Você não tem permissão para visualizar tickets.');
          setLoading(false);
          return;
        }
        setTickets(fetchedTickets);
      } catch (err) {
        console.error('Erro ao buscar tickets:', err);
        setError(err.message || 'Erro ao carregar tickets.');
        if (err.message === 'Token inválido ou expirado.') {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token, user, navigate, logout]);

  if (loading) {
    return <div className="w-full text-center mt-8">Carregando tickets...</div>;
  }

  if (error) {
    return <div className="w-full text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded dark:bg-zinc-800 dark:text-gray-100">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-gray-50 dark:bg-zinc-700">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100">Meus Tickets</h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
              {(user?.role === 'user' || user?.role === 'admin' || user?.role === 'manager') && (
                <Link to="/tickets/new" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-200">
                  Abrir Novo Ticket
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {tickets.length === 0 ? (
            <p className="text-center text-gray-600 p-4 dark:text-gray-300">Nenhum ticket encontrado.</p>
          ) : (
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">ID</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Título</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Status</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Prioridade</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Categoria</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Criado Em</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="dark:bg-zinc-800">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{ticket.id}</td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{ticket.title}</td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${ticket.status === 'Aberto' ? 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100' :
                          ticket.status === 'Em Andamento' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                          ticket.status === 'Aguardando Cliente' ? 'bg-orange-200 text-orange-800 dark:bg-orange-700 dark:text-orange-100' :
                          ticket.status === 'Resolvido' ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100' :
                          'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}
                      `}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${ticket.priority === 'Urgente' ? 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100' :
                          ticket.priority === 'Alta' ? 'bg-orange-200 text-orange-800 dark:bg-orange-700 dark:text-orange-100' :
                          ticket.priority === 'Média' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                          'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100'}
                      `}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{ticket.category_name}</td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                      <Link to={`/tickets/${ticket.id}`} className="text-blue-500 hover:underline dark:text-blue-400">Ver Detalhes</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketListPage;
