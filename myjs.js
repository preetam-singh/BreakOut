// --------------------GLOBAL-------------------------------

var canvas = document.getElementById("my_canvas");           //canvas -> For main canvas
var ctx = canvas.getContext('2d');


var infoCanvas = document.getElementById('info-canvas');     //infoCanvas -> For secondary canvas
var ctx2 = infoCanvas.getContext('2d');

var clearCanvas = function(){                                //Function for clearning main canvas
	ctx.clearRect(0,0,1200,600);
}

var clearInfoCanvas = function() {                           //Function for clearning main canvas
	ctx2.clearRect(0, 0, 1200, 60);
}

var colorBackgroundCanvas = function(){                      //Colouring background of main canvas
    var gradient = ctx.createLinearGradient(0, 0, 1200, 600);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

var colorBackgroundInfoCanvas = function(){                 //Colouring background of secondary canvas
    var gradient = ctx2.createLinearGradient(0, 0, 1200, 60);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx2.fillStyle = gradient;
    ctx2.fillRect(0, 0, 1200, 60);
}

//--------------------------SINGLE PLAYER MODE MODULE----------------------------

var singlePlayerGame = (function(){
	
	var x,y,dx,dy;               //x,y ball center position and dx,dy are displacements
	var ballRadius = 30;
	var brickColumns = 9;
	var brickRows = 4;
	var brickWidth = 110;
	var brickHeight = 30;
	var brickPadding = 20;
	var brickOffsetTop = 30;
	var brickOffsetLeft = 25;
    var bricks = [];
    var rightPressed = false;
	var leftPressed = false;
    var paddleHeight = 15;
	var paddleWidth = 150;
	var pathHeight = 2;
	var paddleX = (canvas.width-paddleWidth)/2;
	var paddleY = canvas.height-pathHeight-paddleHeight;
	var tireRadius = 7;
	var lives = 3;
	var score = 0;
	var winOrLose = 'LOST';
	var finalScore = 0;
	var paused  = false;
    var ball = new Image();
    ball.src = 'icons/ball.png';
    
    var icon = new Image();
    icon.src = 'icons/bluePlayer.png';

    x = canvas.width/2;
    y = canvas.height/2;
    dx = 7;
    dy = 7;
    
    var initBricks = function(){                     //initialize function to initialize status of bricks
	 	for(var c=0; c<brickColumns; c++){
			bricks[c] = [];
			for(let r=0; r<brickRows; r++){
				bricks[c][r] = {
					x:0,
					y:0,
					status:1
				};
			}
		}  	
    }

    initBricks();

    function mouseMoveHandler(e){
		var relativeX = e.clientX - canvas.offsetLeft;
		if(relativeX > 0 && relativeX < canvas.width) {
		    paddleX = relativeX - paddleWidth/2;
		}
    }

    function keyDownHandler(event){                             
		if(event.key === "Right" || event.key == "ArrowRight"){
			rightPressed = true;
		}
		else if(event.key === "Left" || event.key === "ArrowLeft"){
			leftPressed = true;
	    }
	}

	function keyUpHandler(event){
		if(event.key == "Right" || event.key == "ArrowRight"){     //RIGHT,LEFT for IE & ArrowRight for modern browsers
			rightPressed = false;
		}
		else if(event.key === "Left" || event.key === "ArrowLeft"){
			leftPressed = false;
        }
	}

	var pauseGame = function(){                 //pausing function to pause state of game for 1 second
		paused = true;
		setTimeout(function(){
		    paused = false;
		    startSinglePlayerGame();
		},1000);

	}

    var setUpEventListeners = function(){     // setting up eventListeners for paddle controls
    	document.addEventListener('keydown', keyDownHandler);
		document.addEventListener('keyup', keyUpHandler);
		document.addEventListener("mousemove", mouseMoveHandler, false);
    }

    var drawBricks = function(){
    	for(var c=0; c<brickColumns; c++){
			for(var r=0; r<brickRows; r++){
				if(bricks[c][r].status == 1) {
					var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft; //c,r constantly increment and multiplied to draw next brick at a certain distance after it
		            var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
					bricks[c][r].x = brickX;
					bricks[c][r].y = brickY;
					ctx.beginPath();
					ctx.rect(brickX,brickY,brickWidth,brickHeight);
					ctx.fillStyle = "#00d2ff";
					ctx.fill();
					ctx.closePath();
				}
			}
	    }
	}

    var drawBall = function(){
		ctx.drawImage(ball,x,y,ballRadius,ballRadius);
    }

    var drawPaddlePath = function(){
      
    	ctx.beginPath();
    	ctx.rect(0, canvas.height-pathHeight, canvas.width, pathHeight); 
    	ctx.fillStyle = 'black';
    	ctx.fill();
    }

    var drawPaddle = function(){
    	ctx.beginPath();
    	ctx.rect(paddleX,paddleY, paddleWidth, paddleHeight);
    	ctx.fillStyle='#12fff7';
    	ctx.fill();
    	ctx.closePath();

    	ctx.beginPath();
    	ctx.arc(paddleX, canvas.height-pathHeight-tireRadius,tireRadius,0, Math.PI*2);
    	ctx.arc(paddleX+paddleWidth,canvas.height-pathHeight-tireRadius,tireRadius,0,Math.PI*2);
    	ctx.fillStyle = "#085078";
    	ctx.fill();
    	ctx.closePath();
    }

    var collisionDetection = function(){             //checks intersection of ball and brick
    	for(var c=0; c<brickColumns; c++) {
	        for(var r=0; r<brickRows; r++) {
	            var b = bricks[c][r];
                if(b.status == 1) {
		            if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
		                dy = -dy;
		                b.status = 0;            //chaning status to 0 doesnt draw the brick at specified pos. in the next iteration
		                score++;
		                if(score == brickRows * brickColumns){
		                	finalScore = score;
		                	winOrLose = 'WIN';
		                    return;
		                }
		            }
                }
            }
        }
    }
 
    var boundaryCollisionDetection = function(){           // For determining collision with all four boundaries

		if((x + dx > canvas.width-ballRadius)||(x + dx <  ballRadius - 20)) {    //If ball toches right or left boundary
	        dx = -dx;
		}
		if(y + dy < ballRadius -20){                       //If ball touches uppermost boundary                   
			dy = -dy;
		} 
		else if(y + dy >canvas.height-ballRadius-paddleHeight-pathHeight){ //when ball is at crossing level of paddle

			if(x >= paddleX && x <= paddleX+paddleWidth){  // then if ball lies within the paddle ends
				dy = -dy;
			}
			else{                                         // else if ball lies outside the paddle ends
				lives--;
			    if(lives<1) {
			    	winOrLose = "LOST";
			    	finalScore = score;
                   return;
			    }
			    else {                                   //If there are lives remaining , pause the game then move on
			        x = canvas.width/2;
			        y = canvas.height/2;
			        paddleX = (canvas.width-paddleWidth)/2;
			        pauseGame();
			    }
			}
		}
    }

    var updateInfoCanvas = function(playerLives){              //Updating secondary canvas for real times lives and score
    	clearInfoCanvas();
        colorBackgroundInfoCanvas();
        
        var d = 0;                               //Displacement for drawing the next life icon
        ctx2.beginPath();
	    ctx2.font = '20px sans-serif';
	    ctx2.fillStyle = 'lightblue';
	    ctx2.fillText('Lives  - ', 70, 30);
        ctx2.closePath();
        while(playerLives>0){                                        
	        ctx2.drawImage(icon, 150 + d, 15, 20, 20);
            playerLives--;
            d+=40;
	    }

	    ctx2.beginPath();
	    ctx2.font = '20px sans-serif';
	    ctx2.fillStyle = '#085078';
	    ctx2.fillText('Score : ' + score , infoCanvas.width - 300, 30);

    }

    var startSinglePlayerGame = function(){      
    	clearCanvas();
    	colorBackgroundCanvas();
		drawBricks();
		drawBall();
		drawPaddlePath();
		drawPaddle();
		collisionDetection();
		boundaryCollisionDetection();
		updateInfoCanvas(lives);
   
        if(lives<1 || finalScore == '9'){               //If no live or max score, call retryPage with setting event listeners for that Page
        	document.addEventListener('keydown', function test(event){
        		if(event.keyCode == 82) {              // 82 keyCode for r , representing retrying the level 
					initBricks();
					lives = 3;
					score = 0;
					x = canvas.width/2;
				    y = canvas.height/2;
					startSinglePlayerGame();
					document.removeEventListener('keydown', test);
				}

				if(event.keyCode == 72){               //72 keyCode for h, representing Home
					document.location.reload();
					document.removeEventListener('keydown', test);
				}
        	});
        	retryPage();
        }

        else{                                          
        	if(rightPressed && paddleX < canvas.width - paddleWidth) {
    		    paddleX += 10;
			}
			else if(leftPressed && paddleX > 0) {
	    		paddleX -= 10;
			}

			x+= dx;
			y+= dy;

            if(!paused){
				requestAnimationFrame(startSinglePlayerGame);
            } 
        }
		
    }

    var retryPage = function(){
    	clearCanvas();
    	colorBackgroundCanvas();

    	clearInfoCanvas();
    	colorBackgroundInfoCanvas();
      
        var color;
    	if(winOrLose == 'LOST'){
    		color = '#eb3349';
    	}
    	else if(winOrLose == 'WIN'){
    		color = '#b3ffab';
    	}  

    	ctx.beginPath();
    	ctx.font = '20px Arial';
    	ctx.fillStyle = 'white';
    	ctx.fillText('For Home PRESS : ', canvas.width/2-400, canvas.height/2);
    	ctx.fillText('To Retry PRESS : ', canvas.width/2-400, canvas.height/2 + 50 );

    	ctx.strokeStyle ='#12fff7';
    	ctx.lineWidth = 3;
    	ctx.strokeRect(canvas.width/2-200, canvas.height/2-23, 30, 30);
    	ctx.strokeRect(canvas.width/2-200, canvas.height/2+ 23, 30, 30);

    	ctx.font = '25px Arial';
    	ctx.fillStyle = 'white';
    	ctx.fillText('H', canvas.width/2-194, canvas.height/2);
    	ctx.fillText('R', canvas.width/2-194, canvas.height/2 + 48);
    	ctx.closePath();

    	ctx.beginPath();
    	ctx.font = '70px Arial';
    	ctx.fillStyle = color;
    	ctx.fillText('YOU ' + winOrLose,  canvas.width/2, canvas.height/2 + 50);
        ctx.closePath();

        ctx2.beginPath();
        ctx2.font = '20px sans-serif';
        ctx2.fillStyle = 'white';
        ctx2.fillText('Final Score ' + finalScore, infoCanvas.width/2-100, 30);

    }
   

	return {
		execute: function(){
			setUpEventListeners();
    		startSinglePlayerGame();
		},
		removeEventListeners : function(){
			document.removeEventListener('keydown', keyDownHandler);
    	    document.removeEventListener('keyup', keyUpHandler);
    	    document.removeEventListener("mousemove", mouseMoveHandler);
		}
	}

})();

