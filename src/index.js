/*
  Discord OS Rich Presence
  Originally by Adam Soutar
*/

console.log('Connecting to Discord')

const clientId = '517427338284236831'
const checkDelay = 10000
const discord = require('discord-rich-presence')(clientId)
const processWindows = require('node-process-windows')
var lastCheck = {
  'processName': undefined,
  'windowTitle': undefined,
  'timestamp': 0
}

console.log('Connected')

function processToRichPresence () {
  processWindows.getActiveWindow((error, processInfo) => {
    if (error) {
      console.log('Error fetching active process!')
      console.log(error)
      return
    }

    // Windows Explorer counts as null (maybe other programs too)
    let isExp = (processInfo === null)
    let processName = (isExp) ? 'Windows Explorer' : processInfo.ProcessName
    let windowTitle = (isExp) ? 'Browsing...' : processInfo.MainWindowTitle
    let nowStamp = Date.now()

    // Make sure it's a different app, and that it's been 15s
    // Discord rejects a Rich Presence change within 15s
    if (
      (lastCheck.processName !== processName ||
      lastCheck.windowTitle !== windowTitle) &&
      nowStamp - lastCheck.timestamp > 15000
    ) {
      // New program data!
      lastCheck = {
        'processName': processName,
        'windowTitle': windowTitle,
        'timestamp': nowStamp
      }
      console.log(`Switched to ${processName}, updating Discord`)

      // Push to Discord
      discord.updatePresence({
        state: windowTitle,
        details: `Using ${processName}`,
        startTimestamp: nowStamp,
        largeImageKey: 'windows',
        largeImageText: 'Windows'
      })
    }
  })
}

setInterval(processToRichPresence, checkDelay)
