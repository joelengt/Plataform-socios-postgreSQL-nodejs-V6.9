var config = {
    server: {
        port: 5000
    },
    owner: {
        name: 'Caballeria'
    },
    admin:{
        user : 'admin',
        pass : '12345678'
    },
    mailing: {
        user: 'mozosdecaba1983@gmail.com',
        pass: '3LECCIONES'
    },
    mongodb:{
        //local: 'mongodb://localhost/caba',
        local: 'mongodb://root:mongodb@ds111469.mlab.com:11469/caballeria'
    },
    postgresql: {
      // local: 'postgres://postgres:kuroyukihime2110@localhost:4002/caballeria_db', // mac joel
      //local: 'postgres://postgres:postgres@localhost:5432/caballeria_db',         // servidor
      local: 'postgres://postgres:gatogato@localhost:5432/caballeria_db',           // windows maycon
    },
    status: {
        pendiente:     'pendiente',
        en_proceso:    'en_proceso',
        resuelto:      'resuelto',
        no_resuelto:   'no_resuelto',
        cancelado:     'cancelado',
        reprogramado:  'reprogramado',
        reportado:     'reportado',
        no_asignado:   'no_asignado'
    },
    users_access: {
        super_admin: 'super_admin',
        administrador: 'administrador',
        tesorero:    'tesorero'
    },
    path_system: {
        ubuntu: '/home/baudelaire/Desktop/astrumApp',
        server: '/root/astrum',
        mac:    '/Users/joelengt/Desktop/coder/astrum'
    }
}

module.exports = config
