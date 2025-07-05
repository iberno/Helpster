import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import categoryService from '../../services/categoryService';
import BackButton from '../../components/BackButton';
import { useAlert } from '../../contexts/AlertContext';

const CategoryManagementPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchCategories();
  }, [token, showAlert]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories(token);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      showAlert('Falha ao buscar categorias.', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showAlert('O nome da categoria não pode ser vazio.', 'error');
      return;
    }
    try {
      await categoryService.createCategory(token, { name: newCategoryName, description: newCategoryDescription });
      setNewCategoryName('');
      setNewCategoryDescription('');
      fetchCategories();
      showAlert('Categoria criada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      showAlert(error.message || 'Falha ao criar categoria.', 'error');
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
      showAlert('Categoria atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      showAlert(error.message || 'Falha ao atualizar categoria.', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        await categoryService.deleteCategory(token, id);
        fetchCategories();
        showAlert('Categoria deletada com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        showAlert(error.message || 'Falha ao deletar categoria.', 'error');
      }
    }
  };

  return (
    <div className="w-full px-4">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-zinc-800 dark:text-gray-100 border-0">
        <div className="rounded-t bg-white dark:bg-zinc-700 mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-gray-800 dark:text-gray-100 text-xl font-bold">Gerenciamento de Categorias</h6>
            <BackButton to="/admin" />
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleCreateCategory}>
            <h6 className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">Criar Nova Categoria</h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Nome</label>
                  <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" required />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-gray-600 dark:text-gray-300 text-xs font-bold mb-2">Descrição</label>
                  <textarea value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} className="border-0 px-3 py-3 placeholder-gray-300 text-gray-800 bg-gray-100 dark:bg-zinc-700 dark:text-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"></textarea>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <button type="submit" className="bg-blue-500 text-white active:bg-blue-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">Criar Categoria</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded dark:bg-zinc-800 dark:text-gray-100">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-gray-50 dark:bg-zinc-700">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100">Categorias Existentes</h3>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Nome</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Descrição</th>
                <th className="px-6 bg-gray-50 text-gray-500 align-middle border border-solid border-gray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="dark:bg-zinc-800">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{category.name}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">{category.description}</td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 dark:border-zinc-700">
                    <button onClick={() => handleEditClick(category)} className="bg-yellow-500 text-white active:bg-yellow-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">Editar</button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="bg-red-500 text-white active:bg-red-600 font-bold py-2 px-4 rounded-lg text-sm transition duration-200">Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementPage;
