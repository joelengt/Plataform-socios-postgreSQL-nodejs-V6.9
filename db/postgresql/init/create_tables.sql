
-- Table socios
CREATE TABLE socios (
  id SERIAL PRIMARY KEY,
  fecha_ingreso VARCHAR(225),
  nombres VARCHAR(225),
  apellidos VARCHAR(225),
  numero_carnet VARCHAR(225),
  cip VARCHAR(225),
  dni VARCHAR(225),
  fecha_nacimiento VARCHAR(225),
  organizacion VARCHAR(225),
  grado_profesion VARCHAR(225),
  arma VARCHAR(225),
  situacion_trabajo VARCHAR(225),
  unidad VARCHAR(225),
  gguu VARCHAR(225),
  region VARCHAR(225),
  guarnicion VARCHAR(225),
  filial VARCHAR(225),
  direccion VARCHAR(225),
  email VARCHAR(225),
  celular1 VARCHAR(255),
  celular2 VARCHAR(225),
  telefono1 VARCHAR(225),
  telefono2 VARCHAR(225),
  carta_declaratoria VARCHAR(225),
  tipo_socio VARCHAR(225),
  tipo_pago VARCHAR(225),
  situacion_socio VARCHAR(225),
  foto VARCHAR(225),
  situacion_alerta VARCHAR(225)
);


CREATE TABLE conyuges_socio (
  id SERIAL PRIMARY KEY,
  nombres VARCHAR(225),
  apellidos VARCHAR(225),
  dni VARCHAR(225),
  fecha_nacimiento VARCHAR(225),
  celular VARCHAR(225),
  fecha_ingreso VARCHAR(225),
  email VARCHAR(225),
  id_socio_afiliado VARCHAR(225)
);


CREATE TABLE afiliado_socio (
  id SERIAL PRIMARY KEY,
  nombres VARCHAR(225),
  apellidos VARCHAR(225),
  dni VARCHAR(225),
  fecha_nacimiento VARCHAR(225),
  direccion VARCHAR(225),
  email VARCHAR(225),
  celular VARCHAR(225),
  telefono VARCHAR(225),
  fecha_ingreso VARCHAR(225),
  carta_declaratoria VARCHAR(225),
  id_socio_afiliado VARCHAR(225)
);

--  Deudas pasadas de años anteriores
CREATE TABLE socio_inhabiles (
  id SERIAL PRIMARY KEY,
  nombres VARCHAR(225),
  apellidos VARCHAR(225),
  cip VARCHAR(225),
  dni VARCHAR(225),
  fecha_1 VARCHAR(225)
)

-- Celda dinamica -> añadir un campo con valor
-- ALTER TABLE afiliado_socio_a ADD fecha_2 VARCHAR(225) NULL;

