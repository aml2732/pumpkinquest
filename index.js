console.log("game app loaded");
console.log('levels', levels);
var app = new PIXI.Application({ width: 800, height: 600 });
var graphics = new PIXI.Graphics();
let loader = PIXI.Loader.shared;
let Sprite = PIXI.Sprite;
let difficulty = 'easy';
let subLevel = 0;
var stageSizes = {
  'easy': {r: 8, c:8, offsetX:100, offsetY:0, scale: 60},
  'medium': {r: 10, c:10, offsetX:100, offsetY: 20, scale: 45},
  'hard': {r: 15, c:15, offsetX:200, offsetY: 40, scale: 30}
}
//let resources = PIXI.loader.resources;
document.body.appendChild(app.view);

var startStage, levelSelectStage, mazeStage;
var player;
var left, right, up, down;
var digitalX, digitalY;


function init(){
  loader
  .add('pumpkincrow','./img/pumpkinGoal.png')
  .add('mazewall','./img/mazeWall.png')
  .add('button', './img/signButton.png')
  .add('player', './img/player.png')
  .load(startScreen);
}

function startScreen(){
  startStage = new PIXI.Container();
  app.renderer.backgroundColor = "0xE79C29";

  var startTextHeader = new PIXI.Text(`Pumpkin Quest`, {"fill": "black", "fontSize": "3rem","align":"right"});
  startTextHeader.x = 50;
  startTextHeader.y = app.renderer.height/2 -120;

  //Draw start button
  var startButton = new Sprite(loader.resources.button.texture);
  startButton.x = 50;
  startButton.y = app.renderer.height/2 - 20;
  startButton.interactive = true;
  startButton.buttonMode = true;
  var startText = new PIXI.Text('Start -->', {"fill": "white", "align": "center"});
  startText.x = startButton.x  +20;
  startText.y = 30;
  startButton.addChild(startText);
  startButton.on('pointerdown', levelSelect);

  //Draw pumpkincrow in field.
  var startGraphic1 = new Sprite(loader.resources.pumpkincrow.texture);
  startGraphic1.x = app.renderer.width - 250;
  startGraphic1.y = app.renderer.height/2 - 60;
  var startGraphic2 = new Sprite(loader.resources.mazewall.texture);
  startGraphic2.x  = app.renderer.width - 290;
  startGraphic2.y = app.renderer.height/2;
  var startGraphic3 = new Sprite(loader.resources.mazewall.texture);
  startGraphic3.x  = app.renderer.width - 190;
  startGraphic3.y = app.renderer.height/2;

  startStage.addChild(startTextHeader);
  startStage.addChild(startButton);
  startStage.addChild(startGraphic1);
  startStage.addChild(startGraphic2);
  startStage.addChild(startGraphic3);
  app.stage.addChild(startStage);
  app.renderer.render(startStage);
}

function selectDifficulty(){
  levelSelectStage = new PIXI.Container();
  app.renderer.backgroundColor = "0xE79C29";

  var levelEasyButton = new Sprite(loader.resources.button.texture);
  levelEasyButton.x = 50;
  levelEasyButton.y = app.renderer.height/4 - 20;
  levelEasyButton.interactive = true;
  levelEasyButton.buttonMode = true;
  var levelEasyText = new PIXI.Text('Easy -->', {"fill": "white", "align": "center"});
  levelEasyText.x = levelEasyButton.x  +20;
  levelEasyText.y = 30;
  levelEasyButton.addChild(levelEasyText);
  levelEasyButton.on('pointerdown', function(){
    difficulty = 'easy';
    subLevel = 0;
    beginGame();
  });

  var levelMediumButton = new Sprite(loader.resources.button.texture);
  levelMediumButton.x = 50;
  levelMediumButton.y = (app.renderer.height/2) - 20;
  levelMediumButton.interactive = true;
  levelMediumButton.buttonMode = true;
  var levelMediumText = new PIXI.Text('Medium -->', {"fill": "white", "align": "center"});
  levelMediumText.x = levelMediumButton.x  +20;
  levelMediumText.y = 30;
  levelMediumButton.addChild(levelMediumText);
  levelMediumButton.on('pointerdown', function(){
    difficulty = "medium";
    subLevel = 0;
    beginGame();
  });

  var levelHardButton = new Sprite(loader.resources.button.texture);
  levelHardButton.x = 50;
  levelHardButton.y = ((app.renderer.height/4)*3) - 20;
  levelHardButton.interactive = true;
  levelHardButton.buttonMode = true;
  var levelHardText = new PIXI.Text('Hard -->', {"fill": "white", "align": "center"});
  levelHardText.x = levelHardButton.x  +20;
  levelHardText.y = 30;
  levelHardButton.addChild(levelHardText);
  levelHardButton.on('pointerdown', function(){
    difficulty = "hard";
    subLevel = 0;
    beginGame();
  });

  levelSelectStage.addChild(levelEasyButton);
  levelSelectStage.addChild(levelMediumButton);
  levelSelectStage.addChild(levelHardButton);
  app.stage.addChild(levelSelectStage);
  app.renderer.render(levelSelectStage);
}

