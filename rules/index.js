var crypto = require('crypto');

var debug = require('debug');
var log = debug('webot-example:log');
var verbose = debug('webot-example:verbose');
var error = debug('webot-example:error');

var _ = require('underscore')._;
var search = require('../support').search;
var geo2loc = require('../support').geo2loc;

var package_info = require('../package.json');
var jsdom = require("jsdom");
var FeedParser = require('feedparser');
var request = require('request');
var lineReader = require('line-reader');
var fs = require('fs');
var path = require('path')
require('js-yaml');
/**
 * 初始化路由规则
 */


module.exports = exports = function(webot){
  webot.loads('jielong','dialogs');
  var reg_help = /^(help|\?|帮助)$/i;
  webot.waitRule('input_answer',function(info){

    return "Your question is:"+info.session.question+", and answer is:"+info.text;
  });
  webot.waitRule('input_question', function(info) {
    if(info.text){
      // console.log(info.text);
      lineReader.eachLine('rules/dialogs/exist.txt', function(line) {
        if(RegExp(line).test(info.text)){
          return "已经存在这个问题了";
        }
        console.log(line);
      }).then(function () {

      console.log("It's new one!!");

      });
      info.session.question = info.text;
      info.wait('input_answer');
      return "请输入答案";
    }

  });

  webot.set({
    name: '学习',
    description: '学习',
    pattern: /^learn$/,
    handler: function(info){
      info.wait('input_question')
      return "请输入问题"
    }
  });

  webot.set({
    // name 和 description 都不是必须的
    name: 'hello help',
    description: '获取使用帮助，发送 help',
    pattern: function(info) {
      //首次关注时,会收到subscribe event
      return info.is('event') && info.param.event === 'subscribe' || reg_help.test(info.text);
    },
    handler: function(info){
      var reply = {
        title: '感谢你收听潇潇机器人',
        pic: 'https://raw.github.com/ymcdull/webot-example/master/xiaoxiaologo.jpg',
        // url: 'https://github.com/node-webot/webot-example',
        description: [
          '潇潇机器人会每天给您推送英国留学和雅思考试的最新信息，同时您也可以尝试跟我聊天哟!目前您可以尝试以下指令:',
            '留学网站 :英国留学网站链接',
            'game : 玩玩猜数字的游戏吧',
            's+空格+关键词 : 我会帮你百度搜索喔',
            '成语/接龙/成语接龙/jielong: 成语接龙游戏，看你给出的成语的头文字能否对上我的最后一个字吧！',
            '还有更多新功能，潇潇正在开发中，祝福我们都能梦圆英国，加油！',
        ].join('\n')
      };
      // 返回值如果是list，则回复图文消息列表
      return reply;
    }
  });

  // 更简单地设置一条规则
  webot.set(/^more$/i, function(info){
    var reply = _.chain(webot.gets()).filter(function(rule){
      return rule.description;
    }).map(function(rule){
      //console.log(rule.name)
      return '> ' + rule.description;
    }).join('\n').value();
    
    return ['我的主人还没教我太多东西,你可以考虑帮我加下.\n可用的指令:\n'+ reply,
      '没有更多啦！当前可用指令：\n' + reply];
  });

  webot.set('who_are_you', {
    description: '想知道我是谁吗? 发送: who?',
    // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
    pattern: /who|你是|潇潇是[谁\?]+/i,
    // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
    handler: ['我是潇潇机器人', '潇潇机器人', '潇潇爱英国']
  });

  // 正则匹配后的匹配组存在 info.query 中
  webot.set('your_name', {
    description: '自我介绍下吧, 发送: I am [enter_your_name]',
    pattern: /^(?:my name is|i am|我(?:的名字)?(?:是|叫)?)\s*(.*)$/i,

    // handler: function(info, action){
    //   return '你好,' + info.param[1]
    // }
    // 或者更简单一点
    handler: '你好,{1}'
  });

  webot.set('love_you',{
    description: '喜欢你',
    pattern: /.*(爱|喜欢|love).*/i,
    handler: ['潇潇机器人最爱你了', '好妹纸就是我，我就是潇潇机器人', 'love you!!']
  });

  webot.set('buli',{
    description: '喜欢你',
    pattern: /.*不理(你)?.*/i,
    handler: ['不要不理我嘛', '好伤心']
  });

  
  webot.set({
    description: 'eat',
    pattern: /.*(吃|eat).*/i,
    handler: ['潇潇最爱吃糖葫芦了~', '吃糖葫芦最开心了～']
  });


  webot.set('English_topic',{
    description: "English_topic",
    pattern: /.*(英国|雅思|english|Britain|england|ielts).*/i,
    handler: ['潇潇也爱英国，爱雅思，我会跟你一起努力的～加油','祝福我们都申请上理想的学校，加油～']
  });


  // webot.set('go_abroad_britain',{
  //   description: "go_abroad_britain",
  //   pattern: /.*(英国|Britain).*/i,
  //   handler: function(info){
  //     request('http://www.liuxue86.com/rss.php?rssid=269')
  //       .pipe(new FeedParser())
  //       .on('error', function(error) {
  //         console.error(error);
  //       })
  //       .on('meta', function (meta) {
  //         console.log('===== %s =====', meta.title);
  //       })
  //       .on('readable', function () {
  //         var stream = this, item = stream.read();
  //         var pattern=/.*英国.*$/;
  //         var reply=[];
  //         while (item){
  //           if(pattern.test(item.title)){
  //             reply.push({title:item.title, url:item.link});
  //             // console.log('Got article: %s', item.title || item.description, "**link:**", item.link);
  //           }
  //           item = stream.read();
  //         }
  //         // console.log(reply);
  //         return reply;
          
  //         // return reply;
  //       }
  //     );

  //     // console.log(reply);
  //     // var reply = [
  //     //   {title: arr[0], description: '微信机器人测试帐号：webot', url: 'https://github.com/node-webot/webot-example'},
  //     //   {title: arr[1], description: '豆瓣同城微信帐号二维码：douban-event',  url: 'https://github.com/node-webot/weixin-robot'},
  //     //   {title: arr[2], description: '图文消息描述3', url: 'http://www.baidu.com'}
  //     // ];
  //     // 发送 "news 1" 时只回复一条图文消息
  //     // return reply;
  //   }
  // });


  // webot.set('taisha',{
  //   description: "taisha",
  //   pattern: /^英语$/i,
  //   handler: function(info){
  //     var arr = [];
  //     jsdom.env(
  //       "http://www.taisha.org/abroad/en/",
  //       function (error, window) {
  //         var news = window.document.getElementsByClassName('new');
  //         var tmp = [];
  //         for (var i = news.length - 1; i >= 0; i--) {
  //           tmp = news[i].getElementsByTagName('a');
  //           for (var i = tmp.length - 1; i >= 0; i--) {
  //             arr.push(tmp[i].textContent);
  //           };
  //           tmp=[];
  //         };
  //         for (var i = arr.length - 1; i >= 0; i--) {
  //           console.log(arr[i]);
  //         };
  //         // console.log("there have been", window.$("a").length, "nodejs releases!");
  //       });
        
  //     var reply = [
  //       {title: arr[0], description: '微信机器人测试帐号：webot', pic: 'https://raw.github.com/node-webot/webot-example/master/qrcode.jpg', url: 'https://github.com/node-webot/webot-example'},
  //       {title: arr[1], description: '豆瓣同城微信帐号二维码：douban-event', pic: 'http://i.imgur.com/ijE19.jpg', url: 'https://github.com/node-webot/weixin-robot'},
  //       {title: arr[2], description: '图文消息描述3', pic: 'https://raw.github.com/node-webot/webot-example/master/qrcode.jpg', url: 'http://www.baidu.com'}
  //     ];
  //     // 发送 "news 1" 时只回复一条图文消息
  //     return reply;


  //   }
  // });




                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  // 简单的纯文本对话，可以用单独的 yaml 文件来定义
 // webot.dialog(__dirname + '/dialog.yaml');

  // 支持一次性加多个（方便后台数据库存储规则）
  webot.set([{
    name: 'morning',
    description: '打个招呼吧, 发送: good morning',
    pattern: /^(早上?好?|(good )?moring)[啊\!！\.。]*$/i,
    handler: function(info){
      var d = new Date();
      var h = d.getHours();
      if (h < 3) return '[嘘] 我这边还是深夜呢，别吵着大家了';
      if (h < 5) return '这才几点钟啊，您就醒了？';
      if (h < 7) return '早啊官人！您可起得真早呐~ 给你请安了！\n 今天想参加点什么活动呢？';
      if (h < 9) return 'Morning, sir! 新的一天又开始了！您今天心情怎么样？';
      if (h < 12) return '这都几点了，还早啊...';
      if (h < 14) return '人家中午饭都吃过了，还早呐？';
      if (h < 17) return '如此美好的下午，是很适合出门逛逛的';
      if (h < 21) return '早，什么早？找碴的找？';
      if (h >= 21) return '您还是早点睡吧...';
    }
  }, {
    name: 'time',
    description: '想知道几点吗? 发送: time',
    pattern: /^(几点了|time)\??$/i,
    handler: function(info) {
      var d = new Date();
      var h = d.getHours();
      var t = '现在时间是' + h+8 + '点' + d.getMinutes() + '分';
      if (h < 4 || h > 22) return t + '，夜深了，早点睡吧 [月亮]';
      if (h < 6) return t + '，您还是再多睡会儿吧';
      if (h < 9) return t + '，又是一个美好的清晨呢，今天准备去哪里玩呢？';
      if (h < 12) return t + '，一日之计在于晨，今天要做的事情安排好了吗？';
      if (h < 15) return t + '，午后的冬日是否特别动人？';
      if (h < 19) return t + '，又是一个充满活力的下午！今天你的任务完成了吗？';
      if (h <= 22) return t + '，这样一个美好的夜晚，有没有去看什么演出？';
      return t;
    }
  }]);

  // 等待下一次回复
  webot.set('guess my sex', {
    pattern: /是男.还是女.|你.*男的女的/,
    handler: '你猜猜看呐',
    replies: { 
      '/女|girl/i': '是的，我就是软妹子一枚',
      '/男|boy/i': '人家才不是汉子呢',
      'both|不男不女': '你丫才不男不女呢',
      '不猜': '好的，再见',
      // 请谨慎使用通配符
      '/.*/': function reguess(info) {
        if (info.rewaitCount < 2) {
          info.rewait();
          return '你到底还猜不猜嘛！';
        }
        return '看来你真的不想猜啊';
      },
    }
    
    // 也可以用一个函数搞定:
    // replies: function(info){
    //   return 'haha, I wont tell you'
    // }

    // 也可以是数组格式，每个元素为一条rule
    // replies: [{
    //   pattern: '/^g(irl)?\\??$/i',
    //   handler: '猜错'
    // },{
    //   pattern: '/^b(oy)?\\??$/i',
    //   handler: '猜对了'
    // },{
    //   pattern: 'both',
    //   handler: '对你无语...'
    // }]
  });

  // 定义一个 wait rule
  webot.waitRule('wait_guess', function(info) {
    var r = Number(info.text);

    // 用户不想玩了...
    if (isNaN(r)) {
      info.resolve();
      return null;
    }

    var num = info.session.guess_answer;

    if (r === num) {
      return '你真聪明!';
    }

    var rewaitCount = info.session.rewait_count || 0;
    if (rewaitCount >= 2) {
      return '怎么这样都猜不出来！答案是 ' + num + ' 啊！';
    }

    //重试
    info.rewait();
    return (r > num ? '大了': '小了') +',还有' + (2 - rewaitCount) + '次机会,再猜.';
  });

  webot.set('guess number', {
    description: '发送: game , 玩玩猜数字的游戏吧',
    pattern: /(?:game|玩?游戏)\s*(\d*)/,
    handler: function(info){
      //等待下一次回复
      var num = Number(info.param[1]) || _.random(1,9);

      verbose('answer is: ' + num);

      info.session.guess_answer = num;

      info.wait('wait_guess');
      return '玩玩猜数字的游戏吧, 1~9,选一个';
    }
  });


  webot.waitRule('wait_suggest_keyword', function(info, next){
    if (!info.text) {
      return next();
    }

    // 按照定义规则的 name 获取其他 handler
    var rule_search = webot.get('search');

    // 用户回复回来的消息
    if (info.text.match(/^(好|要|y)$/i)) {
      // 修改回复消息的匹配文本，传入搜索命令执行
      info.param[0] = 's nodejs';
      info.param[1] = 'nodejs';

      // 执行某条规则
      webot.exec(info, rule_search, next);
      // 也可以调用 rule 的 exec 方法
      // rule_search.exec(info, next);
    } else {
      info.param[1] = info.session.last_search_word;
      // 或者直接调用 handler :
      rule_search.handler(info, next);
      // 甚至直接用命名好的 function name 来调用：
      // do_search(info, next);
    }
    // remember to clean your session object.
    delete info.session.last_search_word;
  });
  // 调用已有的action
  webot.set('suggest keyword', {
    description: '发送: s nde ,然后再回复Y或其他',
    pattern: /^(?:搜索?|search|s\b)\s*(.+)/i,
    handler: function(info){
      var q = info.param[1];
      if (q === 'nde') {
        info.session.last_search_word = q;
        info.wait('wait_suggest_keyword');
        return '你输入了:' + q + '，似乎拼写错误。要我帮你更改为「nodejs」并搜索吗?';
      }
    }
  });

  function do_search(info, next){
    // pattern的解析结果将放在param里
    var q = info.param[1];
    log('searching: ', q);
    // 从某个地方搜索到数据...
    return search(q , next);
  }

  // 可以通过回调返回结果
  webot.set('search', {
    description: '发送: s 关键词 ',
    pattern: /^(?:搜索?|search|百度|s\b)\s*(.+)/i,
    //handler也可以是异步的
    handler: do_search
  });


  webot.waitRule('wait_timeout', function(info) {
    if (new Date().getTime() - info.session.wait_begin > 5000) {
      delete info.session.wait_begin;
      return '哼，愤怒中，不理你~~~';
    } else {
      return '哼，愤怒中，不理你~~~';
    }
  });

  // 超时处理
  webot.set('timeout', {
    description: '不喜欢说脏话的坏孩子，5秒钟内不理你',
    pattern: /^(shit|fuch|傻逼|傻子)$/i,
    handler: function(info) {
      info.session.wait_begin = new Date().getTime();
      info.wait('wait_timeout');
      return '不喜欢说脏话的坏孩子，5秒钟内不理你!';
    }
  });

  /**
   * Wait rules as lists
   *
   * 实现类似电话客服的自动应答流程
   *
   */
  webot.set(/^ok webot$/i, function(info) {
    info.wait('list');
    return '可用指令：\n' +
           '1 - 查看程序信息\n' + 
           '2 - 进入名字选择';
  });
  webot.waitRule('list', {
    '1': 'webot ' + package_info.version,
    '2': function(info) {
      info.wait('list-2');
      return '请选择人名:\n' +
             '1 - Marry\n' + 
             '2 - Jane\n' +
             '3 - 自定义'
    }
  });
  webot.waitRule('list-2', {
    '1': '你选择了 Marry',
    '2': '你选择了 Jane',
    '3': function(info) {
      info.wait('list-2-3');
      return '请输入你想要的人';
    }
  });
  webot.waitRule('list-2-3', function(info) {
    if (info.text) {
      return '你输入了 ' + info.text;
    }
  });


  //支持location消息 此examples使用的是高德地图的API
  //http://restapi.amap.com/rgeocode/simple?resType=json&encode=utf-8&range=3000&roadnum=0&crossnum=0&poinum=0&retvalue=1&sid=7001&region=113.24%2C23.08
  webot.set('check_location', {
    description: '发送你的经纬度,我会查询你的位置',
    pattern: function(info){
      return info.is('location');
    },
    handler: function(info, next){
      geo2loc(info.param, function(err, location, data) {
        location = location || info.label;
        next(null, location ? '你正在' + location : '我不知道你在什么地方。');
      });
    }
  });

  //图片
  webot.set('check_image', {
    description: '发送图片,我将返回其hash值',
    pattern: function(info){
      return info.is('image');
    },
    handler:'多谢亲的图片，图片功能正在开发中，潇潇先给你赞一枚～'

     // function(info, next){
    //   verbose('image url: %s', info.param.picUrl);
    //   try{
    //     var shasum = crypto.createHash('md5');

    //     var req = require('request')(info.param.picUrl);

    //     req.on('data', function(data) {
    //       shasum.update(data);
    //     });
    //     req.on('end', function() {
    //       return next(null, '你的图片hash: ' + shasum.digest('hex'));
    //     });
    //   }catch(e){
    //     error('Failed hashing image: %s', e)
    //     return '生成图片hash失败: ' + e;
    //   }
    // }
  });

  // 回复图文消息
  webot.set('liuxue', {
    description: 'liuxue',
    pattern: /^留学网站$/,
    handler: function(info){
      var reply = [
        {title: '太傻论坛英国专版', description: 'DIY万岁！', pic: 'https://raw.github.com/ymcdull/webot-example/master/pic/taisha2.jpg', url: 'http://www.taisha.org/abroad/en/'},
        {title: '寄托天下英国频道', pic: 'https://raw.github.com/ymcdull/webot-example/master/pic/jituo.gif', url: 'http://www.gter.net/list-78-1.html'},
        {title: '无忧雅思英国留学', pic: 'https://raw.github.com/ymcdull/webot-example/master/pic/512.jpg', url: 'http://www.51ielts.com/html/uk/liuxue/'}
      ];
      return reply;
    }
  });

  // 可以指定图文消息的映射关系
  webot.config.mapping = function(item, index, info){
    //item.title = (index+1) + '> ' + item.title;
    return item;
  };

  // webot.set('bbc',{
  //   description:'bbc',
  //   pattern: /^bbc$/i,
  //   handler:function(info){
  //     reply={
  //       type: 'music',
  //       title: 'Music 101',
  //       musicUrl: 'http://zhangmenshiting.baidu.com/data2/music/64519681/2240751384567261128.mp3'
  //     };
  //     // return reply;
  //     return reply;
  //   }
  // });

  //所有消息都无法匹配时的fallback
  webot.set(/.*/, function(info){
    // 利用 error log 收集听不懂的消息，以利于接下来完善规则
    // 你也可以将这些 message 存入数据库
    log('unhandled message: %s', info.text);
    info.flag = true;
    return '你发送了「' + info.text + '」,可惜潇潇没能明白你在说什么. 发送: help 查看可用的指令';
  });
};
