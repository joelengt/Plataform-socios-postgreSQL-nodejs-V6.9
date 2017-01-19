var config = require('../../config.js');

// Conexion PostgreSQL
var AgentPostgreSQL = require('sqlagent/pg').connect(config.postgresql.local);
var PostgreSQL = new AgentPostgreSQL();

module.exports = {
    'PostgreSQL': PostgreSQL
};