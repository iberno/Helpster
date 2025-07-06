import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import knowledgeBaseService from '../../services/knowledgeBaseService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import BackButton from '../../components/BackButton';
import { useAlert } from '../../contexts/AlertContext';

const KnowledgeBaseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  const isEditing = Boolean(id);

  useEffect(() => {
    if (token && user === null) {
      setLoading(true);
      return;
    }

    if (!token || (user?.role !== 'admin' && user?.role !== 'manager')) {
      showAlert('Acesso negado.', 'error');
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
  }, [id, isEditing, token, user, navigate, showAlert]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await knowledgeBaseService.uploadKbImage(token, file);
      const imageUrl = response.imageUrl;
      setContent(prevContent => `${prevContent}\n![${file.name}](${imageUrl})\n`);
      showAlert('Imagem carregada com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao carregar imagem:', err);
      showAlert(err.message || 'Falha ao carregar imagem.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showAlert('Título e conteúdo não podem ser vazios.', 'error');
      return;
    }

    try {
      if (isEditing) {
        await knowledgeBaseService.updateArticle(token, id, { title, content });
        showAlert('Artigo atualizado com sucesso!', 'success');
      } else {
        await knowledgeBaseService.createArticle(token, { title, content });
        showAlert('Artigo criado com sucesso!', 'success');
      }
      navigate('/knowledge-base');
    } catch (err) {
      console.error('Erro ao salvar artigo:', err);
      showAlert(err.message || 'Falha ao salvar artigo.', 'error');
    }
  };

  if (loading) {
    return <div className="w-full text-center mt-8">Carregando...</div>;
  }

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-blueGray-700 text-xl font-bold">{isEditing ? 'Editar Artigo' : 'Criar Novo Artigo'}</h6>
            <BackButton />
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleSubmit}>
            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">Conteúdo do Artigo</h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Título</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" required />
                </div>
              </div>
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Conteúdo (Markdown)</label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" rows="10" required></textarea>
                </div>
              </div>
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Upload de Imagem</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <button type="submit" className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150">{isEditing ? 'Atualizar Artigo' : 'Criar Artigo'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <h6 className="text-blueGray-700 text-xl font-bold">Pré-visualização</h6>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
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
    </div>
  );
};

export default KnowledgeBaseFormPage;

