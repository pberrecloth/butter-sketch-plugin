@import 'defaults.js'

var UI = require('sketch/ui');
var doc, selection, count;

// Automatically called first when the plugin is actioned
function onSetUp(context) {
  doc = context.document
  selection = context.selection
  count = selection.count()

  fetchDefaults()
}

// Possible directions for 'butting'
var directions = {
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3
}


//--------------------------
// Plugin handlers
//--------------------------

function buttSelectionUp() {
  buttSelection(directions.UP)
}

function buttSelectionDown() {
  buttSelection(directions.DOWN)
}

function buttSelectionLeft() {
  buttSelection(directions.LEFT)
}

function buttSelectionRight() {
  buttSelection(directions.RIGHT)
}

// Spacing

function buttSelectionUpAddingMargin() {
  buttSelection(directions.UP, true)
}

function buttSelectionDownAddingMargin() {
  buttSelection(directions.DOWN, true)
}

function buttSelectionLeftAddingMargin() {
  buttSelection(directions.LEFT, true)
}

function buttSelectionRightAddingMargin() {
  buttSelection(directions.RIGHT, true)
}


//--------------------------
// Implementation
//--------------------------

// Butt all selected elements in a specified direction
// direction: The direction to butt from
function buttSelection(direction, askUser) {

  var layersToButt = selection

  // If nothing is selected — use the current artboard, otherwise use the page's layers
  if (layersToButt.count() == 0) {
    var page = doc.currentPage()
    var artboard = page.currentArtboard()
    layersToButt = artboard ? artboard.layers() : page.layers()
  }
  else if (layersToButt.count() == 1) {
    // If exactly one thing is selected, use it's layers
    layersToButt = layersToButt.firstObject().layers()
  }

  // Will only work if the user has selected more than one layer
  if (layersToButt.count() <= 1) {
    doc.showMessage("Select at least two layers to butt together. Or one layer with multiple sublayers.")
    return
  }


  // Get the margin for butting — asking the user if necessary
  var margin = getMargin(direction, askUser)
  // If the user cancelled their margin input, finish running the script
  if (margin === null) {
    return
  }

  // Deselect all layers — in case we are not butting the current selection
  selection.forEach(function(layer) {
    layer.select_byExtendingSelection(false, false)
  })

  // Convert the selection array from an NSArray into a Javascript array
  // This makes it easier to sort and use 'shift' etc.
  var layersArray = []
  layersToButt.forEach(function(layer) {
    layersArray.push(layer)
    // Select all the layers we are butting — in case we are not butting the original selection
    layer.select_byExtendingSelection(true, true)
  })

  // Sort the layers based on the direction
  var layers = sortLayersForDirection(layersArray, direction)

  // Apart from the first layer, shift each layer based on previous layer's position
  var previous = layers.shift()
  layers.forEach(function(layer) {
    // The amount to offset the layer
    var x = 0
    var y = 0

    // Shift the position based on the direction we are 'butting'
    switch(direction) {
      case directions.LEFT:
        x = margin - pageRectForLayer(layer).minX() + pageRectForLayer(previous).maxX()
        break;
      case directions.RIGHT:
        x = pageRectForLayer(previous).minX() - pageRectForLayer(layer).maxX() - margin
        break;
      case directions.UP:
        y = margin - pageRectForLayer(layer).minY() + pageRectForLayer(previous).maxY()
        break;
      case directions.DOWN:
        y = pageRectForLayer(previous).minY() - pageRectForLayer(layer).maxY() - margin
        break;
    }

    offsetLayer(layer, x, y)

    // Reorder the layer list — if that's the preference
    if (defaults.reorderLayerList > 0) {
      // Reorder the layer in the layer list by removing it, then placing after the previous layer
      layer.removeFromParent()
      previous.parentGroup().insertLayer_afterLayerOrAtEnd(layer, previous)
    }

    previous = layer
  })

  // Display a message for what just occured
  var message = "Butted " + layersToButt.count() + " layers"
  if (margin != 0)
    message += " with a spacing of " + margin

  doc.showMessage(message)
}


//--------------------------
// Helper functions
//--------------------------

// Return the correct margin to use, saving and the defaults for next time
// shouldAskUser: (Boolean) Whether to prompt the user to enter a margin
function getMargin(direction, shouldAskUser) {
  // Return this value if we don't have to prompt the user
  if (!shouldAskUser) return 0;

  var response,directionText;

  // set text based on direction integer
  switch(direction) {
    case directions.LEFT:
      directionText = 'left';
      break;
    case directions.RIGHT:
      directionText = 'right';
      break;
    case directions.UP:
      directionText = 'up';
      break;
    case directions.DOWN:
      directionText = 'down';
      break;
  }

  // Ask the user to enter the margin — if they cancel, return nothing
  UI.getInputFromUser(`Spacing ${directionText}:`, {initialValue: defaults.lastValue}, (err, val) => {
    if (err) {
      response = null;
    } else {
      val = parseInt(val);

      // Save the margin for next time
      updateLastValueDefault(val);

      response = val;
    }
  })

  return response;
}

// Sort an array of layers for a given direction
// layers: An array of the layers to order
// direction: The direction to order them in reference to
function sortLayersForDirection(layers, direction) {
  return layers.sort(function(a, b) {
    var aFrame = pageRectForLayer(a)
    var bFrame = pageRectForLayer(b)

    switch(direction) {
      case directions.LEFT:
        return aFrame.minX() <= bFrame.minX() ? -1 : 1
      case directions.RIGHT:
        return aFrame.maxX() >= bFrame.maxX() ? -1 : 1
      case directions.UP:
        return aFrame.minY() <= bFrame.minY() ? -1 : 1
      case directions.DOWN:
        return aFrame.maxY() >= bFrame.maxY() ? -1 : 1
    }
  })
}

// Offset a layer's position by x and y
function offsetLayer(layer, x, y) {
  layer.frame().setX(layer.frame().x() + x)
  layer.frame().setY(layer.frame().y() + y)

  // Since the layer has moved, it's parent's frame may need to be updated
  var parent = layer.parentGroup()
  if (parent) {
    parent.fixGeometryWithOptions ?
      parent.fixGeometryWithOptions(0) :
      parent.resizeToFitChildrenWithOption(0)
  }
}

// As of Sketch 72, something has changed in the internal API that broke the old method of 
// getting the page rectangle. I've written an ugly shim below that seems to work but I can't 
// test all possible options as I don't actually have personal access to Sketch.
function pageRectForLayer(layer) {
  var frame = layer.frameForTransforms()
  var coords = pageCoordinatesForLayer(layer)
  return new Rect(coords.x, coords.y, frame.size.width, frame.size.height)
}

// Convert the coordinates of a layer's frame to one central coordinate space – within the page
function pageCoordinatesForLayer(layer) {
  // We only need to figure out x and y coordinates
  var x = 0, y = 0

  // Loop through each parent until there are no more parents
  // Offset the coordinate, by the parents coordinates
  while(layer) {
    var frame = layer.frameForTransforms()
    x += frame.origin.x
    y += frame.origin.y

    layer = layer.parentGroup()
  }

  return { x: x, y: y}
}

// Ugly shim to get this to work again
class Rect {
  constructor (x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  minX () {
    return this.x
  }

  minY () {
    return this.y
  }

  maxX () {
    return this.x + this.width
  }

  maxY () {
    return this.y + this.height
  }
}
