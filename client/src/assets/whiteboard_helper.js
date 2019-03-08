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

    fabric.Path.prototype.set({
      hoverCursor: 'default',
      perPixelTargetFind: true
    });
  
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
        console.log(zoom);
        canvas.zoomToPoint({ x: event.offsetX, y: event.offsetY }, zoom);
        event.preventDefault();
        event.stopPropagation();
      });

    // When drawing, only use drawing cursor.
    fabric.util.addListener(canvas.upperCanvasEl, 'pointerover', e => {
      if (e.pointerType == 'pen') {
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
    });
    

    // set up pointer event listeners to identify pen/mouse/touch
    fabric.util.addListener(canvas.upperCanvasEl, 'pointerdown', e => {

      if (e.pointerType == 'pen') {
        if (e.button == 0) { // Pen contact
          if (canvas.getActiveObjects().length == 0) {
            canvas.isDrawingMode = true;
          }
        }
        else if (e.button == 5) { // eraser button/end of stylus
          //switch to eraser tool
        }
        else { // barrel button
          // Selection box
        }
        
      }
      else if (e.pointerType == 'mouse') {
        if (false) { //board.toolSelected
          canvas.isDrawingMode = true;
        }
        else if (e.altKey) {// alt key pressed
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
      //fabric.PencilBrush._preapreForDrawing - add point with width value
      //fabric.Point.prototype add width properties
      //fabric.PencilBrush._captureDrawingPath - add point with width value
      //fabric.PencilBrush._render - stroke in for statement & ctx.strokeWidth = point.width
      //maybe fabric.PencilBrush.convertPointsToSVGPath add width
      // createPath && _finalizeAndAddPath

      
      if (e.pointerType == 'pen') {
        //if tool == eraser {
          // delete e.target object
        //}
        //send drawing command to socket
        //canvas.freeDrawingBrush.width = Math.round(e.pressure * 5);
      }
      else if (e.pointerType == 'mouse') {
        if (canvas.isDrawingMode) { 
          //send drawing command to socket
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
      
      if (e.pointerType == 'pen') {
        canvas.isDrawingMode = false;
        canvas.freeDrawingBrush.onMouseUp(); // Simulate mouse up event to end the path and convert it to an svg
      }
      else if (e.pointerType == 'mouse') {
        if (canvas.isDrawingMode) { 
          canvas.isDrawingMode = false;
          canvas.freeDrawingBrush.onMouseUp(); // Simulate mouse up event to end the path and convert it to an svg
        }
        if(canvas.isDragging) {
          canvas.isDragging = false;
          canvas.selection = true;
          canvas.forEachObject(function(obj) { // reset the coner coordinates after panning so that objects are still selectable
            obj.setCoords();
          });
        }
      }
      else { // touch (dragging)
        canvas.isDragging = false;
        canvas.selection = true;
        canvas.forEachObject(function(obj) { // reset the coner coordinates after panning so that objects are still selectable
          obj.setCoords();
        });
      }
    });

    fabric.util.addListener(canvas.upperCanvasEl, 'contextmenu', e => {
      e.preventDefault();
    });

    let text = new fabric.IText('hello world', { left: 100, top: 100});
    let text2 = new fabric.IText('hello world2', { left: 20, top: 100});

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
}