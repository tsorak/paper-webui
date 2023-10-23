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
  - Backend
    - fs-watcher for saves folder + WS trigger
  - HTTP API
    - Abort load/delete requests if instance is running
  - UI
    - [x] Table structure? [Name, Version]
    - [ ] Separate table for deleted saves
    - [x] Controls (Load, Clone, Delete, Download) static toolbar on top
    - [ ] Rename
    - [x] Load world
      - [x] Display current world deletion confirmation
      - [x] Offer to back up current world before loading new one
        - [x] Savename form
    - [x] Delete world
      - [x] Confirmation
    - Settings
      - [ ] Option for disabling deletion prompt
- [ ] Datapacks management
  - Persist datapacks between saves option?
  - [ ] HTTP API
  - [ ] UI
- [ ] Initial and max memory management
- [ ] Whitelist management
- [ ] Ports management
- [ ] Webui authentication
- [ ] Implement serverMessage patternmatching based on whether the logLine starts with, includes or is an exact match to the phrase.
- Global cached state for reducing IO
  - saves_manifest
    - [x] cache saves state
    - [ ] Update via fs-watcher
  - jar_manifest
    - [ ] cache jars state
    - [ ] Update via fs-watcher

### WIP Refactor

- [ ] Line parser
  - Break out into smaller functions

#### May-be done refactoring

- [x] Improve readability in saves_manifest init with fs/exists
- [x] Static route
  - Break out into smaller functions

### WIP Bugs

#### Fixed bugs

- [x] Fix downloaded jars not appearing in downloaded jars list (fs-watch @/jars, ws emit)

## Not actively working on

- [ ] Instance "Stopping" state
- [ ] Multi-instance~
- [ ] Have the `skipworld` command run a separate instance in the background for generating a new world
