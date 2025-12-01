// ------------------- THEME SETUP -------------------
let currentThemeIndex = 0;
let currentTheme;

const themes = [
  { background: "#1A1A1A", border: "#EAEAEA", text: "#EAEAEA", glow: "#EAEAEA", shadow: "rgba(234, 234, 234, 0.3)" },
  { background: "#FAF7F0", border: "#3E2723", text: "#3E2723", glow: "#CBB29A", shadow: "rgba(62, 39, 35, 0.3)" },
  { background: "#E0F7FA", border: "#004D40", text: "#004D40", glow: "#00BFA5", shadow: "rgba(0, 77, 64, 0.3)" },
  { background: "#0A192F", border: "#E0FBFC", text: "#E0FBFC", glow: "#64FFDA", shadow: "rgba(100, 255, 218, 0.3)" },
  { background: "#3E2723", border: "#E0F7FA", text: "#E0F7FA", glow: "#A7FFEB", shadow: "rgba(224, 247, 250, 0.3)" }
];

const pulseButton = document.querySelector('.pulse-button'); // cache button

function startPulseAnimation(button) {
  button.style.setProperty('--pulse-glow', currentTheme.glow);
  button.classList.add('pulse-animation');
  button.disabled = true;

  setTimeout(() => {
    button.classList.remove('pulse-animation');
    button.disabled = false;
    changeTheme();
  }, 1500);
}

function changeTheme() {
  currentTheme = themes[currentThemeIndex];

  // Apply main colors
  document.body.style.backgroundColor = currentTheme.background;
  document.body.style.color = currentTheme.text;

  // Update pulse button (for both click & toast)
  if (pulseButton) {
    pulseButton.style.borderColor = currentTheme.border;
    pulseButton.style.boxShadow = `0 0 20px ${currentTheme.shadow}, inset 0 0 10px ${currentTheme.shadow}`;
    pulseButton.style.setProperty('--pulse-glow', currentTheme.glow);
  }

  // Update all text elements
  document.querySelectorAll('a, h1, h2, h3, h4, h5, p, span, label, input, button, textarea').forEach(el => {
    el.style.color = currentTheme.text;
  });

  // Update cards, boxes, inputs, toast shadows
  document.querySelectorAll('.card, .box, .glass, .Toast-div, input, textarea, button').forEach(el => {
    el.style.boxShadow = `0 4px 20px ${currentTheme.shadow}`;
    el.style.borderColor = currentTheme.border;
  });

  // Move to next theme
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
}

// Initialize theme
changeTheme();


// ------------------- MATTER.JS SETUP -------------------
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse;

let engine = Engine.create();
let canvas, textGraphics;
let ground, leftWall, rightWall, ceiling;
let mouseConstraint;
let squares = [];
let skills = [
  "User Research",
  "Wireframing",
  "Prototyping",
  "Interaction Design",
  "Visual Design",
  "Usability Testing",
  "HTML",
  "CSS",
  "BootStrap",
  "UI Design",
  "UX Design",
  "Figma",
  "Adobe XD",
  "Adobe Illustrator",
  "Adobe Photoshop"
];


// Engine tuning
engine.constraintIterations = 10;
engine.positionIterations = 10;
engine.velocityIterations = 10;
engine.timing.timeScale = 1;

function setup() {
  pixelDensity(1);
  let mainContainer = document.querySelector('.maincontainer');
  canvas = createCanvas(mainContainer.offsetWidth, mainContainer.offsetHeight);
  canvas.parent('canvasContainer');

  canvas.elt.addEventListener('wheel', function(e){ window.scrollBy(0,e.deltaY); }, { passive:true });

  textGraphics = createGraphics(200, 44);
  textGraphics.pixelDensity(displayDensity());

  const wallThickness = 50;
  ground = Bodies.rectangle(width/2, height+wallThickness/2, width, wallThickness, { isStatic:true });
  ceiling = Bodies.rectangle(width/2, -wallThickness/2, width, wallThickness, { isStatic:true });
  leftWall = Bodies.rectangle(-wallThickness/2, height/2, wallThickness, height, { isStatic:true });
  rightWall = Bodies.rectangle(width+wallThickness/2, height/2, wallThickness, height, { isStatic:true });

  World.add(engine.world, [ground, ceiling, leftWall, rightWall]);

  // create squares
  for (let i=0; i<skills.length; i++){
    let x = Math.random()*(width-200)+100;
    let y = Math.random()*(height-200)+100;

    let square = Bodies.rectangle(x, y, 350, 60, {
      friction:0.1, frictionAir:0.02, restitution:0.6,
      chamfer:{radius:25}, density:0.0015
    });

    square.skillName = skills[i];
    squares.push(square);
  }
  World.add(engine.world, squares);

  let mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();

  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness:0.35, angularStiffness:0.3, damping:0.2, render:{visible:false} }
  });
  World.add(engine.world, mouseConstraint);

  Engine.run(engine);
}

function draw() {
  clear();
  background(currentTheme.background);

  for (let square of squares){
    const pos = square.position;
    const angle = square.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);

    fill(currentTheme.background);
    stroke(currentTheme.text);
    strokeWeight(1.2);
    rect(0, 0, 350, 60, 25);

    noStroke();
    fill(currentTheme.text);
    textAlign(CENTER,CENTER);
    textSize(16);
    textFont('Inter');
    textStyle(BOLD);
    text(square.skillName.toUpperCase(),0,2);

    pop();
  }
}

