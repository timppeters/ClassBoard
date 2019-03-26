import {fabric} from 'fabric';

export const whiteboard_helper_static = {
    methods: {
      initialiseStaticCanvas(id) {
            
            this.canvas = this.initStatic(id);

            this.listenStatic();
          },

        initStatic(id) {
          

            let canvas = new fabric.Canvas(id, {
                rotationCursor: 'pointer',
                backgroundVpt: false,
                selectionFullyContained: true,
                width: window.innerWidth,
                height: window.innerHeight,
                stopContextMenu: true,
                enableRetinaScaling: true,
                touches: [],
                oldPinchZoomDistance: 0
              });

              //load from json

            return canvas;

        },

        listenStatic() {
            let canvas = this.canvas;

            canvas.on('mouse:wheel', function(options) {
                let event = options.e;
                let delta = event.deltaY/300; // How much the mouse has scrolled divided by arbitrary '300' to decrease the zoom speed
                let zoom = canvas.getZoom() - delta;
                if (zoom > 20) {
                    zoom = 20;
                } 
                if (zoom < 0.15) {
                    zoom = 0.15;
                }
                canvas.zoomToPoint({ x: event.offsetX, y: event.offsetY }, zoom);
                event.preventDefault();
                event.stopPropagation();
              });
            
        
            // set up pointer event listeners to identify pen/mouse/touch
            fabric.util.addListener(canvas.upperCanvasEl, 'pointerdown', e => {
                  if (e.pointerType == 'mouse') {
                    if (e.altKey) {
                      canvas.isDragging = true;
                      canvas.selection = false;
                      canvas.lastPosX = e.clientX;
                      canvas.lastPosY = e.clientY; 
                    }
                    
                  }
                  else { // touch (dragging)
                    canvas.touches.push(e); // register a finger
                    if (canvas.touches.length == 2) {
                      this.setInitialPinchZoomDistance();
                    }
                    if (canvas.getActiveObjects().length == 0) { // Allow using touch to move selected items
                      canvas.isDragging = true;
                      canvas.selection = false;
                      canvas.lastPosX = canvas.touches[0].clientX;
                      canvas.lastPosY = canvas.touches[0].clientY;
                    }
                  }
                
              });
        
            fabric.util.addListener(canvas.upperCanvasEl, 'pointermove', e => {
              if (e.pointerType == 'mouse') {
                if (e.altKey && canvas.isDragging) {
                  canvas.viewportTransform[4] += e.clientX - canvas.lastPosX;
                  canvas.viewportTransform[5] += e.clientY - canvas.lastPosY;
                  canvas.requestRenderAll();
                  canvas.lastPosX = e.clientX;
                  canvas.lastPosY = e.clientY;
                }
              }
              else { // touch (dragging)
                for (let i = 0; i < canvas.touches.length; i++) { // Update canvas.touches
                  if (canvas.touches[i].pointerId == e.pointerId) {
                    canvas.touches[i] = e;
                  }
                }
                if (canvas.touches.length == 2) {
                  this.pinchZoom(); //loop through fingers and update the correct one
                }
                if (canvas.isDragging) {
                  canvas.viewportTransform[4] += canvas.touches[0].clientX - canvas.lastPosX;
                  canvas.viewportTransform[5] += canvas.touches[0].clientY - canvas.lastPosY;
                  canvas.requestRenderAll();
                  canvas.lastPosX = canvas.touches[0].clientX;
                  canvas.lastPosY = canvas.touches[0].clientY;
                }
              }
            });
        
            fabric.util.addListener(canvas.upperCanvasEl, 'pointerup', e => {
              
              if (e.pointerType == 'mouse') {
                
                if(canvas.isDragging) {
                  canvas.isDragging = false;
                }
              }
              else { // touch (dragging)
                if(canvas.isDragging) {
                  canvas.isDragging = false;
                }
                for (let i = 0; i < canvas.touches.length; i++) {
                  if (canvas.touches[i].pointerId == e.pointerId) {
                    canvas.touches.splice(i,1);
                  }
                }
              }
            });

        }

    }
}