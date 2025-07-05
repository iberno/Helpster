import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import knowledgeBaseService from '../services/knowledgeBaseService';
import { useNavigate, Link } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';

const KnowledgeBaseListPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showAlert } = useAlert();

  const isAgentOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchArticles = async () => {
      try {
        const fetchedArticles = await knowledgeBaseService.getAllArticles(token);
        setArticles(fetchedArticles);
      } catch (err) {
        console.error('Erro ao buscar artigos:', err);
        setError(err.message || 'Erro ao carregar artigos.');
        if (err.message === 'Token inválido ou expirado.') {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [token, navigate, logout]);

  const handleDeleteArticle = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este artigo?')) {
      try {
        await knowledgeBaseService.deleteArticle(token, id);
        setArticles(articles.filter(article => article.id !== id));
        showAlert('Artigo deletado com sucesso!', 'success');
      } catch (err) {
        console.error('Erro ao deletar artigo:', err);
        showAlert(err.message || 'Falha ao deletar artigo.', 'error');
      }
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="w-full text-center mt-8">Carregando artigos...</div>;
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
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100">Base de Conhecimento</h3>
            </div>
            {isAgentOrAdmin && (
              <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                <Link to="/knowledge-base/new" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-200">
                  Novo Artigo
                </Link>
              </div>
            )}
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Buscar artigos..."
              className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="block w-full overflow-x-auto p-4">
          {filteredArticles.length === 0 ? (
            <p className="text-center text-gray-600 p-4 dark:text-gray-300">Nenhum artigo encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col dark:bg-zinc-800 dark:border-zinc-700">
                  <div className="p-6 flex-grow">
                    <h5 className="text-lg font-semibold text-gray-800 mb-2 truncate dark:text-gray-100">{article.title}</h5>
                    <p className="text-gray-600 text-sm mb-4 dark:text-gray-300">{article.content && `${article.content.substring(0, 120)}...`}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-200 mt-auto dark:bg-zinc-700 dark:border-zinc-600">
                    <div className="flex justify-end items-center space-x-4">
                      <Link to={`/knowledge-base/${article.id}`} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                        Ver Detalhes
                      </Link>
                      {isAgentOrAdmin && (
                        <>
                          <Link to={`/knowledge-base/${article.id}/edit`} className="text-sm font-medium text-yellow-600 hover:underline dark:text-yellow-400">
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                          >
                            Deletar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseListPage;
