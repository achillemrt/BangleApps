//Keep banglejs screen on for 100 sec at 0.55 power level for development purposes
//Bangle.setLCDTimeout(30);
//Bangle.setLCDPower(1);

exports.input = function(options) {
  options = options||{};
  var text = options.text;
  if ("string"!=typeof text) text="";
  
  var BGCOLOR = g.theme.bg;
  var HLCOLOR = g.theme.fg;
  var ABCCOLOR = g.toColor(1,0,0);//'#FF0000';
  var NUMCOLOR = g.toColor(0,1,0);//'#00FF00';
  var BIGFONT = '6x8:3';
  var BIGFONTWIDTH = parseInt(BIGFONT.charAt(0)*parseInt(BIGFONT.charAt(-1)));
  var SMALLFONT = '6x8:1';
  var SMALLFONTWIDTH = parseInt(SMALLFONT.charAt(0)*parseInt(SMALLFONT.charAt(-1)));

  var ABC = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
  var ABCPADDING = (g.getWidth()-6*ABC.length)/2;

  var NUM = ' 1234567890!?,.- ';
  var NUMHIDDEN = ' 1234567890!?,.- ';
  var NUMPADDING = (g.getWidth()-6*NUM.length)/2;

  var rectHeight = 40;


  var delSpaceLast;

  function drawAbcRow() {
    g.clear();
    g.setFont(SMALLFONT);
    g.setColor(ABCCOLOR);
    g.drawString(ABC, ABCPADDING, g.getHeight()/2);
    g.fillRect(0, g.getHeight()-26, g.getWidth(), g.getHeight());
  }

  function drawNumRow() {
    g.setFont(SMALLFONT);
    g.setColor(NUMCOLOR);
    g.drawString(NUM, NUMPADDING, g.getHeight()/4);

    g.fillRect(NUMPADDING, g.getHeight()-rectHeight*4/3, g.getWidth()-NUMPADDING, g.getHeight()-rectHeight*2/3);
  }

  function updateTopString() {
    "ram"
    g.setColor(BGCOLOR);
    g.fillRect(0,4+20,176,13+20);
    g.setColor(0.2,0,0);
    var rectLen = text.length<27? text.length*6:27*6;
    g.fillRect(3,4+20,5+rectLen,13+20);
    g.setColor(0.7,0,0);
    g.fillRect(rectLen+5,4+20,rectLen+10,13+20);
    g.setColor(1,1,1);
    g.drawString(text.length<=27? text.substr(-27, 27) : '<- '+text.substr(-24,24), 5, 5+20);
  }

  drawAbcRow();
  drawNumRow();
  updateTopString();

  var abcHL;
  var abcHLPrev = -10;
  var numHL;
  var numHLPrev = -10;
  var type = '';
  var typePrev = '';
  var largeCharOffset = 6;
  
  function resetChars(char, HLPrev, typePadding, heightDivisor, rowColor) {
    "ram"
    // Small character in list
    g.setColor(rowColor);
    g.setFont(SMALLFONT);
    g.drawString(char, typePadding + HLPrev*6, g.getHeight()/heightDivisor);
    // Large character
    g.setColor(BGCOLOR);
    g.fillRect(0,g.getHeight()/3,176,g.getHeight()/3+24);
    //g.drawString(charSet.charAt(HLPrev), typePadding + HLPrev*6 -largeCharOffset, g.getHeight()/3);; //Old implementation where I find the shape and place of letter to remove instead of just a rectangle.
    // mark in the list
  }
  function showChars(char, HL, typePadding, heightDivisor) {
    "ram"
    // mark in the list
    g.setColor(HLCOLOR);
    g.setFont(SMALLFONT);
    if (char != 'del' && char != 'space') g.drawString(char, typePadding + HL*6, g.getHeight()/heightDivisor);
    // show new large character
    g.setFont(BIGFONT);
    g.drawString(char, typePadding + HL*6 -largeCharOffset, g.getHeight()/3);
    g.setFont(SMALLFONT);
  }
  
  function changeCase(abcHL) {
    g.setColor(BGCOLOR);
    g.drawString(ABC, ABCPADDING, g.getHeight()/2);
    if (ABC.charAt(abcHL) == ABC.charAt(abcHL).toUpperCase()) ABC = ABC.toLowerCase();
    else ABC = ABC.toUpperCase();
    g.setColor(ABCCOLOR);
    g.drawString(ABC, ABCPADDING, g.getHeight()/2);
  }
  return new Promise((resolve,reject) => {
  // Interpret touch input
    Bangle.setUI({
    mode: 'custom',
    back: ()=>{
            Bangle.setUI();
            g.clearRect(Bangle.appRect);
            resolve(text);
            },
    drag: function(event) {

      // ABCDEFGHIJKLMNOPQRSTUVWXYZ
      // Choose character by draging along red rectangle at bottom of screen
      if (event.y >= ( g.getHeight() - 12 )) {
        // Translate x-position to character
        if (event.x < ABCPADDING) { abcHL = 0; }
        else if (event.x >= 176-ABCPADDING) { abcHL = 25; }
        else { abcHL = Math.floor((event.x-ABCPADDING)/6); }

        // Datastream for development purposes
        //print(event.x, event.y, event.b, ABC.charAt(abcHL), ABC.charAt(abcHLPrev));

        // Unmark previous character and mark the current one...
        // Handling switching between letters and numbers/punctuation
        if (typePrev != 'abc') resetChars(NUM.charAt(numHLPrev), numHLPrev, NUMPADDING, 4, NUMCOLOR);

        if (abcHL != abcHLPrev) {
          resetChars(ABC.charAt(abcHLPrev), abcHLPrev, ABCPADDING, 2, ABCCOLOR);
          showChars(ABC.charAt(abcHL), abcHL, ABCPADDING, 2);
          }
        // Print string at top of screen
        if (event.b == 0) {
          text = text + ABC.charAt(abcHL);
          updateTopString();

          // Autoswitching letter case
          if (ABC.charAt(abcHL) == ABC.charAt(abcHL).toUpperCase()) changeCase(abcHL);
        }
        // Update previous character to current one
        abcHLPrev = abcHL;
        typePrev = 'abc';
      }
      
      
      
      
      
      
      
      

      // 12345678901234567890
      // Choose number or puctuation by draging on green rectangle
      else if ((event.y < ( g.getHeight() - 12 )) && (event.y > ( g.getHeight() - 52 ))) {
        // Translate x-position to character
        if (event.x < NUMPADDING) { numHL = 0; }
        else if (event.x > 176-NUMPADDING) { numHL = NUM.length-1; }
        else { numHL = Math.floor((event.x-NUMPADDING)/6); }

        // Datastream for development  purposes
        //print(event.x, event.y, event.b, NUM.charAt(numHL), NUM.charAt(numHLPrev));

        // Unmark previous character and mark the current one...
        // Handling switching between letters and numbers/punctuation
        if (typePrev != 'num') resetChars(ABC.charAt(abcHLPrev), abcHLPrev, ABCPADDING, 2, ABCCOLOR);
        
        if (numHL != numHLPrev) {
          resetChars(NUM.charAt(numHLPrev), numHLPrev, NUMPADDING, 4, NUMCOLOR);
          showChars(NUM.charAt(numHL), numHL, NUMPADDING, 4);
          }
        // Print string at top of screen
        if (event.b == 0) {
          g.setColor(HLCOLOR);
          // Backspace if releasing before list of numbers/punctuation
          if (event.x < NUMPADDING) {
            // show delete sign
            showChars('del', 0, g.getWidth()/2 +6 -27 , 4);
            delSpaceLast = 1;
            text = text.slice(0, -1);
            updateTopString();
            //print(text);
          }
          // Append space if releasing after list of numbers/punctuation
          else if (event.x > g.getWidth()-NUMPADDING) {
            //show space sign
            showChars('space', 0, g.getWidth()/2 +6 -6*3*5/2 , 4);
            delSpaceLast = 1;
            text = text + ' ';
            updateTopString();
            //print(text);
          }
          // Append selected number/punctuation
          else {
            text = text + NUMHIDDEN.charAt(numHL);
            updateTopString();

            // Autoswitching letter case
            if ((text.charAt(text.length-1) == '.') || (text.charAt(text.length-1) == '!')) changeCase();
          }
        }
        // Update previous character to current one
        numHLPrev = numHL;
        typePrev = 'num';
      }
      
      
      
      
      
      
      
      
      // Make a space or backspace by swiping right or left on screen above green rectangle
      else if (event.y > 20+4) {
        if (event.b == 0) {
          g.setColor(HLCOLOR);
          if (event.x < g.getWidth()/2) {
            resetChars(ABC.charAt(abcHLPrev), abcHLPrev, ABCPADDING, 2, ABCCOLOR);
            resetChars(NUM.charAt(numHLPrev), numHLPrev, NUMPADDING, 4, NUMCOLOR);

            // show delete sign
            showChars('del', 0, g.getWidth()/2 +6 -27 , 4);
            delSpaceLast = 1;

            // Backspace and draw string upper right corner
            text = text.slice(0, -1);
            updateTopString();
            if (text.length==0) changeCase(abcHL);
            //print(text, 'undid');
          }
          else {
            resetChars(ABC.charAt(abcHLPrev), abcHLPrev, ABCPADDING, 2, ABCCOLOR);
            resetChars(NUM.charAt(numHLPrev), numHLPrev, NUMPADDING, 4, NUMCOLOR);

            //show space sign
            showChars('space', 0, g.getWidth()/2 +6 -6*3*5/2 , 4);
            delSpaceLast = 1;

            // Append space and draw string upper right corner
            text = text + NUMHIDDEN.charAt(0);
            updateTopString();
            //print(text, 'made space');
          }
        }
      }
    }
   });
});
/*  return new Promise((resolve,reject) => {
    Bangle.setUI({mode:"custom", back:()=>{
      Bangle.setUI();
      g.clearRect(Bangle.appRect);
      Bangle.setUI();
      resolve(text);
    }});
  }); */

};
