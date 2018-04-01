var ticker, accTime=0, lastTime=Date.now(), desiredTimeInterval=15, timeInterval=desiredTimeInterval;
function tick() {
  if (ready) {
    const deltaTime = Date.now() - lastTime;
    lastTime = Date.now();
    accTime += deltaTime;
    if (accTime >= timeInterval) {
      accTime = 0;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      lzs.forEach( lz => lz.draw(ctx) );
      for (var i = 0; i < emojis.length; i++) {
        handleProximity(i);
        if (!emojis[i]) continue;
        emojis[i].move();
        emojis[i].draw();
        if (emojis[i].wayOff()) {
          emojis.splice(i, 1);
          console.log('deleted wayOff emoji');
          // emojis.push( spawnEmoji() );
        }
      }
      // smartSpawning();
      while ( emojis.length < Math.floor(score/5) ) {
        emojis.push( spawnEmoji() );
      }
      drawScore();
    }
  }
  ticker = requestAnimationFrame(tick);
}
ticker = requestAnimationFrame(tick);

var ready, selectedEmoji, ctx, emojis, lzs, score,
    test, gameOver, mousePos,
    emojiTypes,
    happy, worried, dead, shocked,
    bigHappy, bigWorried, bigDead, bigShocked,
    smallHappy, smallWorried, smallDead, smallShocked;

const colors = ['blue', 'red'];
document.addEventListener('DOMContentLoaded', () => {
  happy = new Image(47, 47);
  worried = new Image(47, 47);
  dead = new Image(47, 47);
  shocked = new Image(47, 47);
  bigHappy = new Image(57, 57);
  smallHappy = new Image(37, 37);
  happy.src = "./emojis/eyeglasses-black-face-emoticon.png";
  worried.src = "./emojis/worried-black-face.png";
  dead.src = "./emojis/astonished-black-emoticon-face.png";
  shocked.src = "./emojis/flashed-black-emoticon-face.png";
  bigHappy.src = "./emojis/moustache-male-black-emoticon-face.png";
  smallHappy.src = "./emojis/laughing-emoticon-black-happy-face.png";
  var collect = imgCollect(6);
  happy.onload = () => ( collect = collect() );
  worried.onload = () => ( collect = collect() );
  dead.onload = () => ( collect = collect() );
  shocked.onload = () => ( collect = collect() );
  bigHappy.onload = () => ( collect = collect() );
  smallHappy.onload = () => ( collect = collect() );
  emojiTypes = {
    regular: {
      faces: {happy, worried, dead, shocked},
      radius: 25,
      speed: 1
    },
    big: {
      faces: {happy:bigHappy, worried, dead, shocked},
      radius: 30,
      speed: .65
    },
    small: {
      faces: {happy:smallHappy, worried, dead, shocked},
      radius: 20,
      speed: 1.5
    }
  };
});

function imgCollect(n) {
  var count = 0;
  const collector = () => {
    count++;
    if (count === n) {
      const canvas = document.getElementById("contentContainer");
      ctx = canvas.getContext("2d");
      newGame();
      ready = true;
    } else {
      return collector;
    }
  };
  return collector;
}
var keyDown = false;
function newGame() {
  gameOver = false;
  ctx.canvas.removeEventListener("mousedown", newGame);
  ctx.canvas.addEventListener("mousedown", selectEmoji);
  document.body.onkeydown = (e) => {
    if(keyDown===false && (e.keyCode === 32 || e.key === ' ')) {
      keyDown = true; selectEmoji(e);
    }
  };
  ctx.canvas.addEventListener("mousedown", secretRegularSpeed);
  ctx.canvas.addEventListener("mousedown", secretSlowerSpeed);
  ctx.canvas.addEventListener("mouseup", () => (
    selectedEmoji = null
  ));
  document.body.onkeyup = (e) => {
    if(e.keyCode === 32 || e.key === ' ') {
      keyDown = false; selectedEmoji = null;
    }
  };
  ctx.canvas.addEventListener("mousemove", getMousePos);
  ctx.canvas.addEventListener("mousemove", () => buildRoute(mousePos));
  emojis = [];
  emojis.push( spawnEmoji() );
  emojis.push( spawnEmoji() );
  lzs = spawnLZs(2);
  score = 0;
  timeInterval = desiredTimeInterval;
}
function secretRegularSpeed(e) {
  if ( mousePos.x < 15 && mousePos.y < 15 ) {
    timeInterval = desiredTimeInterval;
  }
}
function secretSlowerSpeed(e) {
  if ( mousePos.x > ctx.canvas.width-15 && mousePos.y < 15 ) {
    timeInterval += timeInterval;
    console.log(timeInterval);
  }
}

