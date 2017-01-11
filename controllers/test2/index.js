class InfoController {
    info(req, res) {
        res.status(200).json({
            status: 'ok',
            message: 'message data'
        })
    }

    item(req, res) {
        var id = req.params.id;

        res.status(200).json({
            status: 'ok',
            message: 'message data',
            id: id
        })
    }
}

module.exports = InfoController
