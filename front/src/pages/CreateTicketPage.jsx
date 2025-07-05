import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import ticketService from '../services/ticketService';
import { useNavigate } from 'react-router-dom';

const CreateTicketPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Média');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const fetchedCategories = await ticketService.getCategories(token);
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
          setCategory(fetchedCategories[0].id); // Seleciona a primeira categoria por padrão
        }
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        setError(err.message || 'Erro ao carregar categorias.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await ticketService.createTicket(token, {
        title,
        description,
        category_id: category,
        priority,
      });
      alert('Ticket criado com sucesso!');
      navigate('/tickets');
    } catch (err) {
      console.error('Erro ao criar ticket:', err);
      alert(err.message || 'Falha ao criar ticket.');
    }
  };

  if (loadingCategories) {
    return <div className="text-center mt-8">Carregando formulário...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-center flex-grow">Abrir Novo Ticket</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto space-y-6">
        <div>
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Título:</label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Descrição:</label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Categoria:</label>
          <select
            id="category"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-gray-700 text-sm font-bold mb-2">Prioridade:</label>
          <select
            id="priority"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
            <option value="Urgente">Urgente</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Criar Ticket
        </button>
      </form>
    </div>
  );
};

export default CreateTicketPage;
