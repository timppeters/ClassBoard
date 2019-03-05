import {fabric} from 'fabric';

export default function initiateCanvas(id) {
    // Set up fabric canvas
    let canvas = new fabric.Canvas(id, {
        rotationCursor: 'pointer',
        backgroundVpt: false,
        //isDrawingMode: true,
        selectionFullyContained: true,
        width: window.innerWidth,
        height: window.innerHeight
      });

    // Set default object settings
    fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: 'black',
        borderColor: 'grey',
        cornerSize: 6,
        padding: 7,
        borderDashArray: [2, 2]
    });
  
    canvas.on('mouse:wheel', function(options) {
        let event = options.e;
        event.preventDefault();
        event.stopPropagation();

        let delta = event.deltaY; // How much the mouse has scrolled
        let zoom = canvas.getZoom() + delta/200;
        if (zoom > 20) {
            zoom = 20;
        } 
        if (zoom < 0.01) {
            zoom = 0.01;
        } 
        canvas.zoomToPoint({ x: event.offsetX, y: event.offsetY }, zoom);
        
      });

      canvas.on('mouse:down', function(opt) {
        var evt = opt.e;
        if (evt.altKey === true) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
      canvas.on('mouse:move', function(opt) {
        if (this.isDragging) {
          var e = opt.e;
          this.viewportTransform[4] += e.clientX - this.lastPosX;
          this.viewportTransform[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
      canvas.on('mouse:up', function(opt) {
        this.isDragging = false;
        this.selection = true;
      });
          
      

    let text = new fabric.IText('hello world', { left: 100, top: 100 });
  
    // Set up event listeners
  
    canvas.add(text);
}