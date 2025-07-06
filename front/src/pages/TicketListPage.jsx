import React, { useEffect, useState, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import ticketService from '../services/ticketService';
import { useNavigate, Link } from 'react-router-dom';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const TicketListPage = () => {
  const { user, token, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10); // Define quantos tickets por página
  const [totalTickets, setTotalTickets] = useState(0);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // espera 400ms após digitar

    return () => {
      clearTimeout(handler); // limpa o timeout se o usuário digitar novamente
    };
}, [searchTerm]);
const fetchTickets = useCallback(async () => {
  try {
    let response = { tickets: [], total: 0 };
    const params = {
      page: currentPage,
      limit: ticketsPerPage,
      search: debouncedSearchTerm, // aqui!
      sortField,
      sortOrder,
    };

    if (hasPermission('tickets:read_all')) {
      response = await ticketService.getAllTickets(token, params);
    } else if (hasPermission('tickets:read_own')) {
      response = await ticketService.getMyTickets(token, params);
    } else {
      setError('Você não tem permissão para visualizar tickets.');
      setLoading(false);
      return;
    }

    setTickets(Array.isArray(response.tickets) ? response.tickets : []);
    setTotalTickets(typeof response.total === 'number' ? response.total : 0);
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
}, [
  currentPage,
  ticketsPerPage,
  debouncedSearchTerm,
  sortField,
  sortOrder,
  user,
  token,
  logout,
  navigate,
]);



 {/*} const fetchTickets = useCallback(async () => {
    try {
      let response = { tickets: [], total: 0 }; // Inicializa response com valores padrão
      const params = {
        page: currentPage,
        limit: ticketsPerPage,
        search: searchTerm,
        sortField,
        sortOrder,
      };

      if (hasPermission('tickets:read_all')) {
        response = await ticketService.getAllTickets(token, params);
      } else if (hasPermission('tickets:read_own')) {
        response = await ticketService.getMyTickets(token, params);
      } else {
        setError('Você não tem permissão para visualizar tickets.');
        setLoading(false);
      }
      setTickets(Array.isArray(response.tickets) ? response.tickets : []);
      setTotalTickets(typeof response.total === 'number' ? response.total : 0);
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
  }, [currentPage, ticketsPerPage, searchTerm, sortField, sortOrder, user, token, logout, navigate]);*/}

  {/*useEffect(() => {
    if (token && user === null) {
      setLoading(true);
      return;
    }

    if (!token || user === null) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, [token, user, navigate, logout, fetchTickets]);*/}
  useEffect(() => {
    if (token && user === null) {
      setLoading(true);
      return;
    }

    if (!token || user === null) {
      navigate('/login');
      return;
    }

    // Requisição será disparada apenas quando user estiver carregado
    fetchTickets();
  }, [token, user, navigate]);


  const handleSort = (field) => {
    const order = (sortField === field && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const totalPages = Math.ceil(totalTickets / ticketsPerPage);

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-lg mx-1 ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600'}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

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
          <div className="mt-4">
            <input
              type="text"
              placeholder="Buscar tickets..."
              className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {(tickets && tickets.length === 0) ? (
            <p className="text-center text-gray-600 p-4 dark:text-gray-300">Nenhum ticket encontrado.</p>
          ) : (
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600 cursor-pointer" onClick={() => handleSort('id')}>ID {sortField === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600 cursor-pointer" onClick={() => handleSort('title')}>Título {sortField === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600 cursor-pointer" onClick={() => handleSort('status')}>Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600 cursor-pointer" onClick={() => handleSort('priority')}>Prioridade {sortField === 'priority' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600 cursor-pointer" onClick={() => handleSort('category_name')}>Categoria {sortField === 'category_name' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600 cursor-pointer" onClick={() => handleSort('created_at')}>Criado Em {sortField === 'created_at' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
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
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg mx-1 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          {renderPaginationButtons()}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg mx-1 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketListPage;
