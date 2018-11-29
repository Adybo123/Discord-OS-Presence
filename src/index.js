/*
  Discord OS Rich Presence
  Originally by Adam Soutar
*/

console.log('Connecting to Discord')

const clientId = '517427338284236831'
const checkDelay = 10000
const discord = require('discord-rich-presence')(clientId)
const processWindows = require('node-process-windows')

console.log(`Connected. Watching windows every ${checkDelay / 1000}s`)

var lastCheck = {
  'processName': undefined,
  'windowTitle': undefined,
  'timestamp': 0
}

// Used for 'largeImageKey' in Discord payload
var osNiceNames = ['Windows', 'macOS', 'Linux', 'Unknown']
var osKeys = ['win32', 'darwin', 'linux', 'unknown']
var os = osKeys.indexOf(process.platform)
// largeImageKey bodge for now
osKeys[0] = 'windows'
var finders = ['Windows Explorer', 'Finder', 'File Browser', 'File Browser']

if (os === -1) {
  // Unsupported OS
  console.log("You're running an unsupported os. Window recognition might not work.")
  os = 3
}

console.log(`Platform: ${osKeys[os]} OS: ${osNiceNames[os]}`)

function processToRichPresence () {
  processWindows.getActiveWindow((error, processInfo) => {
    if (error) {
      console.log('Error fetching active process!')
      console.log(error)
      return
    }
    console.log(processInfo)

    // Windows Explorer counts as null (maybe other programs too)
    let isExp = (processInfo === null)
    let processName = (isExp) ? finders[os] : processInfo.ProcessName
    let windowTitle = (isExp) ? 'Browsing...' : processInfo.MainWindowTitle
    let nowStamp = Date.now()

    // Make sure it's a different app, and that it's been 15s
    // Discord rejects a Rich Presence change within 15s
    var isGood = (
      (lastCheck.processName !== processName ||
      lastCheck.windowTitle !== windowTitle) &&
      nowStamp - lastCheck.timestamp > 15000
    )
    console.log(`Are we sending an update? ${isGood ? 'Yes' : 'No'}`)
    if (isGood) {
      // New program data!
      lastCheck = {
        'processName': processName,
        'windowTitle': windowTitle,
        'timestamp': nowStamp
      }
      console.log(`Switched to ${processName}, updating Discord`)

      var details = `Using ${processName} on ${osNiceNames[os]}`
      // We can't fetch processName on macOS yet.
      if (osNiceNames[os] === 'macOS') {
        details = 'macOS'
      }

      // Push to Discord
      discord.updatePresence({
        state: windowTitle,
        details: details,
        startTimestamp: nowStamp,
        largeImageKey: osKeys[os],
        largeImageText: osNiceNames[os]
      })
    }
  })
}

setInterval(processToRichPresence, checkDelay)
