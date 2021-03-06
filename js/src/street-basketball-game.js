var canvas = document.getElementById("myCanvas1");
var context = canvas.getContext("2d");


//变量声明一堆
{
var ball={x:100,y:250,r:30};//篮球ball圆心坐标,半径
//var ballc = {x:ball.x-ball.r,y:ball.y-ball.r};//篮球ball的圆心c坐标
var v_x = 0,
    v_y = 1;//球分解速度
var fre=0.3;//帧率
var g   = 1;//重力加速度
var wind_v = 0.0;//台风横向加速度
var airf  = 0.01;//空气阻力
var groundy = 600;//地面y值
var t = 0;//时间(迭代)
var mouseX,mouseY;//鼠标点击坐标

var LevelMove;//水平移动真假判断
var lor;
var v_back;
var propsplace_x1;//小道具的随机xy坐标
var propsplace_y1 ;
var propstime = 5;//小道具停留时间；
var timelonger = 3;//加时时间。
var propsplace_x2;//保存小道具坐标的变量；
var propsplace_y2;
var p_distance;//小道具与球的中心距离；
var p_draw = true;
var p_word = false;
var p_exist = false;
var propstrigger;
var t_iplus = 0;//道具加时。
var t_i,t_itotal,t_i0 ,t_i1;
var ghost_l = 2;//残影长度
var ghost_x = new Array(ghost_l*ball.r);
var ghost_y = new Array(ghost_l*ball.r);
var scores = new Array(4);
scores = [0,0,0,0];
var shadow_rate = 0;//影子缩放比例
var gameover = false;//游戏是否结束
var gamebegin = false;//游戏是否开始
var backdoor = {clock:false,wind:false,count:0};//后门
var Vector = function(x, y) { this.x = x; this.y = y; };
Vector.prototype = {
    copy: function() { return new Vector(this.x, this.y); },
    length: function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
    sqrLength: function() { return this.x * this.x + this.y * this.y; },
    normalize: function() { var inv = 1 / this.length(); return new Vector(this.x * inv, this.y * inv); },
    negate: function() { return new Vector(-this.x, -this.y); },
    add: function(v) { return new Vector(this.x + v.x, this.y + v.y); },
    subtract: function(v) { return new Vector(this.x - v.x, this.y - v.y); },
    multiply: function(f) { return new Vector(this.x * f, this.y * f); },
    divide: function(f) { var invf = 1 / f; return new Vector(this.x * invf, this.y * invf); },
    dot: function(v) { return this.x * v.x + this.y * v.y; }
};
var closePoint = {x:0,y:0};
}
var scoreboard = 0;//记分板；

//计分板
var scoreShow = function(){
    scores.sort(function(v1,v2){
        return v2-v1;
    });
    context.font = "20px Arial";
    context.fillStyle ="purple";
    context.fillText("历史分数",background_width-105,10);
    context.fillText("状元   "+scores[0],background_width-120,30);
    context.fillText("榜眼   "+scores[1],background_width-120,50);
    context.fillText("探花   "+scores[2],background_width-120,70);
};

//键盘后门
document.addEventListener("keydown", function (e) {
    //console.log("keydown");
    //console.log(e.keyCode);
    if (e.keyCode==17){backdoor.count+=1;}
    else if (e.keyCode==82){//重置布尔值
            gamebegin = false;
            gameover = false;
            clock_on = false;
            wind.on = false;
            p_draw = true;
            p_word = false;
            p_exist = false;
            t_iplus = 0;
            wind.blow = false;
            backdoor.count = 0;
            //console.log("backdoor: play again");
        }
    else if (e.keyCode==69){gameover = true;
        //console.log("backdoor: gameover");
    }
    else if (e.keyCode == 37){
        //向左点击效果
        v_y = 15;
        v_back = 1;
        lor = -1;
        v_x = 5;
        gamebegin = true;
    }
    else if (e.keyCode == 39){
        //向右点击效果
        v_y = 15;
        v_back = 1;
        lor = 1;
        v_x = 5;
        gamebegin = true;
    }

    if (backdoor.count == 5){
        if (e.keyCode==67){backdoor.clock = true;
            //console.log("backdoor: clock");
        }
        else if (e.keyCode==87){backdoor.wind = true;
            //console.log("backdoor: wind");
        }
        
    }
}, false);

