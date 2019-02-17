export default class Whiteboard {

    constructor(id) {
        this.canvas = document.getElementById(id);

        let devicePixelRatio = window.devicePixelRatio || 1;
        let size = {width: window.innerWidth, height: window.innerHeight-20};
        this.canvas.width = size.width * devicePixelRatio;
        this.canvas.height = size.height * devicePixelRatio; 

        //Drawing object
        this.ctx = this.canvas.getContext('2d');
        this.redraw();
        this.ctx.scale(devicePixelRatio, devicePixelRatio);

        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;

        this.history = [];

        //this.listen();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawBgDots();
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
}