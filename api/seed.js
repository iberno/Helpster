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

    // Inserir Permissões
    const permissions = [
      { name: 'users:manage', description: 'Gerenciar usuários' },
      { name: 'roles:manage', description: 'Gerenciar perfis e permissões' },
      { name: 'tickets:create', description: 'Criar tickets' },
      { name: 'tickets:read_own', description: 'Visualizar próprios tickets' },
      { name: 'tickets:read_all', description: 'Visualizar todos os tickets' },
      { name: 'tickets:assign', description: 'Atribuir tickets' },
      { name: 'tickets:update', description: 'Atualizar tickets' },
      { name: 'tickets:reassign_level', description: 'Redirecionar tickets entre níveis' },
      { name: 'tickets:reassign_any', description: 'Redirecionar qualquer ticket' },
      { name: 'comments:add_public', description: 'Adicionar comentários públicos' },
      { name: 'comments:add_internal', description: 'Adicionar comentários internos' },
      { name: 'categories:manage', description: 'Gerenciar categorias' },
      { name: 'dashboard:view', description: 'Visualizar dashboard' },
      { name: 'system:manage_settings', description: 'Gerenciar configurações do sistema' },
    ];

    const insertedPermissions = {};
    for (const perm of permissions) {
      const { rows } = await pool.query(
        'INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING id, name',
        [perm.name, perm.description]
      );
      insertedPermissions[rows[0].name] = rows[0].id;
    }
    console.log('Permissões inseridas.');

    // Inserir Perfis (Roles)
    const roles = [
      { name: 'admin' },
      { name: 'manager' },
      { name: 'user' },
    ];

    const insertedRoles = {};
    for (const role of roles) {
      const { rows } = await pool.query(
        'INSERT INTO roles (name) VALUES ($1) RETURNING id, name',
        [role.name]
      );
      insertedRoles[rows[0].name] = rows[0].id;
    }
    console.log('Perfis (Roles) inseridos.');

    // Associar Permissões aos Perfis
    // Admin: Todas as permissões
    for (const permName in insertedPermissions) {
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [insertedRoles.admin, insertedPermissions[permName]]
      );
    }

    // Manager: Permissões específicas
    const managerPermissions = [
      'tickets:read_all',
      'tickets:assign',
      'tickets:update',
      'tickets:reassign_level',
      'comments:add_public',
      'comments:add_internal',
      'dashboard:view',
    ];
    for (const permName of managerPermissions) {
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [insertedRoles.manager, insertedPermissions[permName]]
      );
    }

    // User: Permissões específicas
    const userPermissions = [
      'tickets:create',
      'tickets:read_own',
      'comments:add_public',
    ];
    for (const permName of userPermissions) {
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [insertedRoles.user, insertedPermissions[permName]]
      );
    }
    console.log('Permissões associadas aos perfis.');

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
