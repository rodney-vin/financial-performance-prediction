'use strict';

function _pa2json(data) {
  var lines = data.trim().split('\r\n');

  var header = lines[0].split('\t');
  lines.splice(0, 1);

  return lines.map(function (line) {
    var dataPiece = {};
    line.split('\t').forEach(function (el, index) {
      dataPiece[header[index]] = el;
    });

    return dataPiece;
  });
}

module.exports = {
  translate: _pa2json
};
