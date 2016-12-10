-- Creando base de datos

DROP DATABASE IF EXISTS caballeria_db;
CREATE DATABASE caballeria_db;

-- cambiando tematica de aceptar ascent
UPDATE pg_database SET encoding=6 WHERE datname='caballeria';

-- UPDATE pg_database SET datistemplate=FALSE WHERE datname='caballeria';

-- DROP DATABASE caballeria;

-- CREATE DATABASE caballeria WITH owner=postgres template=template0 encoding='UTF8';

-- UPDATE pg_database SET datistemplate=TRUE WHERE datname='caballeria';

-- UPDATE pg_database SET encoding=6 WHERE datname='caballeria';