//点击鼠标触发弹起
canvas.addEventListener("mousedown", function (e) {
    //console.log("mousedown");
    v_y = 15;
    mouseX = e.pageX - canvas.clientLeft;
    mouseY = e.pageY - canvas.clientTop;
    //console.log(mouseX + "," + mouseY);
    v_back = 1;
    lor = (mouseX -(canvas.width-background_width)/2>= ball.x)?(1):(-1);
    //console.log("lor"+lor);
    v_x = 5;
    //console.log(" now should LEVEL MOVE")
    gamebegin = true;
}, false);

//画面大小调整
canvas.width = (document.documentElement.clientWidth>1500)?(document.documentElement.clientWidth):(1500);
canvas.height = canvas.width*563/750;//document.documentElement.clientHeight;
var background_width = 1500;//(canvas.width/canvas.height>750/563)?((canvas.width<1500)?(canvas.width):(1500)):((canvas.height<1126)?(canvas.height):(1126));
console.log(canvas.width);
//console.log(canvas.height);
//console.log(canvas.height* 563/750);
//console.log(background_width* 563/750);
//console.log((canvas.height-background_width*563/750)/2);
//console.log((canvas.width-background_width)/2);


//水平移动
var level_move = function(){
    //console.log("LEVEL MOVE!!!")
    ball.x += lor * v_x *fre*v_back + wind_v*fre*0.7;
    v_x -= airf;
    if (v_x <= 0) {v_x=0;}
    if (ball.x<-ball.r){ball.x=background_width+ball.r-10;}
    else if (ball.x>background_width+ball.r){ball.x=-ball.r+10;}

};
//篮球弹跳
var BBU = function(){
    //Ball Bounce Up
    //篮球自己弹起来
    //ball.y -=  ((v_y * t + 0.5 * g * t*t));
    ball.y -=  ((v_y * fre ));
    v_y -= (g * fre);
    if (ball.y >= groundy){
        //v_y = -v_y-1;
        v_y = 25;
    }
};
//篮球残影

var ghost = function(){
    context.fillStyle = 'rgba(239, 129, 32, 0.15)';
    //记录坐标集合 
    if (t<=ghost_l*ball.r){
            ghost_x[t]=ball.x;
            ghost_y[t]=ball.y;
        }
        else{
            //坐标数据迭代退位
            for (var n = 0; n < ghost_l*ball.r; n++){
                ghost_x[n] = ghost_x[n+1];
                ghost_y[n] = ghost_y[n+1];
            }
            //末位数据留给最新坐标
            ghost_x[ghost_l*ball.r]=ball.x;
            ghost_y[ghost_l*ball.r]=ball.y;
        }
        //画残影
        for (var i = 0; i <= ball.r; i++){
            context.beginPath();
            for (var j = 0; j < ghost_l; j++){
            context.arc(ghost_x[ghost_l*i+j],ghost_y[ghost_l*i+j],i+1/ghost_l*j, 0, 360 * Math.PI / 180, true);
            }
            context.fill();
        }
};
//篮球影子
var shadow = function(){
//篮球影子
context.scale(1,0.5);
    context.fillStyle= 'rgba(0,0,0, 0.6)';
    context.beginPath();
    shadow_rate = (ball.y>0)?(0.05*(groundy-ball.y)):(ball.r-5);
    context.arc(ball.x,2* groundy+2*ball.r,(ball.r-shadow_rate), 0, 360*Math.PI/180, true);
    context.closePath();
    context.fill();
    context.scale(1,2);
};
//篮球旋转
var ball_rotate = function(){
    //篮球旋转
    context.translate(ball.x, ball.y);
    context.rotate((Math.PI/180)*t);
    context.drawImage(ball_img, 0, 0, 250,250,-ball.r,-ball.r,2*ball.r,2*ball.r);
    //测试画图
    //context.beginPath();context.arc(0, 0, ball.r, 0, 360 * Math.PI / 180, true);context.moveTo(0, 0);context.lineTo(0, ball.r);context.fill();context.stroke();
    
    context.rotate(-(Math.PI/180)*t);
    context.translate(-ball.x,-ball.y);
};

