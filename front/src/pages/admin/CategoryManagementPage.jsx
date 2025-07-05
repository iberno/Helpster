import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import categoryService from '../../services/categoryService';
import BackButton from '../../components/BackButton';

const CategoryManagementPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories(token);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      alert('Falha ao buscar categorias.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('O nome da categoria não pode ser vazio.');
      return;
    }
    try {
      await categoryService.createCategory(token, { name: newCategoryName, description: newCategoryDescription });
      setNewCategoryName('');
      setNewCategoryDescription('');
      fetchCategories();
      alert('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert(error.message || 'Falha ao criar categoria.');
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category.id);
    setEditName(category.name);
    setEditDescription(category.description);
  };

  const handleUpdateCategory = async (id) => {
    try {
      await categoryService.updateCategory(token, id, { name: editName, description: editDescription });
      setEditingCategory(null);
      fetchCategories();
      alert('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      alert(error.message || 'Falha ao atualizar categoria.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        await categoryService.deleteCategory(token, id);
        fetchCategories();
        alert('Categoria deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        alert(error.message || 'Falha ao deletar categoria.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton to="/admin" />
        <h1 className="text-3xl font-bold text-center flex-grow">Gerenciamento de Categorias</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Criar Nova Categoria</h2>
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label htmlFor="newCategoryName" className="block text-gray-700 text-sm font-bold mb-2">Nome:</label>
            <input
              type="text"
              id="newCategoryName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="newCategoryDescription" className="block text-gray-700 text-sm font-bold mb-2">Descrição:</label>
            <textarea
              id="newCategoryDescription"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Adicionar Categoria
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Categorias Existentes</h2>
        {categories.length === 0 ? (
          <p className="text-gray-600">Nenhuma categoria encontrada.</p>
        ) : (
          <ul className="space-y-4">
            {categories.map((category) => (
              <li key={category.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                {editingCategory === category.id ? (
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-1">Nome:</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-1">Descrição:</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      ></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-2 mt-4 md:mt-0">
                      <button
                        onClick={() => handleUpdateCategory(category.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                )}
                {editingCategory !== category.id && (
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Deletar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryManagementPage;
