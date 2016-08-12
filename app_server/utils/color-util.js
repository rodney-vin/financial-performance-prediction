'use strict';

/*var colors = [
  'rgb(141, 211, 199)',
  'rgb(255, 255, 179)',
  'rgb(190, 186, 218)',
  'rgb(251, 128, 114)',
  'rgb(128, 177, 211)',
  'rgb(253, 180, 98)',
  'rgb(179, 222, 105)',
  'rgb(252, 205, 229)',
  'rgb(217, 217, 217)'
];*/

var colors = [
  '#64FE00',
  '#FF7100',
  '#00F6ED',
  '#FF7100',
  '#0064F7',
  '#FF0079',
  'rgb(179, 222, 105)',
  'rgb(252, 205, 229)',
  '#FF0040'
];

function _getColorByIndex(index) {
  return colors[index * 3 + index];
}

function _getMatrixColor(i, j) {
  return colors[j * 3 + i];
}

module.exports = {
  getColorByIndex: _getColorByIndex,
  getMatrixColor: _getMatrixColor
};
