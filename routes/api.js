module.exports = function(app) {
    app.get('/v1/api', (req, res) => {
        res.send('/v1/api');
    });
};