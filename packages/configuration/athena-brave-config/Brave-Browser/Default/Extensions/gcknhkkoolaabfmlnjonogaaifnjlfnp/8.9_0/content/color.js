export class Color {

  static getRandom() {
    return this.colors[Math.floor(Math.random()*this.colors.length)];
  }

  static colors = [
    '#faebd7', '#00ffff', '#7fffd4', '#f5f5dc', '#ffe4c4', '#ffebcd', '#0000ff', '#8a2be2', '#a52a2a', '#deb887',
    '#5f9ea0', '#7fff00', '#d2691e', '#ff7f50', '#6495ed', '#fff8dc', '#dc143c', '#00008b', '#008b8b', '#b8860b',
    '#a9a9a9', '#006400', '#bdb76b', '#8b008b', '#556b2f', '#ff8c00', '#9932cc', '#8b0000', '#e9967a', '#8fbc8f',
    '#483d8b', '#2f4f4f', '#00ced1', '#9400d3', '#ff1493', '#00bfff', '#696969', '#1e90ff', '#b22222', '#228b22',
    '#ff00ff', '#ffd700', '#daa520', '#808080', '#008000', '#adff2f', '#ff69b4', '#cd5c5c', '#4b0082', '#f0e68c',
    '#7cfc00', '#fffacd', '#add8e6', '#f08080', '#e0ffff', '#fafad2', '#d3d3d3', '#90ee90', '#ffb6c1', '#ffa07a',
    '#20b2aa', '#87cefa', '#778899', '#b0c4de', '#00ff00', '#32cd32', '#800000', '#66cdaa', '#0000cd', '#ba55d3',
    '#9370db', '#3cb371', '#7b68ee', '#00fa9a', '#48d1cc', '#c71585', '#191970', '#ffe4e1', '#ffe4b5', '#ffdead',
    '#000080', '#fdf5e6', '#808000', '#6b8e23', '#ffa500', '#ff4500', '#da70d6', '#eee8aa', '#98fb98', '#afeeee',
    '#db7093', '#ffefd5', '#ffdab9', '#cd853f', '#ffc0cb', '#dda0dd', '#b0e0e6', '#800080', '#ff0000', '#bc8f8f',
    '#4169e1', '#8b4513', '#fa8072', '#f4a460', '#2e8b57', '#fff5ee', '#a0522d', '#87ceeb', '#6a5acd', '#708090',
    '#00ff7f', '#4682b4', '#d2b48c', '#008080', '#d8bfd8', '#ff6347', '#40e0d0', '#ee82ee', '#f5deb3', '#ffff00',
    '#9acd32'];
}