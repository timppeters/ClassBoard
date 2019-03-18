import {fabric} from 'fabric';

export const whiteboard_helper = {
    data() {
        return {
            points: [],
            prevMidpoint: {},
            mouseDown: false,
            canvas: {}
        }
    },
    methods: {
        initialiseCanvas(id) {
            
            this.canvas = this.init(id);

            this.listen();
            
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
          
            this.canvas.add(text);
            this.canvas.add(text2);
          },

        init(id) {

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

        
            // Set default object settings
            fabric.Object.prototype.set({
                transparentCorners: false,
                cornerColor: 'black',
                borderColor: 'grey',
                cornerSize: 10,
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

        listen() {
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

            document.addEventListener('paste', e => {
              let items = e.clipboardData.items;
              

              for (let i = 0; i < items.length; i++) {
                let file = items[i];
                let imageData = file.getAsFile();
                let URLobj = window.URL;
                let img = new Image();
                img.src = URLobj.createObjectURL(imageData);
                fabric.Image.fromURL(img.src, img => {
                  canvas.add(img);
                  img.center();
                  this.selectedTool = 'select';
                })
              }
              
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

            // Custom 'paste' context menu
            fabric.util.addListener(canvas.upperCanvasEl, 'contextmenu', e => {
              this.showContextMenu = true;
              let cursor = {x: e.clientX, y: e.clientY};
              let contextMenu = document.getElementsByClassName('contextMenu');
              console.log(contextMenu);
              console.log(contextMenu[0]);
              //contextMenu.setAttribute('left', cursor.x);
              //contextMenu.setAttribute('top', cursor.y);
            });
            
        
            // set up pointer event listeners to identify pen/mouse/touch
            fabric.util.addListener(canvas.upperCanvasEl, 'pointerdown', e => {
              this.showContextMenu = false;
              if (this.anyToolOptionsOpen()) {
                this.hideToolOptions(); // Hide tool option menus and don't register a tool click
              }
              else {
                  if (e.pointerType == 'pen') {
                    if (e.button == 0) { // Pen contact
                      if (canvas.getActiveObjects().length == 0) {
                        if (this.selectedTool == 'pen') {
                            this.mouseDown = true;
                            canvas.selection = false;
                            this.scaleDrawingCanvas();
    
                            let cursorPos = this.getCursorPos(e);
    
                            this.points.push(new Object);
                            this.addPoint(cursorPos.x, cursorPos.y, false);
                        }
                        else if (this.selectedTool == 'eraser') {
                          canvas.selection = false;
                          this.makeObjectsUnselectable();
                          this.mouseDown = true;
                        }
                        else if (this.selectedTool == 'text') {
                          let cursorPos = this.getCursorPos(e);
                          let zoom = 1/canvas.getZoom();
                          
                          let text = new fabric.IText('', {
                            left: (cursorPos.x - canvas.viewportTransform[4])*zoom,
                            top: (cursorPos.y - canvas.viewportTransform[5])*zoom,
                            fontSize: fabric.IText.prototype.fontSize * zoom,
                            fill: this.tools.colour.selected
                          });
                          canvas.add(text);
                          this.selectedTool = 'select';
                          canvas.setActiveObject(text);
                        }
                        else if (this.selectedTool == 'shape') {
                          let cursorPos = this.getCursorPos(e);
                          let zoom = 1/canvas.getZoom();
                          let x = (cursorPos.x - canvas.viewportTransform[4])*zoom;
                          let y = (cursorPos.y - canvas.viewportTransform[5])*zoom;
                          let shapeType = this.tools.shape.selected;
                          let shape;

                          switch(shapeType) {
                            case 'rect':
                              shape = new fabric.Rect({width: 100*zoom, height: 100*zoom});
                              break;
                            case 'line':
                              shape = new fabric.Line([x, y, x-(100*zoom), y+(100*zoom)], {width: 100*zoom, height: 100*zoom});
                              break;
                            case 'triangle':
                              shape = new fabric.Triangle({width: 100*zoom, height: 100*zoom});
                              break;
                            case 'circle':
                              shape = new fabric.Circle({radius: 100*zoom});
                              break;
                          }
                          shape.set({
                            left: x, 
                            top: y,
                            stroke: this.tools.colour.selected,
                            fill: null,
                            strokeWidth: this.tools.pen.size*zoom
                          });
                          canvas.add(shape);
                          this.selectedTool = 'select';
                        }
                        else {
                          // selection box
                        }
                      }
                    }
                    else if (e.button == 5) { // eraser button/end of stylus
                        this.mouseDown = true;
                        canvas.selection = false;
                        this.makeObjectsUnselectable();
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
                          this.makeObjectsUnselectable();
                          canvas.selection = false;
                          this.scaleDrawingCanvas();
    
                          let cursorPos = this.getCursorPos(e);
      
                          this.points.push(new Object);
                          this.addPoint(cursorPos.x, cursorPos.y, false);
                        }
                        else if (this.selectedTool == 'eraser') {
                          this.makeObjectsUnselectable();
                          canvas.selection = false;
                        }
                        else if (this.selectedTool == 'text') {
                          let cursorPos = this.getCursorPos(e);
                          let zoom = 1/canvas.getZoom();
                          
                          let text = new fabric.IText('', {
                            left: (cursorPos.x - canvas.viewportTransform[4])*zoom,
                            top: (cursorPos.y - canvas.viewportTransform[5])*zoom,
                            fontSize: fabric.IText.prototype.fontSize * zoom,
                            fill: this.tools.colour.selected
                          });
                          canvas.add(text);
                          this.selectedTool = 'select';
                          canvas.setActiveObject(text);
                        }
                        else if (this.selectedTool == 'shape') {
                          let cursorPos = this.getCursorPos(e);
                          let zoom = 1/canvas.getZoom();
                          let x = (cursorPos.x - canvas.viewportTransform[4])*zoom;
                          let y = (cursorPos.y - canvas.viewportTransform[5])*zoom;
                          let shapeType = this.tools.shape.selected;
                          let shape;

                          switch(shapeType) {
                            case 'rect':
                              shape = new fabric.Rect({width: 100*zoom, height: 100*zoom});
                              break;
                            case 'line':
                              shape = new fabric.Line([x, y, x-(100*zoom), y+(100*zoom)], {width: 100*zoom, height: 100*zoom});
                              break;
                            case 'triangle':
                              shape = new fabric.Triangle({width: 100*zoom, height: 100*zoom});
                              break;
                            case 'circle':
                              shape = new fabric.Circle({radius: 100*zoom});
                              break;
                          }
                          shape.set({
                            left: x, 
                            top: y,
                            stroke: this.tools.colour.selected,
                            fill: null,
                            strokeWidth: this.tools.pen.size*zoom
                          });
                          canvas.add(shape);
                          this.selectedTool = 'select';
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
                    let cursorPos = this.getCursorPos(e);
                    this.addPoint(cursorPos.x, cursorPos.y, true);
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
                      let cursorPos = this.getCursorPos(e);
                      this.addPoint(cursorPos.x, cursorPos.y, true);
                  }
                  else if (this.selectedTool == 'eraser') {
                      //
                  }
                  else { //other tools

                  }
                }
                if (e.altKey && canvas.isDragging && this.selectedTool != 'pen') {
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
              canvas.selection = true;
              this.mouseDown = false;
              if (e.pointerType == 'pen') {
                if (e.button == 0){
                  if (this.selectedTool == 'pen') {
                    this.finalisePath();
                    this.points = [];
                    this.descaleDrawingCanvas();
                  }
                  else if (this.selectedTool == 'eraser') {
                    this.makeObjectsSelectable();
                  }
                  else {
                    //
                  }
                }
                else if (e.button == 5) {
                  this.selectedTool = 'pen';
                  this.makeObjectsSelectable();
                }
                else {
                  //
                }
                
              }
              else if (e.pointerType == 'mouse') {
                if (e.button == 0){
                  if (this.selectedTool == 'pen') {
                    this.makeObjectsSelectable();
                    this.finalisePath();
                    this.points = [];
                    this.descaleDrawingCanvas();
                  }
                  else if (this.selectedTool == 'eraser') {
                    this.makeObjectsSelectable();
                  }
                  else {
                    //
                  }
                }


                if(canvas.isDragging) {
                  canvas.isDragging = false;
                  canvas.forEachObject(function(obj) { // reset the coner coordinates after panning so that objects are still selectable
                    obj.setCoords();
                  });
                }
              }
              else { // touch (dragging)
                if(canvas.isDragging) {
                  canvas.isDragging = false;
                  canvas.forEachObject(function(obj) { // reset the coner coordinates after panning so that objects are still selectable
                    obj.setCoords();
                  });
                }
                for (let i = 0; i < canvas.touches.length; i++) {
                  if (canvas.touches[i].pointerId == e.pointerId) {
                    canvas.touches.splice(i,1);
                  }
                }
              }
            });

        },

        draw() {
                let ctx = this.canvas.contextTop;
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
                ctx.strokeStyle = this.tools.colour.selected;
                ctx.lineWidth = this.tools.pen.size;
                ctx.stroke();
                ctx.closePath();
    
        },
    
        scaleDrawingCanvas() { // Scale upper canvas up and size it back down to remove blurry lines on high DPI screens when drawing
            let canvas = this.canvas;
            let ctx = canvas.contextTop;
            let devicePixelRatio = window.devicePixelRatio || 1;

            canvas.upperCanvasEl.setAttribute('width', canvas.width * devicePixelRatio);
            canvas.upperCanvasEl.setAttribute('height', canvas.height * devicePixelRatio);

            ctx.scale(devicePixelRatio, devicePixelRatio);
        },

        descaleDrawingCanvas() { // Descale upper canvas for fabric to calculate accurate mouse coordinates
          let canvas = this.canvas;

          canvas.upperCanvasEl.setAttribute('width', canvas.width);
          canvas.upperCanvasEl.setAttribute('height', canvas.height);

          //ctx.scale(-devicePixelRatio, -devicePixelRatio); -- hides selection box?
      },

      setInitialPinchZoomDistance() {
        let canvas = this.canvas;
        let distance = Math.hypot(canvas.touches[0].pageX - canvas.touches[1].pageX, canvas.touches[0].pageY - canvas.touches[1].pageY);
        canvas.oldPinchZoomDistance = distance;
      },

      pinchZoom() {
        let canvas = this.canvas;
        let midpoint = this.getMidpoint(canvas.touches[0], canvas.touches[1]);
        let distance = Math.hypot(canvas.touches[0].pageX - canvas.touches[1].pageX, canvas.touches[0].pageY - canvas.touches[1].pageY);
        let delta = (canvas.oldPinchZoomDistance - distance)/200; // Distance between fingers divided by arbitrary '300' to decrease the zoom speed
        let zoom = canvas.getZoom() - delta;
        if (zoom > 20) {
            zoom = 20;
        } 
        if (zoom < 0.15) {
            zoom = 0.15;
        }
        canvas.zoomToPoint({ x: midpoint.x, y: midpoint.y }, zoom);
        canvas.oldPinchZoomDistance = distance;
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
    
        addPoint(x, y, dragging) {
            let canvas = this.canvas;
            let ctx = canvas.contextTop;
            let newDot = new fabric.Point(x,y);
            newDot.dragging = dragging;

            this.points.push(newDot);
            this.draw(ctx);
        },
    
        // Handles cursor position for different pointers
        getCursorPos(event) {
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

        makeObjectsUnselectable() {
          let canvas = this.canvas;

          canvas.renderAll();
          canvas.discardActiveObject();
          canvas.forEachObject(function(object){ 
                object.selectable = false; 

                object.oldPerPixelTargetFind = object.perPixelTargetFind; // save the perPixelTargetFind setting
                object.perPixelTargetFind = true; // So that erasing is easier/quicker
          });
        },

        makeObjectsSelectable() {
          let canvas = this.canvas;

          canvas.renderAll();
          canvas.forEachObject(function(object){ 
                object.selectable = true;
                object.perPixelTargetFind = object.oldPerPixelTargetFind; // Set PerPixelTargetFind back to old value
          });
        },

        changeObjectColour(colour) {
          let canvas = this.canvas;
          let activeObjects = canvas.getActiveObjects();
          activeObjects.forEach(object => {
            let type = object.get('type')
            if (type == 'i-text' || type == 'text') {
              object.set('fill', colour);
            }
            else if (type == 'path') {
              object.set('stroke', colour);
            }
            else if (['circle', 'ellipse', 'line', 'rect', 'triangle'].includes(type)) {
              object.set('stroke', colour);
            }
            else {
              //img etc
            }
            
          });
          canvas.renderAll();
        },

        deleteObjects() {
          let canvas = this.canvas;
          if (canvas.getActiveObjects() == 0) {
            canvas.clear();
            canvas.setZoom(1);
          }
          else {
            canvas.getActiveObjects().forEach(object => {
              canvas.remove(object);
            });
            canvas.discardActiveObject();
          }
        },

        uploadImageToCanvas(e) {
          let canvas = this.canvas
          let reader = new FileReader();
          reader.onload = e => {
              let imgObj = new Image();
              imgObj.src = e.target.result;
              imgObj.onload = () => {                  
                  let image = new fabric.Image(imgObj);
                  image.center();
                  canvas.add(image);
                  this.selectedTool = 'select';
              }
              
          }
          reader.readAsDataURL(e.target.files[0]);
        },

        adjustPointsforDrag() { // Changes the coordinates to adjust for the dragging of the canvas so the svg will be put in the correct location
          let canvas = this.canvas;
          let length = this.points.length;
          for (let i = 0; i < length; i++) {
            this.points[i].x -= canvas.viewportTransform[4];
            this.points[i].y -= canvas.viewportTransform[5];
          }

        },

        adjustPointsforZoom() {
          let canvas = this.canvas;
          let ctx = canvas.contextTop;
          let length = this.points.length;
          let zoom = 1/canvas.getZoom();
          for (let i = 0; i < length; i++) {
            this.points[i].x *= zoom;
            this.points[i].y *= zoom;
            ctx.scale(zoom,zoom);
          }
        },

        finalisePath() {
          let canvas = this.canvas;
          let ctx = canvas.contextTop;
          this.adjustPointsforDrag();
          this.adjustPointsforZoom()
          let pathData = fabric.PencilBrush.prototype.convertPointsToSVGPath(this.points).join('');
          if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
            // do not create 0 width/height paths, as they are
            // rendered inconsistently across browsers
            // Firefox 4, for example, renders a dot,
            // whereas Chrome 10 renders nothing
            canvas.requestRenderAll();
            return;
          }

          let path = this.createPath(pathData);
          canvas.clearContext(ctx);
          canvas.add(path);
          canvas.renderAll();
          path.setCoords();


          // fire event 'path' created
          canvas.fire('path:created', { path: path });
        },

        createPath(pathData) {
          let canvas = this.canvas;
          let path = new fabric.Path(pathData, {
            fill: null,
            stroke: this.tools.colour.selected,
            strokeWidth: this.tools.pen.size * (1/canvas.getZoom()),
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