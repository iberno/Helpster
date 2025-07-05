const asyncHandler = require('express-async-handler');
const fs = require('fs').promises;
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', '..' , 'knowledge_base_articles');

// Helper para garantir que o diretório existe
const ensureArticlesDir = async () => {
  try {
    await fs.mkdir(ARTICLES_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório de artigos:', error);
    throw new Error('Erro interno do servidor ao preparar diretório de artigos.');
  }
};

// @desc    Criar um novo artigo da Base de Conhecimento
// @route   POST /api/kb/articles
// @access  Privado (Admin, Manager)
const createArticle = asyncHandler(async (req, res) => {
  await ensureArticlesDir();
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Título e conteúdo do artigo são obrigatórios.');
  }

  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.md`;
  const filePath = path.join(ARTICLES_DIR, filename);

  try {
    await fs.writeFile(filePath, content);
    res.status(201).json({ message: 'Artigo criado com sucesso!', filename, title });
  } catch (error) {
    console.error('Erro ao salvar artigo:', error);
    res.status(500);
    throw new Error('Erro interno do servidor ao salvar artigo.');
  }
});

// @desc    Listar todos os artigos da Base de Conhecimento
// @route   GET /api/kb/articles
// @access  Público (Autenticado)
const getAllArticles = asyncHandler(async (req, res) => {
  await ensureArticlesDir();
  try {
    const files = await fs.readdir(ARTICLES_DIR);
    const articles = [];
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(ARTICLES_DIR, file);
        let articleTitle = '';
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const firstLine = content.split('\n')[0];
          if (firstLine.startsWith('# ')) {
            articleTitle = firstLine.substring(2).trim();
          } else {
            // Fallback para extrair do nome do arquivo se não for um H1
            articleTitle = file.split('-').slice(0, -1).join(' ').replace(/-/g, ' ');
            articleTitle = articleTitle.charAt(0).toUpperCase() + articleTitle.slice(1);
          }
        } catch (readErr) {
          console.warn(`Could not read file ${file} for title extraction, using filename fallback.`, readErr);
          articleTitle = file.split('-').slice(0, -1).join(' ').replace(/-/g, ' ');
          articleTitle = articleTitle.charAt(0).toUpperCase() + articleTitle.slice(1);
        }
        articles.push({ id: file, title: articleTitle });
      }
    }
    res.status(200).json(articles);
  } catch (error) {
    console.error('Erro ao listar artigos:', error);
    res.status(500);
    throw new Error('Erro interno do servidor ao listar artigos.');
  }
});

// @desc    Obter o conteúdo de um artigo específico
// @route   GET /api/kb/articles/:id
// @access  Público (Autenticado)
const getArticleById = asyncHandler(async (req, res) => {
  const { id } = req.params; // id aqui é o filename
  const filePath = path.join(ARTICLES_DIR, id);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    let title = '';
    const firstLine = content.split('\n')[0];
    if (firstLine.startsWith('# ')) {
      title = firstLine.substring(2).trim();
    } else {
      title = id.split('-').slice(0, -1).join(' ').replace(/-/g, ' ');
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    res.status(200).json({ id, title, content });
  } catch (error) {

    if (error.code === 'ENOENT') {
      res.status(404);
      throw new Error('Artigo não encontrado.');
    }
    console.error('Erro ao ler artigo:', error);
    res.status(500);
    throw new Error('Erro interno do servidor ao ler artigo.');
  }
});

// @desc    Atualizar um artigo existente
// @route   PUT /api/kb/articles/:id
// @access  Privado (Admin, Manager)
const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params; // id aqui é o filename
  const { title, content } = req.body;
  const filePath = path.join(ARTICLES_DIR, id);

  if (!title || !content) {
    res.status(400);
    throw new Error('Título e conteúdo do artigo são obrigatórios.');
  }

  try {
    // Para simplificar, vamos apenas sobrescrever o arquivo existente.
    // Em uma aplicação real, você pode querer renomear ou criar um novo arquivo se o título mudar.
    await fs.writeFile(filePath, content);
    res.status(200).json({ message: 'Artigo atualizado com sucesso!', filename: id, title });
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error);
    res.status(500);
    throw new Error('Erro interno do servidor ao atualizar artigo.');
  }
});

// @desc    Deletar um artigo
// @route   DELETE /api/kb/articles/:id
// @access  Privado (Admin, Manager)
const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params; // id aqui é o filename
  const filePath = path.join(ARTICLES_DIR, id);

  try {
    await fs.unlink(filePath);
    res.status(200).json({ message: 'Artigo deletado com sucesso!' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404);
      throw new Error('Artigo não encontrado.');
    }
    console.error('Erro ao deletar artigo:', error);
    res.status(500);
    throw new Error('Erro interno do servidor ao deletar artigo.');
  }
});

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
