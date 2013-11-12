var pwd = process.cwd();
var chengyu = require('./chengyu');


var reg_punc = /[。\.\s…\!]/g;

function pick(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

function getSample(size) {
  var arr = this;
  var shuffled = arr.slice(0), i = arr.length, min = Math.max(0, i - size), temp, index;
  while (i-- > min) {
    index = Math.round(i * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

Array.prototype.sample = getSample;

module.exports = {
  'pattern': function(info) {
    if (info.text === '成语' || info.text === '成语接龙' || info.text === '接龙') {
      info.reply = info.session.jielong = pick(chengyu.explain);
      info.wait('jielong');
      return true;
    }
    return info.text && (info.text.replace(reg_punc, '') in chengyu.explain);
  },
  'handler': function(info) {
    if (info.reply) return info.reply;

    var lastChar = info.text[info.text.length - 1]; 
    if (lastChar in chengyu.index) {
      var ret = chengyu.index[lastChar].sample(1)[0];
      info.session.jielong = ret;
      info.wait('jielong');
      return ret;
    }
    return '[大哭]你赢了.. 我接不上这个成语... 换下一个试试吧';
  }
};