//游戏开始界面
var begin_interface = function(){
    context.drawImage(background_begin, 0, 0, 750,563,0,-200,background_width,background_width*563/750);
    context.drawImage(background_begin_word, 0, 0, 750,563,0,-120,background_width,background_width*563/750);
    writeScore = true;
    /*
    context.font = "100px Arial";
    context.strokeStyle ="pink";
    context.fillStyle ="orange  ";
    context.fillText("中珠街头土味篮球",400,300);
    context.strokeText("中珠街头土味篮球",400,300);
    context.font = "50px Arial";
    context.fillStyle ="purple";
    context.fillText("点击鼠标以开始",550,500);
    */
};
//游戏结束界面
var writeScore = true;
var end_interface = function(){
    context.drawImage(background_over, 0, 0, 750,563,0,-200,1500,1126);
    //context.clearRect(0, 700, 1500, 1126);
    context.font = "40px Arial";
    context.fillStyle ="pink";
    context.fillText("得分: "+scoreboard,670,520);
    if(writeScore){scores[3]=scoreboard;writeScore=false;}
    /*
    context.font = "100px Arial";
    context.strokeStyle ="white";
    context.fillStyle ="red";
    context.fillText("GAME OVER",480,300);
    context.strokeText("GAME OVER",480,300);
    context.fillText("点击R重新开始游戏",650,500);
    */
};

//时钟道具特效
var propsimage = new Image();
var clock_on = false;
propsimage.src ="../../../../images/street-basketball-game-img/clock4.png";
var prop_clock = function(){
    propstrigger = Math.ceil(Math.random() * 1000);
    //console.log(propstrigger);
    //随机开始道具
    if((propstrigger === t_i || backdoor.clock)&& !clock_on){
        p_exist = true;
        p_word = false;
        backdoor.clock = false;
        clock_on=true;
        t_i0 = t_i  ;
        //console.log("prop is exist & t_i0="+t_i0) ;   
    }
    //道具出现乱晃
    else if(t_i >= t_i0 - 0.5 && p_exist){
        propsplace_x1 = Math.random() * 1000 + 100;//小道具的随机xy坐标
        propsplace_y1 = Math.random() * 400 + 80;
        context.drawImage(propsimage,0,0,300,300,propsplace_x1,propsplace_y1,Math.random() * 100,Math.random() * 100);
        //console.log("randoming");
    }
    //道具定格,等待触发
    else if((t_i <= t_i0 -0.5) && (t_i >= t_i0 - propstime) && p_exist ){
        p_distance  =  Math.sqrt(Math.pow( ball.x - propsplace_x1,2) + Math.pow(ball.y - propsplace_y1,2) ); 
        if (p_distance >= 80 && p_draw){
            context.drawImage(propsimage,0,0,300,300,propsplace_x1,propsplace_y1,80,80);
        }
        else if (p_distance < 100){p_draw = false;}
        
        //道具效果触发
        if (p_draw === false){
        t_iplus += 3;
        t_i1 = t_i;  
        p_word = true;
        p_exist = false;
        p_draw = true;
        //console.log("add time")  
        }
    }
    else if(t_i <= t_i0-propstime-5){clock_on=false;}//道具冷却

    //文字效果
    var propstimeup= new Image ();
    propstimeup.src = "../../../../images/street-basketball-game-img/time_words.png";
    if (t_i >= t_i1 - 1 && p_word){
        context.strokeStyle ="orange";
        context.font = "20px Arial";
        context.drawImage(propstimeup,0,0,722,238,propsplace_x1-10,propsplace_y1-10,300,100);
        //console.log("print the clock")
    }
    
};