//--------------------------MULTIPLAYER MODE MODULE----------------------------


var multiplayerGame = (function(){

	var x,y,dx,dy;
	var ballRadius = 30;
	var paddleHeight = 120;
	var paddleWidth = 15;
	var p1x = 0;
	var p1y = canvas.height/2-paddleHeight/2;
	var p2x = canvas.width-paddleWidth;
	var p2y = canvas.height/2-paddleHeight/2;
	var p1UP = false;
	var p1DOWN = false;
	var p2UP = false;
	var p2DOWN = false;
	var p1Lives = 3;
	var p2Lives = 3;
	var maxLives = 3;
	var paused = false;
	
	var ball = new Image();
    ball.src = 'icons/ball.png';

    var icon = new Image();
    icon.src = 'icons/bluePlayer.png';

    var icon2 = new Image();
    icon2.src = 'icons/greenPlayer.png';   

    x = canvas.width/2;
    y = ballRadius + Math.floor(Math.random()*(canvas.height - 2*ballRadius));
    dx = 9;
    dy = 9;


    window.addEventListener("keydown", function(e) {       //preventing browser's default action, when pressing arrow keys viewpoint was moving along with game
        // space and arrow keys
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    function keyDownHandler(e){
    	if(e.keyCode == '87'){
    		p1UP = true;
    	}
    	else if(e.keyCode == '83'){
    		p1DOWN = true;
    	}

    	if(e.keyCode == '38'){
    		p2UP = true;
     	}

    	else if(e.keyCode == '40'){
    		p2DOWN = true;

    	}

    }

    function keyUpHandler (e){
    	if(e.keyCode == '87'){
    		p1UP = false;
    	}
    	else if(e.keyCode == '83'){
    		p1DOWN =false;
    	}

    	if(e.keyCode == '38'){
    		p2UP =false;
    	}

    	else if(e.keyCode == '40'){
    		p2DOWN = false;
    	}
    }

    var pauseGame = function(){
		paused = true;
	   	setTimeout(function(){
	   		paused = false;
	   		startMultiPlayerGame();
	   	},1000);
	}

    var setUpEventListeners = function(){
    	document.addEventListener('keydown', keyDownHandler);
    	document.addEventListener('keyup', keyUpHandler);
    }

    var drawPaddle = function(){
    	ctx.beginPath();
    	ctx.rect(p1x, p1y, paddleWidth, paddleHeight);
    	ctx.fillStyle='#00d2ff';
    	ctx.fill();
        ctx.closePath();
     
        ctx.beginPath();
    	ctx.rect(p2x, p2y, paddleWidth, paddleHeight);
    	ctx.fillStyle='#92fe9d';
    	ctx.fill();
        ctx.closePath();
       
    }

    var drawBall = function(){
    	ctx.drawImage(ball,x,y,ballRadius,ballRadius);
    }

    var collisionDetection = function(){
        if(dx > 0){                    // ball direction to right ==>>
        	if(y >= p2y-ballRadius && y <= p2y+paddleHeight+ballRadius){ // when ball lies btw ends of paddle2 and then if touching paddle range
        		if(x+dx >= canvas.width-paddleWidth - ballRadius){       //Collided with paddle
        			dx = -dx;                                            //so reflect the ball
    		    }
    	    }
	    	else {                      // else for when ball doesnt lie within ends of paddle , ball can be far or close
	    		if(x+dx >= canvas.width - ballRadius){  // ball doesnt lie in btw alse touches the boundary meaning decrement in lives
	    			p2Lives--;
	    			if(p2Lives<1){
	    				return;
	    			}
	    			else {
	    				x = canvas.width/2;
   						y = ballRadius + Math.floor(Math.random()*(canvas.height - 2*ballRadius));
   						pauseGame();
	    			}
	    		}
	    	}
        }

        else {          //ball direction to the left <<==
        	if( y >= p1y-ballRadius && y<=p1y+paddleHeight+ballRadius){
        		if(x+dx <= 0+ paddleWidth){
        			dx = -dx;
        		}
        	}

        	else {
        		if(x+dx <= ballRadius - 20){     // ball touches left boundary
        			p1Lives--;
	    			if(p1Lives<1) {

	    				return;
	    			}
	    			else {
	    			    x = canvas.width/2;
   						y = ballRadius + Math.floor(Math.random()*(canvas.height - 2*ballRadius));
   						pauseGame();
   					
	    				//pause start again with ball at random pos.

	    			}
        		}
        	}
        }
    	
        //  also check for  vertical boundaries collision detection
    	if(y+dy >= canvas.height - ballRadius){
    		dy = -dy;
    	}
    	if(y+dy<=15-ballRadius){
    		dy = -dy;
    	}
    }

    var updateInfoCanvas = function(playerOneLives, playerTwoLives){
            var d = 0;
            clearInfoCanvas();
            colorBackgroundInfoCanvas();

            ctx2.beginPath();
	    	ctx2.font = '20px sans-serif';
	    	ctx2.fillStyle = 'lightblue';
	        ctx2.fillText('P1  - ', 40, 30);

	        ctx2.fillStyle = 'lightseagreen';
	        ctx2.fillText('P2  - ', 1000, 30);
	    	ctx2.closePath();

	    	while(playerOneLives>0){
	    		ctx2.drawImage(icon, 100 + d, 15, 20, 20);
	    		d+=40;
	    		playerOneLives--;
	    	}

	    	d = 0;

            while(playerTwoLives>0){
            	ctx2.drawImage(icon2, 1060 + d, 15, 20, 20);
            	d+=40;
            	playerTwoLives--;
            }         
    		
    }

    var retryPage = function(p1Lives, p2Lives){
    	clearCanvas();
    	clearInfoCanvas();
    	colorBackgroundCanvas();
    	colorBackgroundInfoCanvas();

    	var winner;
        var color = '';

    	if(p1Lives <1){
    		winner = 'Two';
            color = 'lightgreen';
    	}
    	else if(p2Lives<1){
    		winner = 'One';
            color = '#00d2ff';
    	}

    	ctx.beginPath();
    	ctx.font = '50px sans-serif';
    	ctx.fillStyle = color;
    	ctx.fillText('Player ' + winner + " wins", canvas.width/2, canvas.height/2+50);
    	ctx.closePath();

    	ctx.beginPath();
    	ctx.font = '20px Arial';
    	ctx.fillStyle = 'white';
    	ctx.fillText('For Home PRESS : ', canvas.width/2-400, canvas.height/2);
    	ctx.fillText('To Retry PRESS : ', canvas.width/2-400, canvas.height/2 + 50 );

    	ctx.strokeStyle ='#12fff7';
    	ctx.lineWidth = 3;
    	ctx.strokeRect(canvas.width/2-200, canvas.height/2-23, 30, 30);
    	ctx.strokeRect(canvas.width/2-200, canvas.height/2+ 23, 30, 30);

    	ctx.font = '25px Arial';
    	ctx.fillStyle = 'white';
    	ctx.fillText('H', canvas.width/2-194, canvas.height/2);
    	ctx.fillText('R', canvas.width/2-194, canvas.height/2 + 48);
    	ctx.closePath();

    }


    var startMultiPlayerGame = function(){
   	    clearCanvas();
    	colorBackgroundCanvas();
    	drawPaddle();
    	drawBall();
        collisionDetection();
    	updateInfoCanvas(p1Lives,p2Lives);

        if(p1Lives >=1 && p2Lives >=1){               //If both players have lives more than or equal to one, move on 
        	if( p1UP == true && p1y-7>= 0){
        		p1y-=9;                                // 9 -> paddle displacement
        	}

        	else if( p1DOWN == true && p1y+paddleHeight<= canvas.height-7){
        		p1y+=9;
        	}

        	if( p2UP == true && p2y-7 >=0){
        		p2y-=9;
        	}
        	else if( p2DOWN == true && p2y+paddleHeight<=canvas.height-7){
        		p2y+=9;
        	}
       
       	 	x= x +dx;
        	y = y + dy;

        	if(!paused){
        		requestAnimationFrame(startMultiPlayerGame);
        	}
        	
        }
        else {           // When lives of p1 or p2 is smaller than 1, call retryPage with adding eventListeners for that page
        	   
        	   	document.addEventListener('keydown', function test(e){
        	   	   	if(e.keyCode == '72'){ //home
        	   	   	   document.location.reload();
        	   	   	   document.removeEventListener('keydown', test);
        	   	   	}

        	   	   	else if(e.keyCode == '82'){ //retry
        	   	   	   	p1Lives = 3;
        	   	   	   	p2Lives = 3;
        	   	   	    x = canvas.width/2;
    					y = ballRadius + Math.floor(Math.random()*(canvas.height - 2*ballRadius));
        	   	   	   	startMultiPlayerGame();
        	   	   	   	document.removeEventListener('keydown', test);
        	   	   	}
        	   	});
        	   retryPage(p1Lives,p2Lives);
        	}  

    }    

	return {
		execute: function(){
			setUpEventListeners();
			startMultiPlayerGame();
		},
		removeEventListeners: function(){                             //required in controller for removing eventListenrs of mode other which is 
			document.removeEventListener('keydown', keyDownHandler);  //currently being played on, so that new eventListeners can be added to other mode
			document.removeEventListener('keyup', keyUpHandler);      //whenever user switches btw mode, also so that they wont break the flow for eg, during game, 
                                                                      // pressing down 'r' or 'h' can result in moving the flow the program to unwanted direction
		}
	}
})();


// --------------------------MAIN CONTROLLLER MODULE------------------------------

var controller = (function(singlePlayerModule,multiplayerModule){

    var drawStartPage = function(){
		colorBackgroundCanvas();

		ctx.font = "70px sans-serif";
		ctx.fillStyle = "#eef2f3";
		ctx.fillText("WELCOME", canvas.width/2-150, 200);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#eef2f3';
        ctx.strokeRect(canvas.width/2-300, 250, 620, 100);
        ctx.strokeRect(canvas.width/2-300, 350, 620, 100);

		ctx.font = "22px monospace";
		ctx.fillStyle = "#00d2ff";
		ctx.fillText("For Single Player Mode PRESS [ 1 ]", 400, canvas.height/2);
        ctx.fillText('For MultiPlayer Mode PRESS [ 2 ]', 400, canvas.height/2+100);
    }

    var selectMode = function (e){
		if(e.keyCode==49){
			document.removeEventListener('keypress', selectMode);
			multiplayerModule.removeEventListeners();
			singlePlayerModule.execute();
		}

		if(e.keyCode==50){
			document.removeEventListener('keypress', selectMode);
			singlePlayerModule.removeEventListeners();
			multiplayerModule.execute();
		}
    }

    var addEventListenersToStartPage = function(){
		document.addEventListener('keypress', selectMode);
    }


	return{
		init : function(){
		    drawStartPage();
	        colorBackgroundInfoCanvas();
			addEventListenersToStartPage();
		}
	}

})(singlePlayerGame,multiplayerGame);

controller.init();