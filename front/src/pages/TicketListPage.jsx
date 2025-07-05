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
    // Se o token existe mas o usuário ainda não foi decodificado, espere.
    if (token && user === null) {
      setLoading(true);
      return;
    }

    // Se não há token ou usuário é null após o carregamento, redirecione para o login.
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
    return <div className="text-center mt-8">Carregando tickets...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Meus Tickets</h1>
      {(user?.role === 'user' || user?.role === 'admin' || user?.role === 'manager') && (
        <div className="mb-4 text-right">
          <Link to="/tickets/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Abrir Novo Ticket
          </Link>
        </div>
      )}

      {tickets.length === 0 ? (
        <p className="text-center text-gray-600">Nenhum ticket encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Título</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Prioridade</th>
                <th className="py-3 px-4 text-left">Categoria</th>
                <th className="py-3 px-4 text-left">Criado Em</th>
                <th className="py-3 px-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4">{ticket.id}</td>
                  <td className="py-3 px-4">{ticket.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${ticket.status === 'Aberto' ? 'bg-red-200 text-red-800' :
                        ticket.status === 'Em Andamento' ? 'bg-yellow-200 text-yellow-800' :
                        ticket.status === 'Aguardando Cliente' ? 'bg-orange-200 text-orange-800' :
                        ticket.status === 'Resolvido' ? 'bg-green-200 text-green-800' :
                        'bg-gray-200 text-gray-800'}
                    `}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${ticket.priority === 'Urgente' ? 'bg-red-200 text-red-800' :
                        ticket.priority === 'Alta' ? 'bg-orange-200 text-orange-800' :
                        ticket.priority === 'Média' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'}
                    `}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">{ticket.category_name}</td>
                  <td className="py-3 px-4">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Link to={`/tickets/${ticket.id}`} className="text-blue-500 hover:underline">
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketListPage;