//台风效果
var wind = {
    trigger:0,
    blow:false,
    t:0,//台风触发时间记录
    keep:10,
    on:false
};
var prop_wind = function(){
    wind.trigger = Math.ceil(Math.random() * 1000);
    //#wind.trigger = 55;
    var windemerge = new Image();
    windemerge.src ="../../../../images/street-basketball-game-img/word_wind.png";

    if((wind.trigger === t_i ||backdoor.wind) && !wind.on){
        wind_v = Math.floor(Math.random()*10)-5;//台风风速随机
        wind.blow = true;
        wind.on = true;
        backdoor.wind = false;
        wind.t = t_i  ;
    }
    //出现台风并持续
    else if((t_i >= wind.t - wind.keep) && wind.blow ){
        //context.strokeStyle ="purple";
        context.fillStyle ="purple";
        //context.font = "50px Arial";
        context.drawImage(windemerge,0,0,780,253,200,15,350,120);
       
        context.font = "30px Arial";
        if (wind_v>0){
            context.fillText("→"+wind_v,220,110);
        }
        if (wind_v<0){
            context.fillText("←"+(-wind_v),220,110);
        }
    }
    else{
        wind.blow = false;
        wind.on = false;
        wind_v = 0;
        //console.log("stop wind")
    }
};

//距离函数
var distances = function (x1,y1,x2,y2){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    return (Math.sqrt( Math.pow(this.x1-this.x2,2)+Math.pow(this.y1-this.y2,2)));
};
//对篮板位置的判断
var boardplace = function()
{
    if (boardbasic.x <= background_width/2)
    {boardbasic.lr = -1;}
    else{
        boardbasic.lr = 1;
    }
};

//篮板碰撞
var board_img = new Image();
board_img.src = "../../../../images/street-basketball-game-img/board2.png";

var boardbasic = {x:300, y:100, k:2/3,lr:-1};//篮板基点坐标及缩放系数k
//篮板
var board = {x:(boardbasic.x + 184*boardbasic.k),y:(boardbasic.y + 1*boardbasic.k),//左上角
    w:(27*boardbasic.k),h:(269*boardbasic.k),//篮板宽高
    left:false,right:false,up:false,down:false,
    left0:false,right0:false,up0:false,down0:false};//碰撞检测
var boardheart = {x:boardbasic.x + 85.5*boardbasic.k,y:boardbasic.y + 240*boardbasic.k};//篮框中心 判断得分
var basketry = {x1:boardbasic.x + 10.5*boardbasic.k,y1:boardbasic.y + 240*boardbasic.k,//篮筐左端(近似为圆)圆心
    x2:boardbasic.x + 160.5*boardbasic.k,y2:boardbasic.y + 240*boardbasic.k,//篮筐右端(近似为圆)圆心
    r:10.5*boardbasic.k};//近似圆的半径
var connerCollision = {c1:false , c2:false};
var phi;//非对心碰撞角度(篮筐碰撞)

var board_column = new Image();
board_column.src = "../../../../images/street-basketball-game-img/board_column.png";


