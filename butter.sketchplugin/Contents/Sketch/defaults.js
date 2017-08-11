
var defaultsKey = "com.butter.sketchplugin"

var defaults = {
  askPrompt: true,
  defaultValue: 0,
  reorderLayerList: true,
  lastValue: 0
}

function fetchDefaults() {
  var newDefaults = NSUserDefaults.standardUserDefaults().dictionaryForKey(defaultsKey)
  if (newDefaults != null) {
    defaults = newDefaults
  }
}

function saveDefaults() {
  NSUserDefaults.standardUserDefaults().setObject_forKey(defaults, defaultsKey)
}

function updateLastValueDefault(newValue) {
  defaults = {
    askPrompt: defaults.askPrompt,
    defaultValue: defaults.defaultValue,
    reorderLayerList: defaults.reorderLayerList,
    lastValue: newValue
  }

  saveDefaults()
}
