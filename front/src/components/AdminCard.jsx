import React from 'react';
import { Link } from 'react-router-dom';

const AdminCard = ({ title, description, linkTo, linkText, bgColorClass }) => {
  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      <Link to={linkTo} className={`${bgColorClass} text-white px-4 py-2 rounded hover:opacity-90 transition duration-200`}>
        {linkText}
      </Link>
    </div>
  );
};

export default AdminCard;
