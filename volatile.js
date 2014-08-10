//Steven's tile game



//Keyboard input object
//TODO: Expand to include mouse input
var Key = {
	_pressed: {},

	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
    SPACE: 32,
	
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
  
	onKeydown: function(event) {
		this._pressed[event.keyCode] = true;
	},
  
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
	}
};

//Main game object
//TODO: Score system, time limits, failure conditions
var Game = {
    fps : 60,
    width : 400,
    height : 400,
    blocks : [],
    colors : [ "Black" , "White" , "Red" , "Aqua" , "Lime" , "Magenta" , "Blue" , "Yellow" ]
};
Game.start = function() {
    Game.canvas = document.createElement("canvas");
    Game.canvas.width = Game.width;
    Game.canvas.height = Game.height;
    Game.context = Game.canvas.getContext("2d");
    document.body.appendChild(Game.canvas);
    Game.player = new Player( 0 , 0 );
    Game.blocks.push(new Block( 0 , 0, randomColor() ) );
    for( i = 1; i < 100; i++ ){
        coords = indexToCoords( i );
        //+4 goes here
	    Game.blocks.push( new Block( coords[ 0 ], coords[ 1 ], randomColor()  ) );
	    //Adds some variety to the board
	    while( Game.blocks[ i ].color == Game.blocks[ i - 1 ].color )
		        Game.blocks[i].color = randomColor();
    }
    window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
    window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
    Game.step(); 
};


Game.update = function(){
	Game.player.update();
};

Game.render = function () {
    Game.context.clearRect( 0 , 0 , 400 , 400 );
	Game.context.fillStyle = "LightGray";
	Game.context.fillRect(0, 0, Game.width, Game.height);
	Game.player.render();
	for( i = 0; i < 100; i++ ){
		Game.blocks[i].render();
	}
};

animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
	window.setTimeout( callback, 1000 / Game.fps );
};

Game.step = function () {
	Game.update()
	Game.render();
	animate( Game.step );
};

//Block class
//TODO: match detection, block generation
function Block( x , y , color ){
	this.x = x;
	this.y = y;
    this.sprites = new Image();
    this.sprites.src = "images/sprites.png";
	//Colors include
	//Black,White,Red,Cyan,Green,Magenta,Blue,Yellow
	this.color = color;
	this.render=function(){
        Game.context.drawImage( this.sprites , this.color * 40 , 0 , 40 , 40 , this.x , this.y , 40 , 40 );
    };
};

//Player class
//TODO: computer AI
function Player( x , y ){
	this.x = x;
	this.y = y;

    //Selected tiles
    //-1 means none selected
    this.sel1 = -1
    this.sel2 = -1

	//To create an interval between movements
	this.interval = 0;
    //To create a longer interval between selections
    this.interval2 = 0;

    //Draws the player cursor and the selection cursor
	this.render=function(){
		Game.context.fillStyle = "DarkGray";
		Game.context.fillRect( this.x , this. y , 40 , 40 );
        Game.context.fillStyle = "Gold";
        if( this.sel1 > -1 ){
            var selCoords = indexToCoords( this.sel1 );
            Game.context.fillRect( selCoords[0] , selCoords[1] , 40 , 40 ); 
	    }
    }
    
    //Takes keyboard input to control player cursor
    //TODO: mouse input
	this.update=function(){
	    
        //Space can only be pressed every 150 ms
        if( this.interval2 < 9 ){
            this.interval2++;
        }
        else if( Key.isDown( Key.SPACE ) ){
            this.select();
            this.interval2 = 0;
        }
        
        //Arrow keys can only be pressed every 100 ms
        if( this.interval < 6 ){ this.interval++; }
		else{
			if( Key.isDown( Key.UP ) ){
                this.move( 0 , -40 );
                this.interval=0;
            }
			if( Key.isDown( Key.LEFT ) ){
                this.move( -40 , 0 );
                this.interval=0;
            }
			if( Key.isDown( Key.DOWN ) ){
                this.move( 0 , 40 );
                this.interval=0;
            }
			if( Key.isDown( Key.RIGHT ) ){
                this.move( 40 , 0 );
                this.interval=0;
            }
        }

    }
    
    //Moves the player cursor
	this.move = function( dx , dy ){
		var nx = this.x + dx;
		var ny = this.y + dy;
		if( nx >= 0 && nx < 400 ){
			this.x = nx;
		}
		if( ny >= 0 && ny < 400 ){
			this.y = ny;
		}
	}

    //Handles tile selection and switching
    this.select = function(){
        if(this.sel1 == -1){
            this.sel1 = coordsToIndex( this.x , this.y );
        }
        else if( distance( [ this.x , this.y ] , indexToCoords( this.sel1 ) ) == 40){
            this.sel2 = coordsToIndex( this.x , this.y );
            var tempColor = Game.blocks[ this.sel1 ].color;
            Game.blocks[ this.sel1 ].color = Game.blocks[ this.sel2 ].color;
            Game.blocks[ this.sel2 ].color = tempColor;
            this.sel1 = -1;
            this.sel2 = -1;
        }
    }
}

//Returns a random index from Game.colors[]
function randomColor( ){
    return Math.floor(Math.random() * 8 );
}

//Converts an index 1-100 to x and y values for a 40x40 grid
function indexToCoords( index ){
    return [ 40 * ( index % 10 ) , 40 * Math.floor( index / 10 ) ];
}

//Converts x any y values for a 40 x 40 grid to an index from 1-100
function coordsToIndex( x , y ){
    return ( y / 4 ) + ( x / 40 );
}

//Returns the distance between two  2d coordinate arrays
function distance( coords1 , coords2 ){
    dx = coords1[ 0 ] - coords2[ 0 ];
    dy = coords1[ 1 ] - coords2[ 1 ];
    dx *= dx;
    dy *= dy;
    return Math.sqrt( dx + dy );
}

