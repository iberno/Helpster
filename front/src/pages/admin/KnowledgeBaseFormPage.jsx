import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import knowledgeBaseService from '../../services/knowledgeBaseService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Para tabelas, checklists, etc.
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import BackButton from '../../components/BackButton';

const KnowledgeBaseFormPage = () => {
  const { id } = useParams(); // Para edição
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isEditing = Boolean(id);

  useEffect(() => {
    // Se o token existe mas o usuário ainda não foi decodificado, espere.
    if (token && user === null) {
      setLoading(true);
      return;
    }

    // Se não há token ou a role não é permitida, redirecione.
    if (!token || (user?.role !== 'admin' && user?.role !== 'manager')) {
      alert('Acesso negado. Apenas administradores e gerentes podem gerenciar a Base de Conhecimento.');
      navigate('/login');
      return;
    }

    if (isEditing) {
      const fetchArticle = async () => {
        try {
          const fetchedArticle = await knowledgeBaseService.getArticleById(token, id);
          setTitle(fetchedArticle.title);
          setContent(fetchedArticle.content);
        } catch (err) {
          console.error('Erro ao buscar artigo para edição:', err);
          setError(err.message || 'Erro ao carregar artigo para edição.');
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    } else {
      setLoading(false);
    }
  }, [id, isEditing, token, user, navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await knowledgeBaseService.uploadKbImage(token, file);
      const imageUrl = response.imageUrl;
      // Insere a URL da imagem no conteúdo do Markdown
      setContent(prevContent => `${prevContent}\n![${file.name}](${imageUrl})\n`);
      alert('Imagem carregada com sucesso!');
    } catch (err) {
      console.error('Erro ao carregar imagem:', err);
      alert(err.message || 'Falha ao carregar imagem.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Título e conteúdo não podem ser vazios.');
      return;
    }

    try {
      if (isEditing) {
        await knowledgeBaseService.updateArticle(token, id, { title, content });
        alert('Artigo atualizado com sucesso!');
      } else {
        await knowledgeBaseService.createArticle(token, { title, content });
        alert('Artigo criado com sucesso!');
      }
      navigate('/knowledge-base'); // Redireciona para a lista de artigos
    } catch (err) {
      console.error('Erro ao salvar artigo:', err);
      alert(err.message || 'Falha ao salvar artigo.');
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton to="/admin" />
        <button
          onClick={() => navigate('/knowledge-base')}
          className="flex items-center text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-center flex-grow">{isEditing ? 'Editar Artigo' : 'Criar Novo Artigo'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto space-y-6">
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
          <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Conteúdo (Markdown):</label>
          <textarea
            id="content"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-64 font-mono"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="flex items-center space-x-4">
          <label className="block text-gray-700 text-sm font-bold">Upload de Imagem:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          {isEditing ? 'Atualizar Artigo' : 'Criar Artigo'}
        </button>
      </form>

      <div className="mt-8 p-8 bg-gray-50 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold mb-4">Pré-visualização do Artigo:</h2>
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            children={content}
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
  );
};

export default KnowledgeBaseFormPage;
