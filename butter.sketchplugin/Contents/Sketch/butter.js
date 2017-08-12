function initContext(context) {
  sketch = context.api(),
    doc = context.document,
        plugin = context.plugin,
        command = context.command,
        page = doc.currentPage(),
        pages = doc.pages(),
        artboard = page.currentArtboard(),
        selection = context.selection,
        selectionCount = selection.count()

    }

// ------------------------- MENU CALLS ----------------------- //

// Butt - No margin
function buttSelectionUp(context) {
  initContext(context)
  buttSelection("up", "Y", 1)
}
function buttSelectionDown(context) {
  initContext(context)
  buttSelection("down", "Y", 0)
}
function buttSelectionLeft(context) {
  initContext(context)
  buttSelection("left", "X", 1)
}
function buttSelectionRight(context) {
  initContext(context)
  buttSelection("right", "X", 0)
}
// Butt - With Margin
function buttSelectionUpAddingMargin(context) {
  initContext(context)
  var margin = [[doc askForUserInput:"Spacing" ofType:1 initialValue:"8"] integerValue];
  buttSelection("up", "Y", 1, margin)
}
function buttSelectionDownAddingMargin(context) {
  initContext(context)
  var margin = [[doc askForUserInput:"Spacing" ofType:1 initialValue:"8"] integerValue];
  buttSelection("down", "Y", 0, margin)
}
function buttSelectionLeftAddingMargin(context) {
  initContext(context)
  var margin = [[doc askForUserInput:"Spacing" ofType:1 initialValue:"8"] integerValue];
  buttSelection("left", "X", 1, margin)
}
function buttSelectionRightAddingMargin(context) {
  initContext(context)
  var margin = [[doc askForUserInput:"Spacing" ofType:1 initialValue:"8"] integerValue];
  buttSelection("right", "X", 0, margin)
}




// ------------------------- MAIN PROCESSOR ----------------------- //
function buttSelection(direction, axis, order, margin) {
  if (selectionCount <= 1) {
    doc.showMessage("Select at least two layers to butt together")
    }
    else
    {
      if (!margin){ var margin = 0;}
      var sortDirectionally = [NSSortDescriptor sortDescriptorWithKey:"absoluteRect.ruler"+axis ascending:order]
      var sortedLayers = [selection sortedArrayUsingDescriptors:[sortDirectionally]]
      sortSelectedLayersInList(sortedLayers)

      if (axis == "Y"){
        // Vertical butting
        for (var i=0; i<selectionCount; i++) {
          var layer = sortedLayers[i]
          var layerFrame = layer.frame()
          var layerHeight = layerFrame.height()
          if (direction == "down" && lastLayer){
            var newCoordinate = lastLayerY - layerHeight - margin
          }
          layer.frame().setY(newCoordinate)

          var lastLayer = layer
          var lastLayerFrame = lastLayer.frame()
          var lastLayerHeight = lastLayerFrame.height()
          var lastLayerY = lastLayerFrame.y()

          if (direction == "up"){
            var newCoordinate = lastLayerY + lastLayerHeight + margin
          } else {
            var newCoordinate = lastLayerY - layerHeight - margin
          }
        }
      } else {
        // Horizontal butting
        for (var i=0; i<selectionCount; i++) {
          var layer = sortedLayers[i]
          var layerFrame = layer.frame()
          var layerWidth = layerFrame.width()
          if (direction == "right" && lastLayer){
            var newCoordinate = lastLayerX - layerWidth - margin
          }

          layer.frame().setX(newCoordinate)

          var lastLayer = layer
          var lastLayerFrame = lastLayer.frame()
          var lastLayerWidth = lastLayerFrame.width()
          var lastLayerX = lastLayerFrame.x()

          if (direction == "left"){
            var newCoordinate = lastLayerX + lastLayerWidth + margin
          }
        }
      }
      newCoordinate = null;
      doc.showMessage("Processed " + selectionCount + " layer(s)")
  }
}

// ------------------------- UTILS ----------------------- //

// sorts selected layers in layer list
var sortSelectedLayersInList = function(sortedLayers){

  // make sure we have multiple layers in the same group
  if (!isMultipleSelectionInOneGroup()) {
    notify("Please select multiple layers in one group");
    return;
  }
/*
  // save layer indices
  var parent = selection[0].parentGroup();
  var layerIndices = [];
  var loop = [selection objectEnumerator], layer;
  while (layer = [loop nextObject]){
    layerIndices.push(parent.indexOfLayer(layer));
  }
  [page deselectAllLayers];

  // remove layers from parent
  var removeLoop = [selection objectEnumerator], layerToRemove;
  while (layerToRemove = [removeLoop nextObject]){
    [layerToRemove removeFromParent];
  }

  // insert them at the corresponding index
  for (var i = 0; i < layerIndices.length; i++) {
    var index = layerIndices[i];
    var sortedLayer = sortedLayers[i];
    var layerArray = [NSArray arrayWithObject:sortedLayer];
    [parent insertLayers:layerArray atIndex:index];
    [sortedLayer select:true byExpandingSelection:true];
  }
  */
  
}

// loops over selection to check if they're multiple, and part of the same group
var isMultipleSelectionInOneGroup = function(){
  if (selection.count() < 2) {
    return false;
  }
  var parent = selection[0].parentGroup();
  var loop = [selection objectEnumerator], layer;
  while (layer = [loop nextObject]){
    if (layer.parentGroup() != parent) {
      return false;
    }
  }
  return true;
}
