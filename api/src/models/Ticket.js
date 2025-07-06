const { pool } = require('../config/database');

const buildTicketListQuery = (options) => {
  const {
    search = '',
    sortField = 'created_at',
    sortOrder = 'desc',
    clientId = null,
    statusNames: rawStatusNames = [],
    page = 1,
    limit = 10,
  } = options;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const statusNames = Array.isArray(rawStatusNames) 
    ? rawStatusNames 
    : typeof rawStatusNames === 'string' && rawStatusNames !== '' 
      ? rawStatusNames.split(',') 
      : [];

  const whereClauseParams = []; // Parameters specifically for the WHERE clause
  let paramIndex = 1; // This index will track parameters for the WHERE clause

  const whereClauses = [];

  if (clientId) {
    whereClauses.push(`t.client_id = $${paramIndex++}`);
    whereClauseParams.push(clientId);
  }

  if (search) {
    const searchTerms = `%${search}%`;
    const searchClauseParts = [
      `t.title ILIKE $${paramIndex}`,
      `t.description ILIKE $${paramIndex}`,
      `c.name ILIKE $${paramIndex}`,
      `ts.name ILIKE $${paramIndex}`,
      `tp.name ILIKE $${paramIndex}`,
      `sl.name ILIKE $${paramIndex}`,
      `u_client.name ILIKE $${paramIndex}`,
      `u_agent.name ILIKE $${paramIndex}`,
    ];
    whereClauses.push(`(${searchClauseParts.join(' OR ')})`);
    whereClauseParams.push(searchTerms);
    paramIndex++;
  }

  if (statusNames && statusNames.length > 0) {
    const statusPlaceholders = statusNames.map(() => `$${paramIndex++}`).join(',');
    whereClauses.push(`ts.name IN (${statusPlaceholders})`);
    whereClauseParams.push(...statusNames);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // The parameters for LIMIT and OFFSET will always be at the end of the ticketsQueryParams
  // So their indices will be paramIndex and paramIndex + 1
  const limitPlaceholderIndex = paramIndex;
  const offsetPlaceholderIndex = paramIndex + 1;

  const validSortFields = [
    'id', 'title', 'status_name', 'priority_name',
    'service_level_name', 'created_at', 'category_name',
    'client_name', 'agent_name'
  ];
  const orderByField = validSortFields.includes(sortField) ? sortField : 'created_at';
  const orderByOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const baseQuery = `
    FROM tickets t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u_client ON t.client_id = u_client.id
    LEFT JOIN users u_agent ON t.agent_id = u_agent.id
    LEFT JOIN ticket_statuses ts ON t.status_id = ts.id
    LEFT JOIN ticket_priorities tp ON t.priority_id = tp.id
    LEFT JOIN service_levels sl ON t.service_level_id = sl.id
  `;

  const ticketsQuery = `
    SELECT
      t.id,
      t.title,
      COALESCE(ts.name, 'Sem status') AS status_name,
      COALESCE(tp.name, 'Sem prioridade') AS priority_name,
      COALESCE(sl.name, 'Sem nível de serviço') AS service_level_name,
      t.created_at,
      COALESCE(c.name, 'Sem categoria') AS category_name,
      COALESCE(u_client.name, 'Cliente desconhecido') AS client_name,
      COALESCE(u_agent.name, 'Sem agente') AS agent_name
    ${baseQuery}
    ${whereClause}
    ORDER BY ${orderByField} ${orderByOrder}
    LIMIT $${limitPlaceholderIndex} OFFSET $${offsetPlaceholderIndex}
  `;

  const countQuery = `
    SELECT COUNT(t.id)
    ${baseQuery}
    ${whereClause}
  `;

  // Parameters for the tickets query (includes WHERE clause params + LIMIT/OFFSET)
  const ticketsQueryParams = [...whereClauseParams, parseInt(limit), offset];

  // Parameters for the count query (only WHERE clause params)
  const countQueryParams = [...whereClauseParams];

  return {
    ticketsQuery,
    countQuery,
    ticketsQueryParams,
    countQueryParams,
  };
};

const Ticket = {
  create: async (title, description, client_id, category_id, status_id, priority_id, service_level_id) => {
    const { rows } = await pool.query(
      'INSERT INTO tickets (title, description, client_id, category_id, status_id, priority_id, service_level_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, client_id, category_id, status_id, priority_id, service_level_id]
    );
    return rows[0];
  },

  findAll: async (options) => {
    const { ticketsQuery, countQuery, ticketsQueryParams, countQueryParams } = buildTicketListQuery(options);
    
    const { rows: tickets } = await pool.query(ticketsQuery, ticketsQueryParams);
    const { rows: countResult } = await pool.query(countQuery, countQueryParams);
    const total = parseInt(countResult[0].count, 10);

    return { tickets, total };
  },

  findById: async (id) => {
    const ticketResult = await pool.query(
      `SELECT 
        t.*,
        ts.name as status_name,
        tp.name as priority_name,
        sl.name as service_level_name
      FROM tickets t
      JOIN ticket_statuses ts ON t.status_id = ts.id
      JOIN ticket_priorities tp ON t.priority_id = tp.id
      JOIN service_levels sl ON t.service_level_id = sl.id
      WHERE t.id = $1`,
      [id]
    );
    return ticketResult.rows[0];
  },

  update: async (id, newStatusId, newPriorityId, newServiceLevelId, newAgentId) => {
    const { rows } = await pool.query(
      'UPDATE tickets SET status_id = $1, priority_id = $2, service_level_id = $3, agent_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [newStatusId, newPriorityId, newServiceLevelId, newAgentId, id]
    );
    return rows[0];
  },

  addComment: async (content, visibility, ticket_id, author_id) => {
    const { rows } = await pool.query(
      'INSERT INTO comments (content, visibility, ticket_id, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [content, visibility || 'Público', ticket_id, author_id]
    );
    return rows[0];
  },

  getStatuses: async () => {
    const { rows } = await pool.query('SELECT id, name, sla_hours FROM ticket_statuses ORDER BY name ASC');
    return rows;
  },

  getPriorities: async () => {
    const { rows } = await pool.query('SELECT id, name, sla_hours FROM ticket_priorities ORDER BY sla_hours ASC');
    return rows;
  },

  getSupportLevels: async () => {
    const { rows } = await pool.query('SELECT id, name, sla_hours FROM service_levels ORDER BY name ASC');
    return rows;
  },

  findUserById: async (userId) => {
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    return rows[0];
  },

  getCommentsByTicketId: async (ticketId) => {
    const commentsQuery = `
      SELECT 
        com.*,
        u.name as author_name
      FROM comments com
      JOIN users u ON com.author_id = u.id
      WHERE com.ticket_id = $1
      ORDER BY com.created_at ASC
    `;
    const { rows } = await pool.query(commentsQuery, [ticketId]);
    return rows;
  },
};

module.exports = Ticket;
