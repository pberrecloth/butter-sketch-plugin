@import 'defaults.js'

function showSettingsScreen(callback) {

  var alert = NSAlert.alloc().init()
  // alert.setIcon(iconImage)
	alert.setMessageText("Butter settings")
	alert.setInformativeText("Set your preferences for butter")
	alert.addButtonWithTitle("Done")

  var y = 150
  var container = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, y))
  alert.setAccessoryView(container)

  y -= 30
  var prompt = NSButton.alloc().initWithFrame(NSMakeRect(0, y, 300, 23))
	prompt.setState(defaults.askPrompt)
	prompt.setButtonType(NSSwitchButton)
  prompt.setBezelStyle(0)
	prompt.setTitle("Prompt to enter value every time")
  container.addSubview(prompt)

  y -= 28
  var spacingLabel = NSTextField.alloc().initWithFrame(NSMakeRect(19, y, 280, 23))
  spacingLabel.setBezeled(false)
  spacingLabel.setDrawsBackground(false)
  spacingLabel.setEditable(false)
  spacingLabel.setSelectable(false)
  spacingLabel.setStringValue("Default spacing")
  spacingLabel.setFont(NSFont.systemFontOfSize(10))
  container.addSubview(spacingLabel)

  y += 6
  var spacingTextField = NSTextField.alloc().initWithFrame(NSMakeRect(105, y, 70, 23))
	spacingTextField.setPlaceholderString("0")
  spacingTextField.setStringValue("" + defaults.defaultValue)
  container.addSubview(spacingTextField)

  var promptChangeCallback = function(sender) {
    if (sender.state() == NSOnState) {
      spacingLabel.setTextColor(NSColor.disabledControlTextColor())
      spacingTextField.setTextColor(NSColor.disabledControlTextColor())
      spacingTextField.setEditable(false)
      alert.window().makeFirstResponder(nil)
    } else {
      spacingLabel.setTextColor(NSColor.controlTextColor())
      spacingTextField.setTextColor(NSColor.controlTextColor())
      spacingTextField.setEditable(true)
    }
  }

  prompt.setCOSJSTargetFunction(promptChangeCallback)
  promptChangeCallback(prompt)

  y -= 40
  var layerList = NSButton.alloc().initWithFrame(NSMakeRect(0, y, 300, 23))
	layerList.setState(defaults.reorderLayerList)
	layerList.setButtonType(NSSwitchButton)
  layerList.setBezelStyle(0)
	layerList.setTitle("Reorder layer list")
  container.addSubview(layerList)

  if (alert.runModal() == '1000') {
    var spacingValue = parseFloat(spacingTextField.stringValue())

    defaults = {
      askPrompt: prompt.state(),
      defaultValue: isNaN(spacingValue) ? 0 : spacingValue,
      reorderLayerList: layerList.state(),
      lastValue: defaults.lastValue ? defaults.lastValue : 0
    }

    saveDefaults()
  }
}
