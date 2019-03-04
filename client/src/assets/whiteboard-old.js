export default class Whiteboard {

    constructor(id) {
        this.canvas = document.getElementById(id);

        //Drawing object
        this.ctx = this.canvas.getContext('2d');

        this.history = [];//Last object in history is pixels; when line is vectorised, the object gets replace by the svg
        this.mouseDown = false;
        this.isMobile = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.prevMidpoint;

        this.setSize();
        this.render();
        this.listen();


    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.history.length > 0) {
            
            for (let i = 0; i < this.history.length; i++) { // i = line object
                let line = this.history[i];
                let length = Object.keys(line).length;
                let prevMidpoint;

                if (i > 0) {
                    this.history[i-1] = {};
                }
                
                for (let j = 0; j < length; j++) { // j = dot object

                    let dot = line[j];
                    let prevDot = line[j-1];
                    this.ctx.beginPath();                    

                    if (j && dot.dragging) {

                        let midpoint = {
                            x: Math.floor((prevDot.x + dot.x)/2),
                            y: Math.floor((prevDot.y + dot.y)/2)
                        }
                        
                        this.ctx.moveTo(prevMidpoint.x, prevMidpoint.y);
                        this.ctx.quadraticCurveTo(prevDot.x, prevDot.y, midpoint.x, midpoint.y);
                        prevMidpoint = midpoint;
                    }
                    else { //first point
                        this.ctx.moveTo(dot.x - 1, dot.y);
                        this.ctx.lineTo(dot.x, dot.y);
                        prevMidpoint = {
                            x: dot.x -1,
                            y: dot.y
                        }
                    }

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

    vectorise() {
        let mockCtx = new C2S(this.canvas.width, this.canvas.height);
        let dx;
        let dy;

        let line = this.history[this.history.length-1];
        let length = Object.keys(line).length;
        let prevMidpoint;
        
        for (let j = 0; j < length; j++) { // j = dot object

            let dot = line[j];
            let prevDot = line[j-1];
            mockCtx.beginPath();

            

            if (j && dot.dragging) {

                let midpoint = {
                    x: Math.floor((prevDot.x + dot.x)/2),
                    y: Math.floor((prevDot.y + dot.y)/2)
                }
                
                mockCtx.moveTo(prevMidpoint.x, prevMidpoint.y);
                mockCtx.quadraticCurveTo(prevDot.x, prevDot.y, midpoint.x, midpoint.y);

                prevMidpoint = midpoint;
                if (dot.x < dx) {
                    dx = dot.x;
                }

                if (dot.y < dy) {
                    dy = dot.y;
                }
            }
            else { //first point
                mockCtx.moveTo(dot.x - 1, dot.y);
                mockCtx.lineTo(dot.x, dot.y);
                prevMidpoint = {
                    x: dot.x -1,
                    y: dot.y
                }
                dx = dot.x-1;
                dy = dot.y;
            }

            mockCtx.lineCap = 'round';
            mockCtx.lineJoin= 'round';
            mockCtx.strokeStyle = dot.strokeStyle;
            mockCtx.lineWidth = dot.lineWidth;
            mockCtx.stroke();

        }


        mockCtx.closePath();
        let svg = mockCtx.getSvg();
        let paths = Array.from(svg.querySelectorAll("path"));
        let path = "";
        for (let i = 0; i < paths.length; i++) {
            if (i > 0) {
                let data = paths[i].attributes[3].value;
                let pattern = /\s[^M]\s[0-9]+\s[0-9]+\s[0-9]+\s[0-9]+/;
                path += data.match(pattern);
            }
            else {
                path += paths[i].attributes[3].value;
            }
        }
        console.log(path);
        let img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", svg);
        this.ctx.drawImage(img, 0, 0);
        
    }

    draw() {

        if (this.history.length > 0) {

            let line = this.history[this.history.length - 1];
            let dot = line[0];
            let prevDot = line[1];
            this.ctx.beginPath();

            if (dot.dragging) {

                let midpoint = this.getMidpoint(dot, prevDot);
                this.roundPixels(prevDot);
                this.roundPixels(dot);

                this.ctx.moveTo(this.prevMidpoint.x, this.prevMidpoint.y);
                this.ctx.quadraticCurveTo(prevDot.x, prevDot.y, midpoint.x, midpoint.y);
                this.prevMidpoint = midpoint;
            }
            else { //first point
                this.ctx.moveTo(dot.x - 1, dot.y);
                this.ctx.lineTo(dot.x, dot.y);
                this.prevMidpoint = {
                    x: dot.x -1,
                    y: dot.y
                }
            }

            this.ctx.lineCap = 'round';
            this.ctx.lineJoin= 'round';
            this.ctx.strokeStyle = dot.strokeStyle;
            this.ctx.lineWidth = dot.lineWidth;
            this.ctx.stroke();
            this.ctx.closePath();

        }
    }

    setSize() { // Scale canvas up and size it back down to remove blurry lines on high DPI screens
        let size = {width: window.innerWidth, height: window.innerHeight};
        this.canvas.width = size.width * this.devicePixelRatio;
        this.canvas.height = size.height * this.devicePixelRatio;
        this.canvas.style.width = size.width.toString() + 'px';
        this.canvas.style.height = size.height.toString()  + 'px';
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }
    
    listen() { //Define event listeners

        this.canvas.addEventListener((this.isMobile ? 'touchstart' : 'pointerdown'), e => {
            e.preventDefault(); // Stop scrolling on mobile

            let cursorPos = this.getCursorPos(e);
            this.history.push(new Object);
            this.mouseDown = true;
            this.addPointDraw(cursorPos.x, cursorPos.y, false);
        });

        this.canvas.addEventListener('pointerup', () => {
            if (this.mouseDown) {
                this.mouseDown = false;
                //this.vectorise();
            }
        });

        this.canvas.addEventListener('pointerleave', () => {
            if (this.mouseDown) {
                this.mouseDown = false;
                //this.vectorise();
            }
        });

        this.canvas.addEventListener((this.isMobile ? 'touchmove' : 'pointermove'), e => {
            if (this.mouseDown) {
                let cursorPos = this.getCursorPos(e);
                this.addPointDraw(cursorPos.x, cursorPos.y, true);
            }
            
        });

        

        // Resize window
        window.addEventListener('resize', ()=>{
			this.setSize();
			this.draw();
		});
        
    }

    getMidpoint(point1, point2) {
        return {
            x: Math.round((point1.x + point2.x)/2),
            y: Math.round((point1.y + point2.y)/2)
        }
    }

    roundPixels(point) {
        return {
            x: Math.round(point.x),
            y: Math.round(point.y)
        }
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
        this.render();
    }

    addPointDraw(x, y, dragging) {
        let newDot = {
            x,
            y,
            dragging,
            strokeStyle: '#000000', //room.colour
            lineWidth: '2', //room.thickness
            tool: 'pen', //room.tool
        }
        let line = this.history[this.history.length-1];
        line[1] = line[0] //Set current dot to previous dot
        line[0] = newDot; //Sets new dot to current dot
        this.draw();
    }

    // Handles cursor position for different pointers
    getCursorPos(event) {
        let mouseX, mouseY;
        if (event.pointerType == 'mouse' || event.pointerType == 'pen') {
            mouseX = event.pageX - this.canvas.offsetLeft;
            mouseY = event.pageY - this.canvas.offsetTop;
        }
        else { // touch
            mouseX = event.touches[0].clientX - this.canvas.offsetLeft;
            mouseY = event.touches[0].clientY - this.canvas.offsetTop;
        }
        
        return {
            x: mouseX,
            y: mouseY
        };
    }
}