var drawboard = function(){
    boardplace();
board.x=(boardbasic.x + 184*boardbasic.k*boardbasic.lr);
board.y=(boardbasic.y + 1*boardbasic.k);//左上角
board.w=(27*boardbasic.k);
board.h=(269*boardbasic.k);//篮板宽高
//篮框中心 判断得分
boardheart.x = (boardbasic.x + 85.5*boardbasic.k*boardbasic.lr);
boardheart.y=boardbasic.y + 240*boardbasic.k;
//篮筐左端(近似为圆)圆心
basketry.x1 = (boardbasic.x + 10.5*boardbasic.k*boardbasic.lr);
basketry.y1=boardbasic.y + 240*boardbasic.k;
//篮筐右端(近似为圆)圆心
basketry.x2=(boardbasic.x + 160.5*boardbasic.k*boardbasic.lr);
basketry.y2=boardbasic.y + 240*boardbasic.k;
basketry.r=10.5*boardbasic.k;//近似圆的半径
};
var collision = function(){
    drawboard();
    context.scale(boardbasic.lr,1);
    context.drawImage(board_img, 0, 0, 600,600,(boardbasic.x)*boardbasic.lr,Math.abs(boardbasic.y),Math.abs(600*boardbasic.k),Math.abs(600*boardbasic.k));
    context.drawImage(board_column,0, 0,600,600,(boardbasic.x)*boardbasic.lr,Math.abs(boardbasic.y),Math.abs(600*boardbasic.k),Math.abs(600*boardbasic.k));
    context.drawImage(board_column,354,293.94,32,306.1,(boardbasic.x+236.5*boardbasic.lr)*boardbasic.lr,Math.abs(boardbasic.y ) + 215,Math.abs(32*boardbasic.k), groundy - Math.abs(boardbasic.y ) - 215+20 );
    //context.beginPath();context.arc(100, 0, ball.r, 0, 360 * Math.PI / 180, true);context.moveTo(0, 0);context.lineTo(0, ball.r);context.fill();context.stroke();

    context.scale(boardbasic.lr,1);
    //console.log("boardbasic.x: "+boardbasic.x)
    
    //context.drawImage(board_img, 0, 0, 600,600,boardbasic.x,boardbasic.y,600*boardbasic.k,600*boardbasic.k);
    //context.drawImage(board_column,0, 0,600,600,boardbasic.x,boardbasic.y,600*boardbasic.k,600*boardbasic.k);
    //context.drawImage(board_column,0, 0,600,600,boardbasic.x,boardbasic.y,600*boardbasic.k,800*boardbasic.k);
    
    


    board_collision();//篮板碰撞
    basketry_collision();//篮筐碰撞
    bug_collision();//avoid bug  
    //测试用函数
    //fake_board();
};
//画一个假篮板
var fake_board = function(){
    context.fillStyle = 'rgba(129, 239, 32, 0.6)';
    //篮筐两端
    context.beginPath();context.arc(basketry.x1,basketry.y1, Math.abs(basketry.r), 0, 360 * Math.PI / 180, true);context.closePath();context.fill();
    context.fillStyle ="purple";
    context.beginPath();context.arc(basketry.x2,basketry.y2, Math.abs(basketry.r), 0, 360 * Math.PI / 180, true);context.closePath();context.fill();
    //篮筐中心
    context.beginPath();context.arc(boardheart.x,boardheart.y, Math.abs(basketry.r), 0, 360 * Math.PI / 180, true);context.closePath();context.fill();

    //篮板
    console.log("board.x:"+board.x);
    context.beginPath();
    context.moveTo(board.x,board.y);
    context.lineTo(board.x+board.w*boardbasic.lr,board.y);
    context.lineTo(board.x+board.w*boardbasic.lr,board.y+board.h);
    context.lineTo(board.x,board.y+board.h);
    context.closePath();
    context.fill();          
    
};
//篮板的随机出现以及进球加分效果

var scoreyes = function(){
    
    if ((Math.abs(ball.y - boardheart.y) <= 3) && (Math.abs(ball.x - boardheart.x) <= 30) && v_y <= 0){
        boardbasic.x = (Math.random()*(background_width-400) + 200);
       
        boardbasic.y = (Math.random()*200 + 100);
        scoreboard += 200 - Math.ceil(Math.abs(ball.x - boardheart.x)*10 +wind_v*5)  ;
        //console.log("ok,ball in");
    }
    //篮板随机出现的坐标；
};