function windowResized() {
  let mainContainer = document.querySelector('.maincontainer');
  if(!mainContainer) return;
  resizeCanvas(mainContainer.offsetWidth, mainContainer.offsetHeight);

  Matter.World.clear(engine.world,false);
  Matter.Engine.clear(engine);
  squares = [];
  setup();
}


// ------------------- SLICK & SMOOTH SCROLL -------------------
$(document).ready(function(){
  const $slider = $('.main-container');

  $slider.slick({
    vertical:true, verticalSwiping:true,
    slidesToScroll:1, slidesToShow:1,
    infinite:false, speed:1000,
    easing:'easeInOutCubic',
    draggable:false, swipe:false, touchMove:false, accessibility:false
  });

  let isScrolling = false, scrollTimeout = null, scrollDirection = 0;

  $(window).on('wheel', function(event){
    const deltaY = event.originalEvent.deltaY;
    if(Math.abs(deltaY)<40) return;
    const newDirection = deltaY>0?1:-1;
    if(isScrolling && newDirection===scrollDirection) return;

    scrollDirection = newDirection;
    isScrolling = true;

    if(scrollDirection>0) $slider.slick('slickNext');
    else $slider.slick('slickPrev');

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(()=>{ isScrolling=false; },1200);
  });

  $('.main-container').on('mousedown touchstart', function(e){
    if($(e.target).closest('input, textarea, select, button, form').length===0) e.preventDefault();
  });

  // ygiuwjsygikjws

  const aboutPara = document.querySelector('.about-para');

if (aboutPara) {
  // Clean up line breaks and multiple spaces
  const cleanText = aboutPara.textContent.replace(/\s+/g, ' ').trim();

  // Split into words properly
  const words = cleanText.split(' ');

  // Rebuild innerHTML with spans
  aboutPara.innerHTML = words.map(w => `<span>${w}</span>`).join(' ');
}

$slider.on('afterChange', function(event, slick, currentSlide) {
  if (currentSlide === 1 && aboutPara) {
    aboutPara.classList.add('typing');

    // Stagger animation for each word
    aboutPara.querySelectorAll('span').forEach((span, i) => {
      span.style.animationDelay = `${i * 80}ms`;
    });
  } else if (aboutPara) {
    // Reset so it can replay next time
    aboutPara.classList.remove('typing');
    aboutPara.querySelectorAll('span').forEach(span => {
      span.style.animationDelay = '0ms';
    });
  }
});

  // ------------------- TOASTS & PULSE GLOW -------------------
  const toastDiv1 = $('#toastDiv1'), toastDiv2 = $('#toastDiv2');
  let toastTimer1 = null, toastTimer2 = null;

  function showToast(toastEl, timerRef){
    clearTimeout(timerRef);
    toastEl.addClass('show');

    if(toastEl.is('#toastDiv1')){
      pulseButton.classList.add('toast-glow');
      pulseButton.style.setProperty('--pulse-glow', currentTheme.glow);
    }

    return setTimeout(()=>{
      toastEl.removeClass('show');
      if(toastEl.is('#toastDiv1')){
        pulseButton.classList.remove('toast-glow');
      }
    },5000);
  }

  $slider.on('afterChange', function(event,slick,currentSlide){
    if(currentSlide === 0){
      toastTimer1 = showToast(toastDiv1, toastTimer1);
      toastDiv2.removeClass('show');
    } else if(currentSlide === 2){
      toastTimer2 = showToast(toastDiv2, toastTimer2);
      toastDiv1.removeClass('show');
      pulseButton.classList.remove('toast-glow');
    } else {
      toastDiv1.removeClass('show');
      toastDiv2.removeClass('show');
      pulseButton.classList.remove('toast-glow');
    }
  });

  // Initial trigger if page loads on slide 0
  if($slider.hasClass('slick-initialized') && $slider.slick('slickCurrentSlide') === 0){
    toastTimer1 = showToast(toastDiv1, toastTimer1);
  } else {
    $slider.on('init', function(event,slick){
      if(slick.currentSlide === 0){
        toastTimer1 = showToast(toastDiv1, toastTimer1);
      }
    });
  }

  // ------------------- SMOOTH ANCHOR SCROLL -------------------
  $('a[href^="#"]').on('click',function(e){
    e.preventDefault();
    const targetId = $(this).attr('href');
    const sectionMap = { '#home':0, '#about':1, '#skills':2, '#projects':3, '#contact':8 };
    const slideIndex = sectionMap[targetId];
    if(slideIndex!==undefined) $slider.slick('slickGoTo',slideIndex);
  });

  $('#scrollTopBtn').on('click',()=>{ $slider.slick('slickGoTo',0,true); });
  $slider.on('afterChange', function(event, slick, currentSlide){
    if(currentSlide>=2) $('#scrollTopBtn').fadeIn();
    else $('#scrollTopBtn').fadeOut();
  });
});

// ------------------- EMAILJS FORM -------------------
document.getElementById('contact-form').addEventListener('submit', function(e){
  e.preventDefault();
  const form = this;
  emailjs.send("service_a4pufle", "template_8k8sidj", {
    fullName: form.full_name.value,
    Email: form.email.value,
    Phone: form.phone.value,
    message: form.message.value
  }).then(function(response){
    alert("Message sent successfully!");
    form.reset();
  }, function(error){
    alert("Failed to send message. Please try again.");
  });
});

