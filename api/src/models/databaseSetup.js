const setupDatabase = async (pool) => {
  console.log('Iniciando a configuração do banco de dados para o Helpster...');
  try {
    // Tabela de Usuários
    console.log('Dropping table users if exists...');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('Table users dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        service_level_id INTEGER REFERENCES service_levels(id), -- Novo campo
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "users" verificada/criada.');

    // Tabela de Categorias de Tickets
    console.log('Dropping table categories if exists...');
    await pool.query('DROP TABLE IF EXISTS categories CASCADE;');
    console.log('Table categories dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT
      );
    `);
    console.log('Tabela "categories" verificada/criada.');

    // Tabela de Níveis de Atendimento
    console.log('Dropping table service_levels if exists...');
    await pool.query('DROP TABLE IF EXISTS service_levels CASCADE;');
    console.log('Table service_levels dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_levels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        sla_hours INTEGER NOT NULL
      );
    `);
    console.log('Tabela "service_levels" verificada/criada.');

    // Tabela de Status de Ticket
    console.log('Dropping table ticket_statuses if exists...');
    await pool.query('DROP TABLE IF EXISTS ticket_statuses CASCADE;');
    console.log('Table ticket_statuses dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_statuses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        sla_hours INTEGER NOT NULL
      );
    `);
    console.log('Tabela "ticket_statuses" verificada/criada.');

    // Tabela de Prioridades de Ticket
    console.log('Dropping table ticket_priorities if exists...');
    await pool.query('DROP TABLE IF EXISTS ticket_priorities CASCADE;');
    console.log('Table ticket_priorities dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_priorities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        sla_hours INTEGER NOT NULL
      );
    `);
    console.log('Tabela "ticket_priorities" verificada/criada.');

    // Tabela de Tickets
    console.log('Dropping table tickets if exists...');
    await pool.query('DROP TABLE IF EXISTS tickets CASCADE;');
    console.log('Table tickets dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status_id INTEGER NOT NULL REFERENCES ticket_statuses(id),
        priority_id INTEGER NOT NULL REFERENCES ticket_priorities(id),
        service_level_id INTEGER NOT NULL REFERENCES service_levels(id),
        client_id INTEGER NOT NULL REFERENCES users(id),
        agent_id INTEGER REFERENCES users(id),
        category_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "tickets" verificada/criada.');

    // Tabela de Comentários dos Tickets
    console.log('Dropping table comments if exists...');
    await pool.query('DROP TABLE IF EXISTS comments CASCADE;');
    console.log('Table comments dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        visibility VARCHAR(20) NOT NULL DEFAULT 'Público', -- 'Público' ou 'Interno'
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "comments" verificada/criada.');

    // 5. Tabela de Permissões
    console.log('Dropping table permissions if exists...');
    await pool.query('DROP TABLE IF EXISTS permissions CASCADE;');
    console.log('Table permissions dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL, -- Ex: 'users:create', 'tickets:read_all'
        description TEXT
      );
    `);
    console.log('Tabela "permissions" verificada/criada.');

    // 6. Tabela de Perfis (Roles)
    console.log('Dropping table roles if exists...');
    await pool.query('DROP TABLE IF EXISTS roles CASCADE;');
    console.log('Table roles dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL, -- Ex: 'admin', 'manager', 'user'
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "roles" verificada/criada.');

    // 7. Tabela de Junção: role_permissions
    console.log('Dropping table role_permissions if exists...');
    await pool.query('DROP TABLE IF EXISTS role_permissions CASCADE;');
    console.log('Table role_permissions dropped.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
    `);
    console.log('Tabela "role_permissions" verificada/criada.');

    console.log('Configuração do banco de dados do Helpster concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
    process.exit(1);
  }
};

module.exports = { setupDatabase };