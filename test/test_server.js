/**
 * Created by egret on 16/1/21.
 */
var Link = require('../libs/net/link.js');
var Global = require('../libs/global/global.js');
var Session = require('../libs/session/session.js');
var Log = require('../libs/log/log.js');
var Proto = require('../app/proto/proto.js');
var EventEmitter = require('events').EventEmitter;

Global.serverName = 'testServer';
Log.init('testServer', 0);

var Event = new EventEmitter();
var SUM_CLIENT = 500;

//连接
var clients = [];
var successNum = 0;
var failNum = 0;
var now = Date.now();

for(var i=0; i<SUM_CLIENT; i++){
    connect(i);
}

function connect(index){
    Link.connect('127.0.0.1', 8880, function(client){
        Log.debug('连接成功');
        client.addCloseCallBack(function(){
            Log.debug('连接关闭');
        });
        clients.push(client);

        var sendMsg = new Proto.user_login_c2s();
        sendMsg.account = 'yangsong' + index;
        client.send(sendMsg.encode());
        //console.log(sendMsg.encode());

        client.on(Session.DATA, function(data){
            //console.log(data);
            var msg = Proto.decode(data);
            console.log('收到消息:', msg);
            successNum++
            if(successNum + failNum == SUM_CLIENT){
                Event.emit('success');
            }
        })

    }, function(){
        failNum++
        if(successNum + failNum == SUM_CLIENT){
            Event.emit('success');
        }
    })
}

//关闭
Event.on('success', function(){
    Log.debug('成功数：' + successNum)
    Log.debug('失败数：' + failNum)
    Log.debug('耗时：'+ (Date.now()-now));
    setTimeout(function(){
        for(var i=0;i<clients.length; i++){
            clients[i].close()
        }
    }, 3000);
})

process.on('uncaughtException', function(err) {
    Log.error('Caught exception: ' + err.stack);
});