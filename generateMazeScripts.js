const generator = require('generate-maze');
var fs = require('fs');

const numberOfEasyMazes = 10;
const numberOfMediumMazes = 5;
const numberOfHardMazes = 3;


async function runner(){
  let easyMazes = [];
  let mediumMazes = [];
  let hardMazes = [];

  console.log("Began generating easy mazes...")
  for(let i=0;i<numberOfEasyMazes; i++){
    easyMazes.push(generator(8, 8, true, i));
  }

  console.log("Begin generating medium mazes...");
  for(let i=0;i<numberOfMediumMazes; i++){
    mediumMazes.push(generator(10, 10, true, i));
  }

  console.log("Begin generating hard mazes...");
  for(let i=0;i<numberOfHardMazes; i++){
    hardMazes.push(generator(15, 15, true, i));
  }

  const output = {
    easy: easyMazes,
    medium: mediumMazes,
    hard: hardMazes
  }

  const writeToFile = `var levels = ${JSON.stringify(output)};`

  await fs.writeFile('./levels.js', writeToFile, 'utf8', function(){return true;});

  console.log("Levels Generated...")
}

runner();