class LandingZone {
  constructor(options) {
    this.radius = options.radius;
    this.x = options.x;
    this.y = options.y;
    this.color = options.color;
  }
  draw(ctx) {
    ctx.strokeStyle=this.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.arc(this.x, this.y, this.radius-10, 0, 2 * Math.PI);
    ctx.arc(this.x, this.y, this.radius-20, 0, 2 * Math.PI);
    ctx.stroke();
  }
}
// function mouseCollidesWith(lz) {
//   console.log(`mouseCollidesWith was called`);
//   var distance = distanceBetween(mousePos, lz);
//   if ( distance < mousePos + lz.radius ) {
//     console.log(`it does collide`);
//     return true;
//   }
//   console.log(`it does not collide`);
//   return false;
// }
function drawSpeedButtons() {
  ctx.fillStyle = 'grey';
  ctx.fillRect(0, 0, 33, 20);
  ctx.fillStyle = 'black';
  ctx.font = '10px Arial';
  ctx.fillText('normal', 0, 10);
  ctx.fillText('speed', 0, 18);
}
function drawScore() {
  ctx.textAlign='center';
  ctx.fillStyle = 'white';
  ctx.font = "20px Arial";
  ctx.fillText(score, ctx.canvas.width/2, ctx.canvas.height-10);
  ctx.globalAlpha = 0.5;
  ctx.textAlign='left';
  ctx.font = "20px Arial";
  if (score<=2) {
    ctx.fillText( 'click and drag an emoji to draw its path home...', 20, 40 );
  }
  if (score >= 2 && score <= 4) {
    ctx.fillText( 'you can use SPACEBAR instead of LMB if you prefer...', 20, 60 );
  }
  if (score >= 3 && score <= 4) {
    ctx.fillText( 'they don\'t mind...', 20, 80 );
  }
  if (score >= 4 && score <= 5) {
    ctx.fillText( 'just don\'t let them collide...', 20, 100 );
  }
  if (score >= 5 && score <= 6) {
    ctx.fillText( 'emojis HATE collisions...', 20, 120 );
  }
  if (score >= 6 && score <= 6) {
    ctx.fillText( 'also they\'ll die', 245, 120 );
  }
  if (score >= 7 && score <= 8) {
    ctx.fillText( 'bouncing off walls is cool though...', 20, 140 );
  }
  if (score >= 8 && score <= 8) {
    ctx.fillText( '(not a reccommended strategy)...', 20, 160 );
  }
  if (score >= 9 && score <= 10) {
    ctx.fillText( 'ENJOY :]', 20, 190 );
  }
  if (gameOver) {
    ctx.textAlign='center';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle='purple';
    ctx.font = "130px Arial";
    ctx.fillText('GAME',ctx.canvas.width/2, (ctx.canvas.height/2)-10);
    ctx.fillText('OVER',ctx.canvas.width/2, (ctx.canvas.height/2)+90);
    ctx.fillStyle = 'white';
    ctx.font = "20px Arial";
    ctx.fillText(
      'click anywhere to play again',
      ctx.canvas.width/2,
      ctx.canvas.height-40
    );
  }
  ctx.globalAlpha = 1;
  drawSpeedButtons();
}
function handleProximity(i) {
  if ( emojis[i].route.length >= 2 && !emojis[i].lz ) {
    for (var lzi = 0; lzi < lzs.length; lzi++) {
      if (
      !emojis[i].landing
      && emojis[i].color === lzs[lzi].color
      && emojis[i].collidesWith(lzs[lzi])
      ) {
        console.log( 'emoji landing' );
        emojis[i].landing = true;
        emojis[i].route = pointsBetween(emojis[i], lzs[lzi]);
        score++;
        emojis[i].lz = lzs[lzi];
        if (score < 10) {
          emojis.push( spawnEmoji() );
        }
        // else {
        //   while ( emojis.length < Math.floor(score/5) ) {
        //   // while (
        //   //   emojis.filter(emoji => emoji.landing === false)
        //   //   < Math.floor(score/5)
        //   // ) {
        //     emojis.push( spawnEmoji() );
        //   }
        // }
        return;
      }
    }
  } else if (emojis[i].radius <= 5) emojis.splice(i, 1);
  for (var j = 0; j < emojis.length; j++) {
    if ( i === j || !emojis[i] ) continue;
    if ( emojis[i].nearlyCollidesWith(emojis[j]) ) {
      emojis[i].changeFace(emojis[i].faces.worried);
    } else {
      emojis[i].changeFace(emojis[i].faces.happy);
    }
    if ( emojis[i].collidesWith(emojis[j]) ) {
      gameOver = true;
      ctx.canvas.addEventListener("mousedown", newGame);
      ctx.canvas.removeEventListener("mousedown", selectEmoji);
      ctx.canvas.removeEventListener("mouseup", () => ( selectedEmoji = null ));
      ctx.canvas.removeEventListener("mousemove", buildRoute);
      emojis[i].changeFace(emojis[i].faces.dead);
      emojis[i].vector = { vx:0, vy:0 };
      emojis[i].route = [];
      return;
    }
  }
}
function spawnPoint(ctx) {
  const spawnAreas = [
    [[-55, -5], [-55, ctx.canvas.height+55]],
    [[-5, ctx.canvas.width-5], [-55, -5]],
    [[ctx.canvas.width+5, ctx.canvas.width+55], [-55, ctx.canvas.height+55]],
    [[-5, ctx.canvas.width-5], [ctx.canvas.height+5, ctx.canvas.height+55]]
  ];
  const area = spawnAreas[Math.floor(Math.random()*spawnAreas.length)];
  const [x, y] = area.map( range => getRandomInt(...range) );
  return { x, y };
}
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function spawnEmoji() {
  console.log(`spawnEmoji was called`);
  const color = colors[Math.floor(Math.random()*colors.length)];
  var types = ['regular', 'regular', 'big', 'small'];
  var type = types[Math.floor(Math.random()*types.length)];
  type = emojiTypes[type];
  var p = Object.assign({}, type, spawnPoint(ctx));
  var closeCall = true;
  while (closeCall) {
    closeCall = false;
    for (var i = 0; i < emojis.length; i++) {
      if (emojis[i].inVicinityOf(p)) {
        p = Object.assign({}, type, spawnPoint(ctx));
        closeCall = true;
        break;
      }
    }
  }
  let emoji = Object.assign({}, {ctx}, {color}, p);
  // console.log(`new emoji below:`);
  // console.log(emoji);
  return new Emoji(emoji);
}
function spawnLZs(n) {
  const LZArr = [];
  for (var i = 0; i < colors.length; i++) {
    const x = getRandomInt(100, ctx.canvas.width-100);
    const y = getRandomInt(100, ctx.canvas.height-100);
    LZArr.push( new LandingZone(
      { radius:25, color: colors[i], x, y }
    ));
  }
  return LZArr;
}
function checkWithinBounds(point, radius=0) {
  return (
       point.x-radius >= 0
    && point.x+radius <= ctx.canvas.width
    && point.y-radius >= 0
    && point.y+radius <= ctx.canvas.height
  );
}
class Emoji {
  constructor(options) {
    this.withinBounds = false;
    this.canCollide = false;
    this.ctx = options.ctx;
    this.faces = options.faces;
    this.face = options.faces.happy;
    this.radius = options.radius;
    this.x = options.x;
    this.y = options.y;
    this.route = [];
    this.speed = (options.speed || 1);
    this.vector = this.randomVector();
    this.color = options.color;
    this.landing = false;
  }
  randomVector() {
    const angle = getRandomFloat(0, 2*Math.PI);
    var vx = Math.cos(angle) * this.speed;
    var vy = Math.sin(angle) * this.speed;
    const mx = this.ctx.canvas.width/2;
    const my = this.ctx.canvas.height/2;
    if (this.x >= mx) {
      vx = Math.abs(vx) * -1;
    } else {
      vx = Math.abs(vx);
    }
    if (this.y >= my) {
      vy = Math.abs(vy) * -1;
    } else {
      vy = Math.abs(vy);
    }
    return { vx, vy };
  }
  draw() {
    if ( this.route.length >= 2 ) {
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = Math.floor(this.radius/8.3);
      for (var i = 1; i < this.route.length; i+=10) {
        let a = this.route[i-5] || this;
        let b = this.route[i];
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.stroke();
      }
    }
    if (!this.canCollide) {
      this.ctx.strokeStyle = 'grey';
    } else {
      this.ctx.strokeStyle = this.color;
    }
    this.ctx.fillStyle = this.color;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.drawImage(
      this.face,
      this.x-(this.radius-1.5),
      this.y-(this.radius-1.5),
      this.radius*2-3, this.radius*2-3
    );
  }
  wayOff() {
   if (
        this.x < 0-55
     || this.x > this.ctx.canvas.width+55
   ) {
     return true;
   }
   if (
        this.y < 0-55
     || this.y > this.ctx.canvas.height+55
   ) {
     return true;
   }
  }
  bounce() {
    if ( this.withinBounds ) {
      if (
           this.x-this.radius <= 0
        || this.x+this.radius >= this.ctx.canvas.width
      ) {
        this.vector.vx *= -1;
      }
      if (
           this.y-this.radius <= 0
        || this.y+this.radius >= this.ctx.canvas.height
      ) {
        this.vector.vy *= -1;
      }
    }
  }
  move() {
    if (!this.landing && !this.canCollide) {
      this.canCollide = checkWithinBounds(this,0);
    }
    if (!this.withinBounds) {
      this.withinBounds = checkWithinBounds(this, this.radius);
    }
    if (this.route.length >= 2) {
      if (this.route.length === 2) {
      this.getPassiveVector();
      }
      this.activeMove();
    } else {
      this.passiveMove();
    }
    if (this.lz) {
      this.land();
    }
  }
  activeMove() {
    this.route.splice(0, 1);
    const { x, y } = this.route[0];
    this.x = x;
    this.y = y;
  }
  getPassiveVector() {
    const ax = this.route[1].x;
    const bx = this.route[0].x;
    const by = this.route[0].y;
    const ay = this.route[1].y;
    this.vector = {
      vx: ax-bx,
      vy: ay-by
    };
  }
  passiveMove() {
    this.bounce();
    this.x += this.vector.vx;
    this.y += this.vector.vy;
  }
  land() {
    if (this.route.length <= 5) {
      this.vector = { vx:0, vy:0 };
    }
    this.canCollide = false;
    this.radius *= 0.98;
  }
  collidesWith(that) {
    var distance = distanceBetween(this, that);
    if ( distance < this.radius + that.radius ) {
      if (that instanceof Emoji) {
        if ( this.canCollide && that.canCollide ) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }
  nearlyCollidesWith(that) {
    var distance = distanceBetween(this, that) - 30;
    if ( distance < this.radius + that.radius ) {
      return true;
    }
    return false;
  }
  inVicinityOf(that) {
    var distance = distanceBetween(this, that) - 100;
    if ( distance < this.radius + that.radius ) {
      return true;
    }
    return false;
  }
  changeFace(face) {
    if (this.face !== face) {
      this.face = face;
    }
  }
}
function selectEmoji(e) {
  if (mousePos === undefined) {
    mousePos = getMousePos(e);
  }
  console.log(`mousedown @ ${mousePos.x}, ${mousePos.y}`);
  emojis.forEach( emoji => {
    if ( Math.abs(mousePos.x-emoji.x) <= emoji.radius
      && Math.abs(mousePos.y-emoji.y) <= emoji.radius ) {
      emoji.route = [];
      selectedEmoji = emoji;
    }
  });
}
function getMousePos(e) {
  const parentPos = getPosition(e.currentTarget);
  const x = e.clientX - parentPos.x;
  const y = e.clientY - parentPos.y;
  mousePos = { x, y };
}
function pointsBetween(a, b) {
  const distance = distanceBetween(a, b);
  const angle = angleBetween(a, b);
  const points = [];
  for (var i = 0; i < distance; i+=1) {
    let x = a.x + (Math.sin(angle) * i);
    let y = a.y + (Math.cos(angle) * i);
    points.push({ x, y });
  }
  return points;
}
function buildRoute(pointB) {
  if (selectedEmoji) {
    var pointA = selectedEmoji.route[selectedEmoji.route.length-1]
              || selectedEmoji;
    const distance = distanceBetween(pointA, pointB);
    const angle = angleBetween(pointA, pointB);

    for (var i = 0; i < distance; i+=selectedEmoji.speed) {
      let x = pointA.x + (Math.sin(angle) * i);
      let y = pointA.y + (Math.cos(angle) * i);

      let a = selectedEmoji.route[selectedEmoji.route.length-1] || pointA;
      let b = { x, y };

      if ( distanceBetween(a, b) > 0 ) {
        selectedEmoji.route.push(b);
      }
    }
  }
}
function distanceBetween(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}
function angleBetween(a, b) {
  return Math.atan2( b.x - a.x, b.y - a.y );
}
function getPosition(el) {
  var x = 0, y = 0;
  while (el) {
    if (el.tagName === "BODY") {
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;
      x += (el.offsetLeft - xScroll + el.clientLeft);
      y += (el.offsetTop - yScroll + el.clientTop);
    } else {
      x += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      y += (el.offsetTop - el.scrollTop + el.clientTop);
    }
    el = el.offsetParent;
  }
  return { x, y };
}
