//--------------------------------
//          方塊物件
//--------------------------------
var blockdata = [
  {selector:'.block1', name:'1', pitch:'1'},
  {selector:'.block2', name:'2', pitch:'2'},
  {selector:'.block3', name:'3', pitch:'3'},
  {selector:'.block4', name:'4', pitch:'4'}
]

var soundsetdata = [
  {name: "correct", sets: [1,3,5,8] },
  {name: "wrong", sets: [2,4,5.5,7] }
]

var leveDatas = [
  "12",
  "12324",
  "231234",
  "41233412",
  "41323134132",
  "2342341231231423414232"
]

var Blocks = function(blockAssign,setAssign){
  this.allOn = false
  this.blocks = blockAssign.map((d,i)=>
    ({
      name: d.name,
      el: $(d.selector),
      audio: this.getAudioObject(d.pitch) 
    })
  )
  this.soundSets = setAssign.map((d,i)=>
    ({
      name: d.name,
      sets: d.sets.map((pitch)=>this.getAudioObject(pitch))
    })
  )
}

Blocks.prototype.flash = function(note){
  let block = this.blocks.find(d=>d.name==note)
  if (block){
    block.audio.currentTime=0
    block.audio.play()
    block.el.addClass("active")
    setTimeout(()=>{
      if (this.allOn==false){
        block.el.removeClass("active")
      }
    },100)
  }
}

Blocks.prototype.turnAllOn = function(){
  this.allOn=true
  this.blocks.forEach((block)=>{
    block.el.addClass("active")
  })
}

Blocks.prototype.turnAllOff = function(){
  this.allOn=false
  this.blocks.forEach((block)=>{
    block.el.removeClass("active")
  })
}

Blocks.prototype.getAudioObject=function(pitch){
  var audio =  new Audio("https://awiclass.monoame.com/pianosound/set/"+ pitch+".wav")
  audio.setAttribute("preload","auto")
  return audio
}

Blocks.prototype.playSet = function(type){
  let sets = this.soundSets.find(set => set.name==type).sets
    sets.forEach((obj)=>{
      obj.currentTime=0
      obj.play()
    })
}

var Game = function(){
  this.blocks = new Blocks(blockdata,soundsetdata)
  this.levels = leveDatas
  this.currentLevel = 0 //關卡
  this.playInterval = 400 //時間
  this.mode = 'waiting' //目前狀況
}

Game.prototype.loadLevels = function(){
  let _this = this
  $.ajax({
    url: "https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata",
    success: function(res){
      _this.levels = res
    }
  })
}

Game.prototype.startLevel = function(){
  this.showMessage("Level " + this.currentLevel)
  let leveldata = this.levels[this.currentLevel]
  this.startGame(leveldata)
}

Game.prototype.showMessage = function(mes){
  console.log(mes)
  $('.status').text(mes)
}

Game.prototype.startGame = function(answer){
  this.mode = 'gamePlay' 
  this.answer = answer
  let notes = this.answer.split("")
  this.showStatus("")
  this.timer = setInterval(() => {
    let char = notes.shift()
    // console.log(char)
    this.playNote(char)
    if(!notes.length){
      console.log("audio play end")
      this.startUserInput()
      clearInterval(this.timer)
    }
  },this.playInterval)
}

Game.prototype.playNote = function(note){
  console.log(note)
  this.blocks.flash(note)
}

Game.prototype.startUserInput = function(){
  this.userInput = ""
  this.mode = "userInput"
}

Game.prototype.userSendInput = function(inputChar){
  if(this.mode == 'userInput'){
    let tempString = this.userInput + inputChar
    this.playNote(inputChar)
    this.showStatus(tempString)
    if(this.answer.indexOf(tempString)==0){
      console.log('Good job!')
      if(this.answer==tempString){
         this.showMessage("Correct")
         this.currentLevel++
         this.mode = "waiting"
          setTimeout(()=>{
            this.startLevel()
          },1000)
        // console.log('correct')
      }
    }else{
      this.showMessage("Wrong")
      this.currentLevel--
      // this.currentLevel = Math.min(0)
      if(this.currentLevel < 0){
        this.currentLevel = 0
      }
      this.mode = "waiting"
       setTimeout(()=>{
        this.startLevel()
      },1000)
    }
    console.log(tempString)
    this.userInput += inputChar
  }
}

Game.prototype.showStatus = function(tempString){
  $(".inputStatus").html("")
  this.answer.split("").forEach((d,i)=>{
      var circle = $("<div class='circle'></div>")
      if(i<tempString.length){
        circle.addClass("correct")
      }
     $(".inputStatus").append(circle)
  })
  if(tempString==""){
    this.blocks.turnAllOff()
  }
  if(tempString == this.answer){
     $(".inputStatus").addClass("correct")
    setTimeout(()=>{
      this.blocks.turnAllOn()
      this.blocks.playSet("correct")
    },500)
  }else{
     $(".inputStatus").removeClass("correct")
  }
  if(this.answer.indexOf(tempString)!=0){
    $(".inputStatus").addClass("wrong")
    setTimeout(()=>{
      this.blocks.turnAllOn()
      this.blocks.playSet("wrong")
    },500)
  }else{
    $(".inputStatus").removeClass("wrong")
  }
}

var game = new Game()
// game.startGame()
game.loadLevels()
setTimeout(()=>{
  game.startLevel()
},1000)





