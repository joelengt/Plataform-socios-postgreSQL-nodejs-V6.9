
COPY habiles_lecabpe_2016 FROM '/users/joelengt/desktop/datasql/listaa.txt'  USING DELIMITERS ';'
COPY inhabiles_lecabpe_2016 FROM '/users/joelengt/desktop/datasql/listab.txt'  USING DELIMITERS ';'
COPY personalidades FROM '/users/joelengt/desktop/datasql/listac.txt'  USING DELIMITERS ';'


-- INSERT INTO users_d (namee, agee) VALUES ('Roberto', '25');


INSERT INTO socios (fecha_ingreso , nombres , apellidos , numero_carnet , cip , dni , fecha_nacimiento , organizacion , grado_profesion , arma , situacion_trabajo , unidad , gguu , region , guarnicion , filial , direccion , email , celular1 , celular2 , telefono1 , telefono2 , carta_declaratoria , tipo_socio , tipo_pago , situacion_socio , foto , situacion_alerta) VALUES ('26/10/2006' , 'Joel Enrrique' , 'Gonzales Tipismana' , '4234234234' , '3123123' , '23123131' , '21/10/45' , 'Ejercito' , 'Teniente' , 'Ingeniería' , 'actividad' , '9da' , 'gguu' , 'San Miguel' , 'guarnicion' , 'filial' , 'Los Angeles Drt 3000' , 'me@datos.com' , '90131233' , '321313432' , '231223' , '2523233' , 'si' , 'Activos' , 'OGECOE' , 'habil' , 'avatar.png' , 'green');
INSERT INTO socios (fecha_ingreso , nombres , apellidos , numero_carnet , cip , dni , fecha_nacimiento , organizacion , grado_profesion , arma , situacion_trabajo , unidad , gguu , region , guarnicion , filial , direccion , email , celular1 , celular2 , telefono1 , telefono2 , carta_declaratoria , tipo_socio , tipo_pago , situacion_socio , foto , situacion_alerta) VALUES ('01/10/2016' , 'Pedro Julian' , 'Martinez Prado' , '21234234234' , '123123123' , '12123131' , '20/11/75' , 'Marina' , 'Mayor' , 'Ingeniería' , 'actividad' , '4da' , 'gguu' , 'San Miguel' , 'guarnicion' , 'filial' , 'Los Angeles Drt 3000' , 'mepoo@datos.com' , '3131233' , '321313432' , '231223' , '2523233' , 'si' , 'Activos' , 'OGECOE' , 'habil' , 'avatar.png' , 'green');
INSERT INTO socios (fecha_ingreso , nombres , apellidos , numero_carnet , cip , dni , fecha_nacimiento , organizacion , grado_profesion , arma , situacion_trabajo , unidad , gguu , region , guarnicion , filial , direccion , email , celular1 , celular2 , telefono1 , telefono2 , carta_declaratoria , tipo_socio , tipo_pago , situacion_socio , foto , situacion_alerta) VALUES ('15/03/2011' , 'Juan Marcos' , 'Miranda Solano' , '534663434' , '5423123' , '90123131' , '02/01/95' , 'PNP' , 'Coronel' , 'Ingeniería' , 'actividad' , '9da' , 'gguu' , 'San Miguel' , 'guarnicion' , 'filial' , 'Los Angeles Drt 3000' , 'm55tte@datos.com' , '3131233' , '321313432' , '231223' , '2523233' , 'si' , 'Activos' , 'OGECOE' , 'habil' , 'avatar.png' , 'yellow');
INSERT INTO socios (fecha_ingreso , nombres , apellidos , numero_carnet , cip , dni , fecha_nacimiento , organizacion , grado_profesion , arma , situacion_trabajo , unidad , gguu , region , guarnicion , filial , direccion , email , celular1 , celular2 , telefono1 , telefono2 , carta_declaratoria , tipo_socio , tipo_pago , situacion_socio , foto , situacion_alerta) VALUES ('09/11/2012' , 'Luis Enrrique' , 'Qubranto De la Torre' , '99934234' , '9023123' , '64123131' , '11/10/17' , 'FAP' , 'Teniente' , 'Ingeniería' , 'actividad' , '2da' , 'gguu' , 'San Isidro' , 'guarnicion' , 'filial' , 'Los Angeles Drt 200' , '89_allado@datos.com' , '3131233' , '321313432' , '231223' , '2523233' , 'si' , 'Activos' , 'OGECOE' , 'habil' , 'avatar.png' , 'red');
INSERT INTO socios (fecha_ingreso , nombres , apellidos , numero_carnet , cip , dni , fecha_nacimiento , organizacion , grado_profesion , arma , situacion_trabajo , unidad , gguu , region , guarnicion , filial , direccion , email , celular1 , celular2 , telefono1 , telefono2 , carta_declaratoria , tipo_socio , tipo_pago , situacion_socio , foto , situacion_alerta) VALUES ('01/07/2009' , 'Mario Juan' , 'Quispe Flores' , '4234234234' , '393123123' , '76123131' , '20/03/90' , 'Ejercito' , 'Teniente' , 'Ingeniería' , 'actividad' , '5da' , 'gguu' , 'San Lorenzo' , 'guarnicion' , 'filial' , 'Pardo Drt 3000' , 'j_ladp@datos.com' , '3131233' , '321313432' , '231223' , '2523233' , 'si' , 'Activos' , 'OGECOE' , 'habil' , 'avatar.png' , 'green');




-- arma
Caballeria 
Artillería
Ingeniería
Infantería
Comunicaciones
Material de Guerra
Servicio jurídico
Veterinaria
Sanidad
Intendencia
