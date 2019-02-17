export default class Whiteboard {

    constructor(id) {
        this.canvas = document.getElementById(id);

        let devicePixelRatio = window.devicePixelRatio || 1;
        let size = {width: window.innerWidth, height: window.innerHeight-20};
        this.canvas.width = size.width * devicePixelRatio;
        this.canvas.height = size.height * devicePixelRatio; 

        //Drawing object
        this.ctx = this.canvas.getContext('2d');
        this.render();
        this.ctx.scale(devicePixelRatio, devicePixelRatio);

        this.ctx.lineCap = 'round';
		this.ctx.lineJoin= 'round';
        this.mouseDown = false;

        this.history = []; //Last object in history is pixels; when line is vectorised, the object gets replace by the svg

        this.listen();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBgDots();

        if (this.history.length > 0) {
            
            for (let i = 0; i < this.history.length; i++) { // i = line object
                let line = this.history[i];
                for (let j = 0; j < line.length; j++) { // j = dot object
                
                    let dot = line[i];
                    this.ctx.beginPath();
                    if(dot && dot.dragging){
                    this.ctx.moveTo(line[i-1].x, line[i-1].y);
                    }else{
                    this.ctx.moveTo(line[i].x - 1, line[i].y);
                    }
                    this.ctx.lineTo(dot.x, dot.y);
                    this.ctx.closePath();
                    this.ctx.stroke();
                }
            }
        }
    }

    drawBgDots(){
        let numberOfDots = 30;
        let gridSize = Math.floor(this.canvas.width / numberOfDots);
		this.ctx.fillStyle = 'rgba(0, 0, 0, .3)';
		
		for(let row = 0; row*gridSize < this.canvas.width; row++){
			for(let column = 0; column*gridSize < this.canvas.height; column++){
				if(row > 0 && column > 0){
					this.ctx.beginPath();
					this.ctx.rect(row * gridSize, column * gridSize, 2, 2);
					this.ctx.fill();
					this.ctx.closePath();
				}
			}
		}
    }
    
    listen() { //Define event listeners

        this.canvas.addEventListener('mousedown', e => {
            this.history.push(new Object);
            this.mouseDown = true;
            let mouseX = e.pageX;
            let mouseY = e.pageY;

            this.addPoint(mouseX, mouseY);
            this.render();
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
            //this.vectorise();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouseDown = false;
            //this.vectorise();
        });

        this.canvas.addEventListener('mousemove', e => {
            if (this.mouseDown) {
                this.addPoint(mouseX, mouseY, true);
            }
            this.render();
        });
        
    }

    addPoint(x, y, dragging) {
        let newDot = {
            x,
            y,
            dragging,
            strokeStyle: '#000000', //room.colour
            lineWidth: '5', //room.thickness
            tool: 'pen', //room.tool
        }
        this.history[this.history.length].push(newDot); //Adds a new dot object to the last line object in history array
    }
}