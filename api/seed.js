require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedDatabase = async () => {
  try {
    console.log('Iniciando o processo de seed do banco de dados...');

    // Limpar tabelas (ordem inversa das dependências)
    await pool.query('DELETE FROM comments;');
    await pool.query('DELETE FROM tickets;');
    await pool.query('DELETE FROM categories;');
    await pool.query('DELETE FROM users;');
    console.log('Tabelas limpas.');

    // Inserir Usuários
    const hashedPasswordAdmin = await bcrypt.hash('password', 10);
    const hashedPasswordManager = await bcrypt.hash('password', 10);
    const hashedPasswordClient = await bcrypt.hash('password', 10);

    const adminUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Admin User', 'admin@helpster.com', hashedPasswordAdmin, 'admin']
    );
    const managerUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Manager User', 'manager@helpster.com', hashedPasswordManager, 'manager']
    );
    const clientUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Client User', 'client@helpster.com', hashedPasswordClient, 'user']
    );

    const adminId = adminUser.rows[0].id;
    const managerId = managerUser.rows[0].id;
    const clientId = clientUser.rows[0].id;
    console.log('Usuários inseridos.');

    // Inserir Categorias
    const categories = [
      { name: 'Hardware', description: 'Problemas relacionados a componentes físicos.' },
      { name: 'Software', description: 'Problemas com programas e sistemas operacionais.' },
      { name: 'Rede', description: 'Problemas de conectividade e acesso à rede.' },
      { name: 'Acesso', description: 'Problemas de login e permissões.' },
      { name: 'Outros', description: 'Categorias não listadas.' },
    ];

    const insertedCategories = [];
    for (const cat of categories) {
      const { rows } = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id, name',
        [cat.name, cat.description]
      );
      insertedCategories.push(rows[0]);
    }
    console.log('Categorias inseridas.');

    // Inserir Tickets Aleatórios
    const statuses = ['Aberto', 'Em Andamento', 'Resolvido', 'Fechado', 'Aguardando Cliente'];
    const priorities = ['Baixa', 'Média', 'Alta', 'Urgente'];
    const supportLevels = ['N1', 'N2', 'N3'];
    const users = [adminId, managerId, clientId];

    for (let i = 0; i < 30; i++) {
      const randomCategory = insertedCategories[Math.floor(Math.random() * insertedCategories.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomSupportLevel = supportLevels[Math.floor(Math.random() * supportLevels.length)];
      const randomClient = users[Math.floor(Math.random() * users.length)];
      const randomAgent = Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)] : null; // 50% chance de ter agente

      await pool.query(
        `INSERT INTO tickets (title, description, status, priority, support_level, client_id, agent_id, category_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL '${i} days')`,
        [
          `Ticket ${i + 1}: Problema com ${randomCategory.name}`,
          `Descrição detalhada do problema ${i + 1} relacionado a ${randomCategory.name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`, 
          randomStatus,
          randomPriority,
          randomSupportLevel,
          randomClient,
          randomAgent,
          randomCategory.id,
        ]
      );
    }
    console.log('30 tickets aleatórios inseridos.');

    // Inserir alguns comentários
    const allTickets = await pool.query('SELECT id FROM tickets LIMIT 5');
    for (const ticket of allTickets.rows) {
      await pool.query(
        'INSERT INTO comments (content, visibility, ticket_id, author_id) VALUES ($1, $2, $3, $4)',
        ['Este é um comentário público do cliente.', 'Público', ticket.id, clientId]
      );
      await pool.query(
        'INSERT INTO comments (content, visibility, ticket_id, author_id) VALUES ($1, $2, $3, $4)',
        ['Esta é uma nota interna do agente.', 'Interno', ticket.id, managerId]
      );
    }
    console.log('Comentários inseridos.');

    console.log('Processo de seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de seed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedDatabase();
