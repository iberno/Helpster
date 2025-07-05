import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import knowledgeBaseService from '../services/knowledgeBaseService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const KnowledgeBaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchArticle = async () => {
      try {
        const fetchedArticle = await knowledgeBaseService.getArticleById(token, id, signal);
        setArticle(fetchedArticle);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Erro ao buscar artigo:', err);
          setError(err.message || 'Erro ao carregar artigo.');
          if (err.message === 'Token inválido ou expirado.') {
            logout();
            navigate('/login');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();

    return () => {
      controller.abort();
    };
  }, [id, token, navigate, logout]);

  if (loading) {
    return <div className="text-center mt-8">Carregando artigo...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  if (!article) {
    return <div className="text-center mt-8 text-gray-600">Artigo não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('/knowledge-base')}
          className="flex items-center text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-center flex-grow">{article.title}</h1>
      </div>
      <div className="prose max-w-none bg-white p-8 rounded-lg shadow-lg">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          children={article.content}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={dracula}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
      </div>
    </div>
  );
};

export default KnowledgeBaseDetailPage;