//This function is coppied verbatim from here: https://github.com/kittykatattack/learningPixi
function keyboard(value) {
  const key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function downHandler(event) {
    if (event.key === key.value) {
      if (key.isUp && key.press) {
        key.press();
      }
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = function upHandler(event) {
    if (event.key === key.value) {
      if (key.isDown && key.release) {
        key.release();
      }
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);

  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);

  // Detach event listeners
  key.unsubscribe = function unsubscribe() {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };

  return key;
}

function movePlayer(){
   var scale = stageSizes[difficulty].scale;
   var radiusSize = 15;
   console.log(`digital x,y (${digitalX}, ${digitalY})`)
   tempX = ((app.renderer.width-scale)/stageSizes[difficulty].r)+(digitalX*scale)+stageSizes[difficulty].offsetX+(scale/2);
   tempY = ((app.renderer.height-scale)/stageSizes[difficulty].c)+(digitalY*scale) + stageSizes[difficulty].offsetY+(scale/2);
   player.position.set(tempX, tempY)
  //console.log(`actual x,y (${player.x}, ${player.y})`)

}

function setupKeyBehaviors(){
  let currentMaze = levels[difficulty][subLevel%levels[difficulty].length];
  console.log(currentMaze);
  left = keyboard("ArrowLeft");
  up = keyboard("ArrowUp");
  right = keyboard("ArrowRight");
  down = keyboard("ArrowDown");

  function isOutBoundChecks(x,y){
    return (x<0) || (y<0) || x>currentMaze.length || y>currentMaze[0].length;
  }

  left.press= function(){
    console.log('clicked left')
    //Calculate if user can move left
    if(isOutBoundChecks(digitalX-1, digitalY)){return;}
    console.log('gothere 1')
    var cell = currentMaze[digitalY][digitalX];
    console.log('cell?', cell)
    console.log('gothere 2')
    if(cell.left){return;}
    console.log('got here 3')
    digitalX = digitalX-1;
    //If they can move left, update player value
    movePlayer();
  }

  /*left.release = function(){
    player.x = 0;
  }*/

  right.press= function(){
    console.log('clicked right');
    //Calculate if user can move right
    if(isOutBoundChecks(digitalX+1, digitalY)){return;}
    var cell = currentMaze[digitalY][digitalX];
    console.log('cell?', cell)
    if(cell.right){return;}
    digitalX = digitalX+1;
    //If they can move left, update player value
    movePlayer();
  }

  //right.release = left.release;

}


function drawPlayer(x,y){
   var scale = stageSizes[difficulty].scale;
   var radiusSize = 15;
   player = new Sprite(loader.resources.player.texture);
   player.x =  ((app.renderer.width-scale)/stageSizes[difficulty].r)+(digitalX*scale)+stageSizes[difficulty].offsetX+(scale/2)
   player.y = ((app.renderer.height-scale)/stageSizes[difficulty].c)+(digitalY*scale) + stageSizes[difficulty].offsetY+(scale/2)
   player.width = scale/2;
   player.height=scale/2;
   /*
   player = new PIXI.Graphics();
   player.beginFill(0x000000);
   player.drawCircle(
     ((app.renderer.width-scale)/stageSizes[difficulty].r)+(digitalX*scale)+stageSizes[difficulty].offsetX+(scale/2+radiusSize/2),
     ((app.renderer.height-scale)/stageSizes[difficulty].c)+(digitalY*scale) + stageSizes[difficulty].offsetY+(scale/2+radiusSize/2),
     15);
   player.endFill();
   */
   mazeStage.addChild(player);
}

function drawMaze(currentMaze){
  var scale = stageSizes[difficulty].scale;

  currentMaze.forEach(function ilevelfunc(itemI, indexI){
    currentMaze[indexI].forEach(function(itemJ, indexJ){

      if(currentMaze[indexI][indexJ].left){
        var mazewallLeft = new Sprite(loader.resources.mazewall.texture);
        mazewallLeft.width = scale/4;
        mazewallLeft.height = scale*1.25;
        mazewallLeft.x = ((app.renderer.width-scale)/stageSizes[difficulty].r)+(itemJ.x*scale) + stageSizes[difficulty].offsetX;
        mazewallLeft.y = ((app.renderer.height-scale)/stageSizes[difficulty].c)+(itemJ.y*scale) + stageSizes[difficulty].offsetY;
        mazeStage.addChild(mazewallLeft);
      }

      if(currentMaze[indexI][indexJ].top){
        var mazewallTop = new Sprite(loader.resources.mazewall.texture);
        mazewallTop.width = scale;
        mazewallTop.height = scale/4;
        mazewallTop.x = ((app.renderer.width-scale)/stageSizes[difficulty].r)+(itemJ.x*scale)+ stageSizes[difficulty].offsetX;
        mazewallTop.y = ((app.renderer.height-scale)/stageSizes[difficulty].c)+(itemJ.y*scale) + stageSizes[difficulty].offsetY;
        mazeStage.addChild(mazewallTop);
      }

      if(currentMaze[indexI][indexJ].right){
        var mazewallRight = new Sprite(loader.resources.mazewall.texture);
        mazewallRight.width = scale/4;
        mazewallRight.height = scale*1.25;
        mazewallRight.x = ((app.renderer.width-scale)/stageSizes[difficulty].r)+(itemJ.x*scale) + (scale)+ stageSizes[difficulty].offsetX;
        mazewallRight.y = ((app.renderer.height-scale)/stageSizes[difficulty].c)+(itemJ.y*scale)+ stageSizes[difficulty].offsetY;
        mazeStage.addChild(mazewallRight);
      }

      if(currentMaze[indexI][indexJ].bottom){
        var mazewallBottom = new Sprite(loader.resources.mazewall.texture);
        mazewallBottom.width = scale;
        mazewallBottom.height = scale/4;
        mazewallBottom.x = ((app.renderer.width-scale)/stageSizes[difficulty].r)+(itemJ.x*scale)+ stageSizes[difficulty].offsetX;
        mazewallBottom.y = ((app.renderer.height-scale)/stageSizes[difficulty].c)+(itemJ.y*scale)+(scale) + stageSizes[difficulty].offsetY;
        mazeStage.addChild(mazewallBottom);
      }

      //test reference icon
      var test = new Sprite(loader.resources.button.texture);
      test.width = 5;
      test.height = 5;
      test.x = ((app.renderer.width-scale)/stageSizes[difficulty].r)+(indexJ*scale) +15+ stageSizes[difficulty].offsetX;
      test.y = ((app.renderer.height-scale)/stageSizes[difficulty].c)+(indexI*scale) +15 + stageSizes[difficulty].offsetY;
      mazeStage.addChild(test);

    })
  })

  //Draw startpoint
  var startPoint = new Sprite(loader.resources.button.texture);
  startPoint.x = ((app.renderer.width-scale)/stageSizes[difficulty].r) -50+ stageSizes[difficulty].offsetX;
  startPoint.y = ((app.renderer.height-scale)/stageSizes[difficulty].c) -50 + stageSizes[difficulty].offsetY;
  startPoint.width =100;
  startPoint.height =50;
  var startPointText = new PIXI.Text('Start -->', {"fill": "white", "align": "center"});
  startPointText.x =   50;
  startPointText.y = 30;
  startPoint.addChild(startPointText);
  mazeStage.addChild(startPoint)

  //Draw endpoint
  var goal = new Sprite(loader.resources.pumpkincrow.texture);
  goal.x = app.renderer.width - (goal.width );
  goal.y = app.renderer.height - (goal.height );
  mazeStage.addChild(goal)

  //Generate digital map to track your location through the maze.
  digitalX=0;
  digitalY=0;

}

function playMaze(){
  mazeStage = new PIXI.Container();
  app.renderer.backgroundColor = "0xE79C29";
  var currentMaze = levels[difficulty][subLevel%levels[difficulty].length];
  console.log(currentMaze);
  drawMaze(currentMaze);
  drawPlayer(0,0);
  setupKeyBehaviors();
  app.stage.addChild(mazeStage);
  app.renderer.render(mazeStage);
}

function beginGame(){
  console.log('begingame difficulty:', difficulty);
  app.stage.removeChild(levelSelectStage);
  playMaze();
}

function levelSelect(){
  console.log('levelSelect');
  app.stage.removeChild(startStage);
  selectDifficulty();
}

init();
