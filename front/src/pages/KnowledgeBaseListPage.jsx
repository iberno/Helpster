import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import knowledgeBaseService from '../services/knowledgeBaseService';
import { useNavigate, Link } from 'react-router-dom';

const KnowledgeBaseListPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        alert('Artigo deletado com sucesso!');
      } catch (err) {
        console.error('Erro ao deletar artigo:', err);
        alert(err.message || 'Falha ao deletar artigo.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Carregando artigos...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <h1 className="text-3xl font-bold text-center flex-grow">Base de Conhecimento</h1>
      </div>

      {isAgentOrAdmin && (
        <div className="mb-4 text-right">
          <Link to="/knowledge-base/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Criar Novo Artigo
          </Link>
        </div>
      )}

      {articles.length === 0 ? (
        <p className="text-center text-gray-600">Nenhum artigo encontrado na Base de Conhecimento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col">
              <h2 className="text-xl font-bold mb-2">{article.title}</h2>
              <p className="text-gray-600 text-sm mb-4 flex-grow">{article.id}</p>
              <div className="flex justify-end space-x-2 mt-auto">
                <Link to={`/knowledge-base/${article.id}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
                  Ver Artigo
                </Link>
                {isAgentOrAdmin && (
                  <>
                    <Link to={`/knowledge-base/${article.id}/edit`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm">
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Deletar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseListPage;
