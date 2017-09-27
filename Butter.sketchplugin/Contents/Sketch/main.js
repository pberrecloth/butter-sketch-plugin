
var plugin

function onSetUp(context) {
  plugin = context.plugin

  loadFramework("ButterFramework", "BRManager")
  BRManager.shared().selectionChanged_inDocument(context.selection, context.document)
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
    BRManager.shared().start(context.actionContext.document)
  })
}

function selectionChanged(context) {
  BRManager.shared().selectionChanged_inDocument(context.actionContext.newSelection, context.actionContext.document)
}

//--------------------------
// Menu item actions
//--------------------------

function buttSelectionUp(context) {
  BRManager.shared().buttUp(0);
}

function buttSelectionDown(context) {
  BRManager.shared().buttDown(0);
}

function buttSelectionLeft(context) {
  BRManager.shared().buttLeft(0);
}

function buttSelectionRight(context) {
  BRManager.shared().buttRight(0);
}

function showSettings() {
  BRSettingsController.show()
}
