require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { setupDatabase } = require('./src/models/databaseSetup');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedDatabase = async () => {
  try {
    console.log('Iniciando o processo de seed do banco de dados...');
    await setupDatabase(pool); // Passa o pool para setupDatabase

    // Inserir Níveis de Atendimento
    const serviceLevelsData = [
      { name: 'N1', description: 'Primeiro nível de suporte', sla_hours: 8 },
      { name: 'N2', description: 'Segundo nível de suporte', sla_hours: 24 },
      { name: 'N3', description: 'Terceiro nível de suporte', sla_hours: 48 },
    ];
    const insertedServiceLevels = {};
    for (const sl of serviceLevelsData) {
      const { rows } = await pool.query(
        'INSERT INTO service_levels (name, description, sla_hours) VALUES ($1, $2, $3) RETURNING id, name',
        [sl.name, sl.description, sl.sla_hours]
      );
      insertedServiceLevels[rows[0].name] = rows[0].id;
    }
    console.log('Níveis de Atendimento inseridos.');

    // Inserir Usuários
    const hashedPasswordAdmin = await bcrypt.hash('password', 10);
    const hashedPasswordManager = await bcrypt.hash('password', 10);
    const hashedPasswordClient = await bcrypt.hash('password', 10);

    const adminUser = await pool.query(
      'INSERT INTO users (name, email, password, role, is_active, service_level_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Admin User', 'admin@helpster.com', hashedPasswordAdmin, 'admin', true, null] // Admin não tem service_level_id
    );
    const clientUser = await pool.query(
      'INSERT INTO users (name, email, password, role, is_active, service_level_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Client User', 'client@helpster.com', hashedPasswordClient, 'user', true, null] // Cliente não tem service_level_id
    );
    const managerUser = await pool.query(
      'INSERT INTO users (name, email, password, role, is_active, service_level_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Manager User', 'manager@helpster.com', hashedPasswordManager, 'manager', true, insertedServiceLevels.N2] // Manager N2
    );
    const agentUser = await pool.query(
      'INSERT INTO users (name, email, password, role, is_active, service_level_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Agent User', 'agent@helpster.com', hashedPasswordClient, 'agent', true, insertedServiceLevels.N1] // Agente N1
    );
    const adminId = adminUser.rows[0].id;
    const managerId = managerUser.rows[0].id;
    const clientId = clientUser.rows[0].id;
    const agentId = agentUser.rows[0].id;
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
      { name: 'admin', is_active: true },
      { name: 'manager', is_active: true },
      { name: 'user', is_active: true },
      { name: 'agent', is_active: true },
    ];

    const insertedRoles = {};
    for (const role of roles) {
      const { rows } = await pool.query(
        'INSERT INTO roles (name, is_active, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name',
        [role.name, role.is_active]
      );
      insertedRoles[rows[0].name] = rows[0].id;
    }
    console.log('Perfis (Roles) inseridos.');

    // Associar Permissões aos Perfis
    // Admin: Todas as permissões
    for (const permName in insertedPermissions) {
      console.log(`Inserting permission ${permName} (${insertedPermissions[permName]}) for admin role (${insertedRoles.admin})`);
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
      console.log(`Inserting permission ${permName} (${insertedPermissions[permName]}) for manager role (${insertedRoles.manager})`);
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
      console.log(`Inserting permission ${permName} (${insertedPermissions[permName]}) for user role (${insertedRoles.user})`);
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [insertedRoles.user, insertedPermissions[permName]]
      );
    }
    console.log('Permissões associadas aos perfis.');

    // Inserir Status de Ticket
    const ticketStatusesData = [
      { name: 'Aberto', description: 'Ticket recém-criado', sla_hours: 2 },
      { name: 'Em Andamento', description: 'Ticket sendo trabalhado', sla_hours: 4 },
      { name: 'Aguardando Cliente', description: 'Aguardando informações do cliente', sla_hours: 72 },
      { name: 'Resolvido', description: 'Ticket solucionado', sla_hours: 0 },
      { name: 'Fechado', description: 'Ticket encerrado', sla_hours: 0 },
    ];
    const insertedTicketStatuses = {};
    for (const ts of ticketStatusesData) {
      const { rows } = await pool.query(
        'INSERT INTO ticket_statuses (name, description, sla_hours) VALUES ($1, $2, $3) RETURNING id, name',
        [ts.name, ts.description, ts.sla_hours]
      );
      insertedTicketStatuses[rows[0].name] = rows[0].id;
    }
    console.log('Status de Ticket inseridos.');

    // Inserir Prioridades de Ticket
    const ticketPrioritiesData = [
      { name: 'Baixa', description: 'Baixa prioridade', sla_hours: 168 }, // 1 semana
      { name: 'Média', description: 'Média prioridade', sla_hours: 72 }, // 3 dias
      { name: 'Alta', description: 'Alta prioridade', sla_hours: 24 }, // 1 dia
      { name: 'Urgente', description: 'Urgente, requer atenção imediata', sla_hours: 4 }, // 4 horas
    ];
    const insertedTicketPriorities = {};
    for (const tp of ticketPrioritiesData) {
      const { rows } = await pool.query(
        'INSERT INTO ticket_priorities (name, description, sla_hours) VALUES ($1, $2, $3) RETURNING id, name',
        [tp.name, tp.description, tp.sla_hours]
      );
      insertedTicketPriorities[rows[0].name] = rows[0].id;
    }
    console.log('Prioridades de Ticket inseridas.');

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
    const users = [adminId, managerId, clientId, agentId];

    for (let i = 0; i < 30; i++) {
      const randomCategory = insertedCategories[Math.floor(Math.random() * insertedCategories.length)];
      const randomStatusName = Object.keys(insertedTicketStatuses)[Math.floor(Math.random() * Object.keys(insertedTicketStatuses).length)];
      const randomPriorityName = Object.keys(insertedTicketPriorities)[Math.floor(Math.random() * Object.keys(insertedTicketPriorities).length)];
      const randomServiceLevelName = Object.keys(insertedServiceLevels)[Math.floor(Math.random() * Object.keys(insertedServiceLevels).length)];

      const randomStatusId = insertedTicketStatuses[randomStatusName];
      const randomPriorityId = insertedTicketPriorities[randomPriorityName];
      const randomServiceLevelId = insertedServiceLevels[randomServiceLevelName];

      const randomClient = users[Math.floor(Math.random() * users.length)];
      const randomAgent = Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)] : null; // 50% chance de ter agente

      await pool.query(
        `INSERT INTO tickets (title, description, status_id, priority_id, service_level_id, client_id, agent_id, category_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL '${i} days')`,
        [
          `Ticket ${i + 1}: Problema com ${randomCategory.name}`,
          `Descrição detalhada do problema ${i + 1} relacionado a ${randomCategory.name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`, 
          randomStatusId,
          randomPriorityId,
          randomServiceLevelId,
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
