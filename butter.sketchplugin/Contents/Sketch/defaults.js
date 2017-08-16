
var defaultsKey = "com.butter.sketchplugin"

var defaults = {
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
    lastValue: newValue
  }

  saveDefaults()
}