var board_collision = function(){
    
    //单纯粗糙的碰板
    board.left=(ball.x + ball.r >= board.x);//左板之右
    board.right=(ball.x - ball.r <= board.x + board.w*boardbasic.lr);//右板之左
    board.up=(ball.y + ball.r >= board.y);//低于上端
    board.down=(ball.y - ball.r <= board.y + board.h);//高于上端
    //时间反演判断
    board.left0=(ghost_x[ghost_x.length-2] + ball.r >= board.x);//左板之右
    board.right0=(ghost_x[ghost_x.length-2] - ball.r <= board.x + board.w*boardbasic.lr);//右板之左
    board.up0=(ghost_y[ghost_y.length-2] + ball.r >= board.y);//低于上端
    board.down0=(ghost_y[ghost_y.length-2] - ball.r <= board.y + board.h);//高于上端
    //console.log(ghost_y[ghost_x.length-2]);
    
    if ( (board.left && board.right) && (board.up && board.down) ){
        if (!(board.left0 && board.right0)){
            v_back = -1*v_back;
            //console.log("board of l&r");
        }
        if (!(board.up0 && board.down0)){
            v_y = -0.8 * v_y;
            //console.log('我撞板了up or down');
        }
    }

    /*
    //find the colsest point!
    var VectorV = new Vector(v_x,v_y);
    var VectorOrigin = new Vector (ball.x,ball.y);
    var VectorR = new Vector(1,1);
    var VectorD = new Vector(1,1);
    var getV = function (){
        var VectorD_Normalize = VectorD.normalize();
        var Vector_i = VectorD_Normalize.multiply(-1 * VectorV.dot(VectorD_Normalize));
        var Vector_j = VectorV.add(Vector_i);
        var VectorNewV = Vector_j.add(Vector_i);
        v_x = VectorNewV.x + wind_v*fre*0.1;
        v_y = VectorNewV.y;
        //console.log(v_x);
        return v_x,v_y;
    };
    if (ball.x < board.x){closePoint.x = board.x}
    else if (ball.x > board.x + board.w){closePoint.x = board.x + board.w}
    else {closePoint.x = ball.x}
    if (ball.y < board.y){closePoint.y = board.y}
    else if (ball.y > board.y + board.h){closePoint.y = board.y + board.h}
    else {closePoint.y = ball .y}
    //get it!
    //just do it!
    if (distances(ball.x,ball.y,closePoint.x,closePoint.y) < ball.r){
        VectorR = new Vector(closePoint.x,closePoint.y);
        VectorD = VectorR.subtract(VectorOrigin);
        getV();
        if (v_x == NaN){console.log(closePoint.x,closePoint.y,ball.x,ball.y);}
        console.log('hit!');
        console.log(v_x,closePoint.x,closePoint.y);
    }
    */
    //测试用函数
    //fake_board();
};
var basketry_collision = function(){
    //碰篮框
    /*
    if (distances(basketry.x1,basketry.y1,ball.x,ball.y) <= ball.r+basketry.r){
        phi = Math.atan((basketry.y1-ball.y)/(basketry.x1-ball.x));
        v_x = 0.8*(Math.abs(-1*(Math.cos(2*phi)*v_x + Math.sin(2*phi)*v_y)));
        v_back = -1*v_back;
        v_y = 0.8*(Math.sin(2*phi)*v_y + Math.cos(2*phi)*v_y);
        console.log("left");
    }
    else if (distances(basketry.x2,basketry.y2,ball.x,ball.y) <= ball.r+basketry.r){
        phi = Math.atan((basketry.y2-ball.y)/(basketry.x2-ball.x));
        v_x = 0.8*(Math.abs(-1*(Math.cos(2*phi)*v_x + Math.sin(2*phi)*v_y)));
        v_back = -1*v_back;
        v_y = 0.8*(Math.sin(2*phi)*v_y + Math.cos(2*phi)*v_y);
        console.log("right");
    };*/
    
    var VectorV = new Vector(v_x,v_y);
    var VectorOrigin = new Vector (ball.x,ball.y);
    var VectorR = new Vector(1,1);
    var VectorD = new Vector(1,1);
    var getV = function (){

        var VectorD_Normalize = VectorD.normalize();
        var Vector_i = VectorD_Normalize.multiply(-1 * VectorV.dot(VectorD_Normalize));
        var Vector_j = VectorV.add(Vector_i);
        var VectorNewV = Vector_j.add(Vector_i);
        v_x = VectorNewV.x + wind_v*fre*0.1;
        v_y = VectorNewV.y;
        //console.log(v_x);
        return v_x,v_y;
    };
    //左篮框碰撞
    if ((distances(basketry.x1,basketry.y1,ball.x,ball.y) <= ball.r+basketry.r)){
        VectorR = new Vector(basketry.x1 , basketry.y1);
        VectorD = VectorR.subtract(VectorOrigin);
        getV();
    }
    //右篮框碰撞
    if ((distances(basketry.x2,basketry.y2,ball.x,ball.y) <= ball.r+basketry.r)){
        VectorR = new Vector (basketry.x2 , basketry.y2);
        VectorD = VectorR.subtract(VectorOrigin);
        getV();
    }
    //篮板四角碰撞
    /*
    if ((distances(board.x,board.y,ball.x,ball.y) <= ball.r+basketry.r)){
        VectorR = new Vector (board.x , board.y);
        VectorD = VectorR.subtract(VectorOrigin);
        getV();
    }
    if ((distances(board.x + board.w*boardbasic.lr,board.y,ball.x,ball.y) <= ball.r+basketry.r)){
        VectorR = new Vector (board.x + board.w*boardbasic.lr, board.y);
        VectorD = VectorR.subtract(VectorOrigin);
        getV();
    }
    if ((distances(board.x,board.y + board.h*boardbasic.lr,ball.x,ball.y) <= ball.r+basketry.r)){
        VectorR = new Vector (board.x , board.y + board.h*boardbasic.lr);
        VectorD = VectorR.subtract(VectorOrigin);
        getV();
    }
    if ((distances(board.x + board.w*boardbasic.lr,board.y + board.h*boardbasic.lr,ball.x,ball.y) <= ball.r+basketry.r)){
        VectorR = new Vector (board.x +board.w*boardbasic.lr, board.y + board.h*boardbasic.lr);
        VectorD = VectorR.subtract(VectorOrigin);
        getV();
    }
    */
    
    //角度改成phi了伟德

    
};
var bug_collision = function(){
    //小横板防卡图
    if (distances(basketry.x2 + 7*boardbasic.k,basketry.y2,ball.x,ball.y) < (basketry.r)){
        v_y = -30;
        v_x = -20;
        console.log("you were fall in bug!");
    }

};



