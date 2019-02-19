export default class Whiteboard {

    constructor(id) {
        this.canvas = document.getElementById(id);

        //Drawing object
        this.ctx = this.canvas.getContext('2d');

        this.history = [];//Last object in history is pixels; when line is vectorised, the object gets replace by the svg
        this.setSize();
        this.render();

        this.mouseDown = false;

        this.listen();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBgDots();
        console.log(this.history);

        if (this.history.length > 0) {
            console.log('rendering')
            
            for (let i = 0; i < this.history.length; i++) { // i = line object
                let line = this.history[i];
                console.log(line);
                for (let j = 0; j < Object.keys(line).length; j++) { // j = dot object
                
                    let dot = line[j];
                    let prevDot = line[j-1];
                    this.ctx.beginPath();
                    if (j && dot.dragging) {
                        this.ctx.moveTo(prevDot.x, prevDot.y);
                    }
                    else {
                        this.ctx.moveTo(dot.x - 1, dot.y);
                    }
                    this.ctx.lineTo(dot.x, dot.y);
                    
                    this.ctx.lineCap = 'round';
                    this.ctx.lineJoin= 'round';
                    this.ctx.strokeStyle = dot.strokeStyle;
                    this.ctx.lineWidth = dot.lineWidth;
                    this.ctx.stroke();
                }
                this.ctx.closePath();
            }
        }
    }

    drawBgDots() {
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

    setSize() {
        let devicePixelRatio = window.devicePixelRatio || 1;
        let size = {width: window.innerWidth, height: window.innerHeight-20};
        this.canvas.width = size.width * devicePixelRatio;
        this.canvas.height = size.height * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    
    listen() { //Define event listeners

        this.canvas.addEventListener('mousedown', e => {
            this.history.push(new Object);
            this.mouseDown = true;
            let mouseX = e.pageX - this.canvas.offsetLeft;
            let mouseY = e.pageY - this.canvas.offsetTop;

            this.addPoint(mouseX, mouseY, false);
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
                let mouseX = e.pageX - this.canvas.offsetLeft;
                let mouseY = e.pageY - this.canvas.offsetTop;
                this.addPoint(mouseX, mouseY, true);
                this.render();
            }
            
        });

        window.addEventListener('resize', ()=>{
			this.setSize();
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
        let line = this.history[this.history.length-1];
        line[Object.keys(line).length] = newDot; //Adds a new dot object to the last line object in history array
    }
}