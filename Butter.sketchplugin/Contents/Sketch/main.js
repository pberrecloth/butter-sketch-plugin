
var plugin

function onSetUp(context) {
  plugin = context.plugin

  var lastUsedVersion = NSUserDefaults.standardUserDefaults().stringForKey("ButterLastUsedVersion")
  if (lastUsedVersion != plugin.version()) {
    // Must restart Sketch
    var alert = NSAlert.alloc().init()
    alert.setMessageText("Butter Plugin")
    alert.setInformativeText("Please restart Sketch to begin using the Butter plugin correctly")
    alert.addButtonWithTitle("Ok")
    alert.runModal()
  }

  loadFramework("ButterFramework", "BRManager")
}

function loadFramework(name, className) {
  var path = plugin.urlForResourceNamed(name + ".framework").path().stringByDeletingLastPathComponent()

  if (NSClassFromString(className) == null)
    return Mocha.sharedRuntime().loadFrameworkWithName_inDirectory(name, path)
  else return true
}

//--------------------------
// Action handlers
//--------------------------

function openDoc(context) {
  coscript.setShouldKeepAround(true)
  coscript.scheduleWithInterval_jsFunction(0, function(interval){
    BRManager.shared().start_withPlugin(context.actionContext.document, plugin)
  })
}

function selectionChanged(context) {
  BRManager.shared().selectionChanged_inDocument(context.actionContext.newSelection, context.actionContext.document)
}

//--------------------------
// Menu item actions
//--------------------------

function buttSelectionUp() {
  BRManager.shared().buttUp(0);
}

function buttSelectionDown() {
  BRManager.shared().buttDown(0);
}

function buttSelectionLeft() {
  BRManager.shared().buttLeft(0);
}

function buttSelectionRight() {
  BRManager.shared().buttRight(0);
}

function incrementSpacing() {
  BRManager.shared().incrementSpacing();
}

function decrementSpacing() {
  BRManager.shared().decrementSpacing();
}

function snap() {
  BRManager.shared().snap();
}

function showSettings() {
  BRSettingsController.show()
}
