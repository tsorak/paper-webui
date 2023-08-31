# Todo / random thoughts

## Major features

- [x] Live server logs
- [x] Sending Minecraft server commands through webui
- [x] Simple webui only setup
  - [x] Jar downloader (Paper and mojang releases)
  - [x] EULA accept (terminal)

## Smaller features

- [x] Players online molecule (roles, OP level?)

## WIP

- [ ] Worlds management
  - [ ] HTTP API
    - Abort load/delete requests if instance is running
  - [ ] UI
    - Table structure? [Name, Version, Created]
    - Controls (Load, Clone?, Delete, Download) on each entry / static (or sticky) toolbar on top
- [ ] Initial and max memory management
- [ ] Whitelist management
- [ ] Ports management
- [ ] Webui authentication
- [ ] Implement serverMessage patternmatching based on whether the logLine starts with, includes or is an exact match to the phrase.

### WIP Refactor

- [ ] Static route
  - Break out into smaller functions
- [ ] Line parser
  - Break out into smaller functions

#### May-be done refactoring

- [x] Improve readability in saves_manifest init with fs/exists

### WIP Bugs

#### Fixed bugs

- [x] Fix downloaded jars not appearing in downloaded jars list (fs-watch @/jars, ws emit)

## Not actively working on

- [ ] Instance "Stopping" state
- [ ] Multi-instance~
