import React, { useState } from 'react';

const AuthForm = ({ onSubmit, isRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-100 dark:placeholder-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-100 dark:placeholder-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="text-center">
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-200"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