//----------------------------------------//
//----------------------------------------//
//----------------开始表演!!!!-------------//
//----------------------------------------//
//----------------------------------------//
var ball_img = new Image();
ball_img.src = "../../../../images/street-basketball-game-img/ball2.png";
var background = new Image();
background.src = "../../../../images/street-basketball-game-img/background.jpg";
var background_begin = new Image();
background_begin.src = "../../../../images/street-basketball-game-img/background_begin.png";
var background_begin_word = new Image();
background_begin_word.src = "../../../../images/street-basketball-game-img/begin_words.png";
var background_over = new Image();
background_over.src = "../../../../images/street-basketball-game-img/background_over2.png";
ball_img.onload = function () {
    //width = ball_img.width;
    //height = ball_img.height;
    setInterval(function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate((canvas.width-background_width)/2,Math.abs(canvas.height-background_width*563/750)/2);

        //游戏开始界面
        if (!gamebegin){begin_interface();t=0;scoreboard=0;}
        else if (gamebegin && !gameover){
            //背景图
            context.drawImage(background, 0, 0, 750,563,0,-200,1500,1126);
            //数据显示
            context.font = "20px Arial";
            context.fillStyle ="black";
            /*
            context.fillText("ball.x: "+ball.x,120,20);
            context.fillText("ball.y: "+ball.y,120,60);
            context.fillText("v_y: "+v_y,20,120);
            context.fillText("v_x: "+v_x,20,80);
            context.fillText("v_back: "+v_x,220,180);
            */
            context.fillText("你的分数" + scoreboard,20,100);
            //context.fillText("台风风向→: "+wind_v,20,30);
            
            t_i = 60-Math.ceil(t/180 );
        
            {//给界面加一个整数计时器。
            t_itotal = t_i + t_iplus;
            context.fillText("时间:" + t_itotal,20,40) ;
            //context.fillText("距离" + p_distance,100,200) ;
            }
            //判断游戏结束
            if (t_itotal<=0){
                gameover=true;
                //console.log("game over");
            }
            
            {//打包代码运行处

            //篮球特效
            ghost();//篮球残影
            shadow();//篮球影子
            ball_rotate();//篮球旋转
            //篮球运动
            BBU();//篮球弹跳
            level_move();//篮球水平移动

            collision();//碰撞
            
            //道具
            prop_clock();//闹钟道具
            prop_wind();//台风
            
            scoreyes();//得分
            
            scoreShow();//计分板
            }
            t++;//时间增加

            
            
        }
        else {end_interface();scoreShow();}//游戏结束界面
        //后门
        if (backdoor.count == 5){
            context.font = "20px Arial";
            context.fillStyle ="black";
            context.fillText("嘎吱~你打开了一扇后门!",850,20);
        }
        context.restore();
    }, 1000 *1/ (60*3));
    

};
