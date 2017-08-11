@import 'ui.js'

var doc, selection, count

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

function showSettings() {
  showSettingsScreen()
}


//--------------------------
// Implementation
//--------------------------

// Butt all selected elements in a specified direction
// direction: The direction to butt from
function buttSelection(direction) {
  // Will only work if the user has selected more than one layer
  if (count <= 1) {
    doc.showMessage("Select at least two layers to butt together")
    return
  }

  // Will only work if all the layers have the same parent
  if (!layersHaveSameParent(selection)) {
    doc.showMessage("Please select multiple layers in one group")
    return
  }

  // Get the margin for butting — asking the user if necessary
  var margin = getMargin()
  // If the user cancelled their margin input, finish running the script
  if (margin === null)
    return


  // Convert the selection array from an NSArray into a Javascript array
  // This makes it easier to sort and use 'shift' etc.
  var selectedLayers = []
  selection.forEach(function(layer) {
    selectedLayers.push(layer)
  })

  // Sort the layers based on the direction
  var layers = sortLayersForDirection(selectedLayers, direction)

  // Apart from the first layer, shift each layer based on previous layer's position
  var previous = layers.shift()
  layers.forEach(function(layer) {
    // Shift the position based on the direction we are 'butting'
    switch(direction) {
      case directions.LEFT:
        layer.frame().setX(previous.frame().maxX() + margin)
        break;
      case directions.RIGHT:
        layer.frame().setX(previous.frame().minX() - margin - layer.frame().width())
        break;
      case directions.UP:
        layer.frame().setY(previous.frame().maxY() + margin)
        break;
      case directions.DOWN:
        layer.frame().setY(previous.frame().minY() - margin - layer.frame().height())
        break;
    }

    // Reorder the layer list — if that's the preference
    if (defaults.reorderLayerList > 0) {
      // Reorder the layer in the layer list by removing it, then placing after the previous layer
      layer.removeFromParent()
      previous.parentGroup().insertLayer_afterLayerOrAtEnd(layer, previous)
    }

    previous = layer
  })

  // Display a message for what just occured
  var message = "Butted " + count + " layers"
  if (margin != 0)
    message += " with " + margin + " spacing"

  doc.showMessage(message)
}


//--------------------------
// Helper functions
//--------------------------

// Return the correct margin to use, saving and the defaults for next time
// shouldAskUser: (Boolean) Whether to prompt the user to enter a margin
function getMargin(shouldAskUser) {

  // Return this value if we don't have to prompt the user
  if (defaults.askPrompt == 0)
    return defaults.defaultValue

  // Ask the user to enter the margin — if they cancel, return nothing
  var response = doc.askForUserInput_ofType_initialValue("Spacing", 1, defaults.lastValue).floatValue()
  if (response === null)
    return null

  // Save the margin for next time
  updateLastValueDefault(response)
  return response
}

// Sort an array of layers for a given direction
// layers: An array of the layers to order
// direction: The direction to order them in reference to
function sortLayersForDirection(layers, direction) {
  return layers.sort(function(a, b) {
    switch(direction) {
      case directions.LEFT:
        return a.frame().minX() <= b.frame().minX() ? -1 : 1
      case directions.RIGHT:
        return a.frame().maxX() >= b.frame().maxX() ? -1 : 1
      case directions.UP:
        return a.frame().minY() <= b.frame().minY() ? -1 : 1
      case directions.DOWN:
        return a.frame().maxY() >= b.frame().maxY() ? -1 : 1
    }
  })
}

// Return whether all layers have the same parent or not
// layers: An array of layers
function layersHaveSameParent(layers) {
  if (layers.count() < 1)
    return false

  return layers.every(function(layer) {
    return layer.parentGroup() == layers[0].parentGroup()
  })
}


// CURRENTLY UNUSED HELPER FUNCTIONS

// Return whether all layers have the same spacing between them in a specific direction
function areLayersButted(layers, diretion) {
  var previous = layers.shift()
  var spacing = null

  return layers.every(function(layer) {
    var newSpacing = spaceBetweenLayers(previous, layer, direction)
    previous = layer

    if (spacing && newSpacing != spacing) {
      return false
    }

    spacing = newSpacing
    return true
  })
}

// Returns the space between two layers in a specific direction
function spaceBetweenLayers(a, b, direction) {
  switch(direction) {
    case directions.LEFT:
      return b.frame().minX() - a.frame().maxX()
    case directions.RIGHT:
      return a.frame().minX() - b.frame().maxX()
    case directions.UP:
      return b.frame().minY() - a.frame().maxY()
    case directions.DOWN:
      return a.frame().minY() - b.frame().maxY()
  }
}
