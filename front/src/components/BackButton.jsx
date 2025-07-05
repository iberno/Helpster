import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, text = 'Voltar' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {text}
    </button>
  );
};

export default BackButton;
