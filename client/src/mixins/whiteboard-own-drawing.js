import {fabric} from 'fabric';

export const whiteboard = {
    data() {
        return {
            points: [],
            prevMidpoint: {},
            devicePixelRatio: 1,
            mouseDown: false,
            colour: '#000000',
            lineWidth: 4
        }
    },
    methods: {
        initialiseCanvas(id) {
            
            let canvas = this.init(id);

            let ctx = canvas.contextTop;

            this.listen(canvas, ctx);
            
            let text = new fabric.IText('hello world', { left: 400, top: 400});
            let text2 = new fabric.IText('hello world2', { left: 620, top: 400});
        
            // Only let paths be selectable in a group (deselects them if they are selected by themselves)
            /*canvas.on('selection:created', e => {
              if (e.selected.length == 1) {
                if (canvas.getActiveObject().get('type') == 'path') {
                  canvas.discardActiveObject(); 
                }
              } 
            });*/
            
          
            // Set up event listeners
          
            canvas.add(text);
            canvas.add(text2);
          },

        init(id) {

            let canvas = new fabric.Canvas(id, {
                rotationCursor: 'pointer',
                backgroundVpt: false,
                selectionFullyContained: true,
                width: window.innerWidth,
                height: window.innerHeight,
                stopContextMenu: true,
                enableRetinaScaling: true
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
        
            fabric.Path.prototype.set({
              hoverCursor: 'default',
              perPixelTargetFind: true
            });

            fabric.Point.prototype.dragging = false;

            return canvas;

        },

        listen(canvas, ctx) {

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
        
            // When drawing, only use drawing cursor.
            fabric.util.addListener(canvas.upperCanvasEl, 'pointerover', e => {
              if (this.selectedTool == 'pen') {
                if (e.pointerType == 'pen' || e.pointerType == 'mouse') {
                  if (canvas.getActiveObjects().length == 0) {
                    fabric.Object.prototype.set({
                      hoverCursor: 'default'
                    });
                  }
                  else {
                    fabric.Object.prototype.set({
                      hoverCursor: 'move'
                    });
                  }
                }
              }

            });

            canvas.on('mouse:over', e => { // Stroke eraser
              if (this.selectedTool == 'eraser') {
                if (this.mouseDown) {
                    canvas.remove(e.target);
                }
              }
            });
            
        
            // set up pointer event listeners to identify pen/mouse/touch
            fabric.util.addListener(canvas.upperCanvasEl, 'pointerdown', e => {
              if (e.pointerType == 'pen') {
                if (e.button == 0) { // Pen contact
                  if (canvas.getActiveObjects().length == 0) {
                    if (this.selectedTool == 'pen') {
                        this.mouseDown = true;
                        canvas.selection = false;
                        this.scaleDrawingCanvas(canvas,ctx);

                        let cursorPos = this.getCursorPos(e,canvas);

                        this.points.push(new Object);
                        this.addPoint(cursorPos.x, cursorPos.y, false, ctx);
                    }
                    else if (this.selectedTool == 'eraser') {
                      canvas.selection = false;
                      this.mouseDown = true;
                    }
                    else {
                      // selection box
                    }
                  }
                }
                else if (e.button == 5) { // eraser button/end of stylus
                    this.mouseDown = true;
                    canvas.selection = false;
                    this.selectedTool = 'eraser';
                }
                else { // barrel button
                  // Selection box -- switch to selection tool
                }
                
              }
              else if (e.pointerType == 'mouse') {
                if (!e.altKey) {
                  if (e.button == 0) {
                    this.mouseDown = true;
                    if (this.selectedTool == 'pen') {
                      canvas.discardActiveObject();
                      canvas.selection = false;
                      this.scaleDrawingCanvas(canvas,ctx);

                      let cursorPos = this.getCursorPos(e,canvas);
  
                      this.points.push(new Object);
                      this.addPoint(cursorPos.x, cursorPos.y, false, ctx);
                    }
                    else if (this.selectedTool == 'eraser') {
                      canvas.selection = false;
                    }
                    else {
                      // selection box
                    }
                  }
                }
                else {// alt key pressed
                  canvas.isDragging = true;
                  canvas.selection = false;
                  canvas.lastPosX = e.clientX;
                  canvas.lastPosY = e.clientY; 
                }
                
              }
              else { // touch (dragging)
                
                if (canvas.getActiveObjects().length == 0) { // Allow using touch to move selected items
                  canvas.isDragging = true;
                  canvas.selection = false;
                  canvas.lastPosX = e.clientX;
                  canvas.lastPosY = e.clientY;
                }
              }
            });
        
            fabric.util.addListener(canvas.upperCanvasEl, 'pointermove', e => {
              
              if (e.pointerType == 'pen') {
                //if tool == eraser {
                  // delete e.target object
                //}
                //send drawing command to socket
                //canvas.freeDrawingBrush.width = Math.round(e.pressure * 5);
                if (this.mouseDown) {
                  if (this.selectedTool == 'pen') {
                    let cursorPos = this.getCursorPos(e,canvas);
                    this.addPoint(cursorPos.x, cursorPos.y, true, ctx);
                  }
                  else if (this.selectedTool == 'eraser') {
                    //
                  }
                  else { //other tools

                  }
                }
                
              }
              else if (e.pointerType == 'mouse') {
                if (this.mouseDown) {
                  if (this.selectedTool == 'pen') {
                      //send drawing command to socket
                      // pen or eraser
                      let cursorPos = this.getCursorPos(e,canvas);
                      this.addPoint(cursorPos.x, cursorPos.y, true, ctx);
                  }
                  else if (this.selectedTool == 'eraser') {
                      //
                  }
                  else { //other tools

                  }
                }
                if (e.altKey && canvas.isDragging) {
                  canvas.viewportTransform[4] += e.clientX - canvas.lastPosX;
                  canvas.viewportTransform[5] += e.clientY - canvas.lastPosY;
                  canvas.requestRenderAll();
                  canvas.lastPosX = e.clientX;
                  canvas.lastPosY = e.clientY;
                }
              }
              else { // touch (dragging)
                if (canvas.isDragging) {
                  canvas.viewportTransform[4] += e.clientX - canvas.lastPosX;
                  canvas.viewportTransform[5] += e.clientY - canvas.lastPosY;
                  canvas.requestRenderAll();
                  canvas.lastPosX = e.clientX;
                  canvas.lastPosY = e.clientY;
                }
              }
            });
        
            fabric.util.addListener(canvas.upperCanvasEl, 'pointerup', e => {
              canvas.selection = true;
              this.mouseDown = false;
              if (e.pointerType == 'pen') {
                if (e.button == 0){
                  if (this.selectedTool == 'pen') {
                    this.finalisePath(canvas,ctx);
                    this.points = [];
                    this.descaleDrawingCanvas(canvas,ctx);
                  }
                }
                else if (e.button == 5) {
                  this.selectedTool = 'pen';
                }
                else {
                  //
                }
                
              }
              else if (e.pointerType == 'mouse') {
                if (this.selectedTool == 'pen') {
                  this.finalisePath(canvas, ctx);
                  this.points = [];
                  this.descaleDrawingCanvas(canvas,ctx);
                }
                if(canvas.isDragging) {
                  canvas.isDragging = false;
                  canvas.forEachObject(function(obj) { // reset the coner coordinates after panning so that objects are still selectable
                    obj.setCoords();
                  });
                }
              }
              else { // touch (dragging)
                canvas.isDragging = false;
                canvas.forEachObject(function(obj) { // reset the coner coordinates after panning so that objects are still selectable
                  obj.setCoords();
                });
              }
            });

        },

        draw(ctx) {

                let length = this.points.length;
                let dot = this.points[length-1];
                let prevDot;
                if (length > 1) {
                  prevDot = this.points[length-2];
                }
                
                ctx.beginPath();
    
                if (dot.dragging) {
    
                    let midpoint = this.getMidpoint(dot, prevDot);
                    this.roundPixels(prevDot);
                    this.roundPixels(dot);
    
                    ctx.moveTo(this.prevMidpoint.x, this.prevMidpoint.y);
                    ctx.quadraticCurveTo(prevDot.x, prevDot.y, midpoint.x, midpoint.y);
                    this.prevMidpoint = midpoint;
                }
                else { //first point
                    ctx.moveTo(dot.x - 1, dot.y);
                    ctx.lineTo(dot.x, dot.y);
                    this.prevMidpoint = {
                        x: dot.x -1,
                        y: dot.y
                    }
                }
    
                ctx.lineCap = 'round';
                ctx.lineJoin= 'round';
                ctx.strokeStyle = this.colour;
                ctx.lineWidth = this.lineWidth;
                ctx.stroke();
                ctx.closePath();
    
        },
    
        scaleDrawingCanvas(canvas,ctx) { // Scale upper canvas up and size it back down to remove blurry lines on high DPI screens when drawing
            let devicePixelRatio = window.devicePixelRatio || 1;

            canvas.upperCanvasEl.setAttribute('width', canvas.width * devicePixelRatio);
            canvas.upperCanvasEl.setAttribute('height', canvas.height * devicePixelRatio);

            ctx.scale(devicePixelRatio, devicePixelRatio);
        },

        descaleDrawingCanvas(canvas) { // Descale upper canvas for fabric to calculate accurate mouse coordinates

          canvas.upperCanvasEl.setAttribute('width', canvas.width);
          canvas.upperCanvasEl.setAttribute('height', canvas.height);

          //ctx.scale(-devicePixelRatio, -devicePixelRatio); -- hides selection box?
      },

        getMidpoint(point1, point2) {
            return {
                x: Math.round((point1.x + point2.x)/2),
                y: Math.round((point1.y + point2.y)/2)
            }
        },
    
        roundPixels(point) {
            return {
                x: Math.round(point.x),
                y: Math.round(point.y)
            }
        },
    
        addPoint(x, y, dragging, ctx) {
            let newDot = new fabric.Point(x,y);
            newDot.dragging = dragging;

            this.points.push(newDot);
            this.draw(ctx);
        },
    
        // Handles cursor position for different pointers
        getCursorPos(event, canvas) {
            let mouseX, mouseY;

            if (event.pointerType == 'mouse' || event.pointerType == 'pen') {
                mouseX = event.pageX;// - canvas.viewportTransform[4];
                mouseY = event.pageY;// - canvas.viewportTransform[5];
            }
            else { // touch
                mouseX = event.touches[0].clientX;
                mouseY = event.touches[0].clientY;
            }
            return {
                x: mouseX,
                y: mouseY
            };

            
        },

        adjustPointsforDrag(canvas) { // Changes the coordinates to adjust for the dragging of the canvas so the svg will be put in the correct location
          let length = this.points.length;
          for (let i = 0; i < length; i++) {
            this.points[i].x -= canvas.viewportTransform[4];
            this.points[i].y -= canvas.viewportTransform[5];
          }

        },

        finalisePath(canvas, ctx) {
          this.adjustPointsforDrag(canvas);
          let pathData = fabric.PencilBrush.prototype.convertPointsToSVGPath(this.points).join('');
          if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
            // do not create 0 width/height paths, as they are
            // rendered inconsistently across browsers
            // Firefox 4, for example, renders a dot,
            // whereas Chrome 10 renders nothing
            canvas.requestRenderAll();
            return;
          }

          let path = this.createPath(pathData,canvas);
          canvas.clearContext(ctx);
          canvas.add(path);
          canvas.renderAll();
          path.setCoords();


          // fire event 'path' created
          canvas.fire('path:created', { path: path });
        },

        createPath(pathData) {
          let path = new fabric.Path(pathData, {
            fill: null,
            stroke: this.colour,
            strokeWidth: this.lineWidth,
            strokeLineCap: 'round',
            strokeMiterLimit: 10,
            strokeLineJoin: 'round',
            strokeDashArray: null
          });
          let position = new fabric.Point(path.left + path.width / 2, path.top + path.height / 2);
          position = path.translateToGivenOrigin(position, 'center', 'center', path.originX, path.originY);
          path.top = position.y;
          path.left = position.x;
    
          return path;
        }

    }
}