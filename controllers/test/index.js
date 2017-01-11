// class TestController {
//     info() {
//      return console.log('okdasd');
//     }
// }

function getData(path) {
    return new Promise((resolve, reject) => {
        var data = 'service::http';

        if(path === '/source/position/assets/avatar_x3.png') {
            resolve(data + ': '+path);
        } else {
            var err = 'the path is not correctly';
            reject(err)
        }
    })
}

var TestController = {
    info: function (req, res) {
        res.status(200).json({
           status: 'ok'
        })
    },
    data: function (req, res) {
        getData('/source/position/assets/avatar_x3.png')
            .then((result) => {
                res.status(200).json({
                    status: 'ok',
                    message: result
                })
            })
            .catch((error) => {
                res.status(200).json({
                    status: 'ok',
                    message: error
                })
            })
    }
}

module.exports = TestController;
