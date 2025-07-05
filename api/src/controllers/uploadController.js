const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para armazenamento de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/kb_images'); // Diretório onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// @desc    Upload de imagem para a Base de Conhecimento
// @route   POST /api/kb/upload-image
// @access  Privado (Admin, Manager)
const uploadKbImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Nenhum arquivo de imagem enviado.');
  }

  // Retorna a URL pública da imagem
  const imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/kb_images/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

module.exports = {
  uploadKbImage,
  upload, // Exporta a instância do multer para uso nas rotas
};
