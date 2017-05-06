var pg = require('pg');
var conString = "postgres://yagoazedias:admin123@@localhost/cardapio";

pg.connect(conString, function(err, client, done) {

  if (err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT * from segunda_feira', function(err, result) {
    done();
    if (err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].guarnicao);
  });

});


