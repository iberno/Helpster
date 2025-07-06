import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import ticketService from '../services/ticketService';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useAlert } from '../contexts/AlertContext';

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
  const { showAlert } = useAlert();

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
          setCategory(fetchedCategories[0].id);
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
      showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    try {
      await ticketService.createTicket(token, {
        title,
        description,
        category_id: category,
        priority,
      });
      showAlert('Ticket criado com sucesso!', 'success');
      navigate('/tickets');
    } catch (err) {
      console.error('Erro ao criar ticket:', err);
      showAlert(err.message || 'Falha ao criar ticket.', 'error');
    }
  };

  if (loadingCategories) {
    return <div className="w-full text-center mt-8">Carregando formulário...</div>;
  }

  if (error) {
    return <div className="w-full text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-zinc-800 dark:text-gray-100 border-0">
        <div className="rounded-t bg-white dark:bg-zinc-700 mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-gray-800 dark:text-gray-100 text-xl font-bold">Abrir Novo Ticket</h6>
            <BackButton />
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleSubmit}>
            <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">Detalhes do Ticket</h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Título</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" required />
                </div>
              </div>
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Descrição</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" rows="4" required></textarea>
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Categoria</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" required>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Prioridade</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <button type="submit" className="bg-blue-500 text-white active:bg-blue-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">Criar Ticket</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;

//