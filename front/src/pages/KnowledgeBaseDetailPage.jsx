import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import knowledgeBaseService from '../services/knowledgeBaseService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import BackButton from '../components/BackButton';

const KnowledgeBaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
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
    return <div className="w-full text-center mt-8">Carregando artigo...</div>;
  }

  if (error) {
    return <div className="w-full text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  if (!article) {
    return <div className="w-full text-center mt-8 text-gray-600">Artigo não encontrado.</div>;
  }

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg dark:bg-zinc-800 dark:text-gray-100">
        <div className="rounded-t mb-0 px-6 py-6 border-b border-gray-200 dark:bg-zinc-700 dark:border-zinc-600">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-100">{article.title}</h3>
            <BackButton />
          </div>
        </div>
        <div className="flex-auto p-6">
          <div className="prose max-w-none dark:text-gray-100">
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
      </div>
    </div>
  );
};

export default KnowledgeBaseDetailPage;

