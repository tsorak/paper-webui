const check = {
  /**
   * @example startsWithNametag("<Notch> !echo Hello World!")
   * //=> true
   */
  startsWithNametag: (rest: string): boolean => {
    return rest.startsWith("<");
  },
  /**
   * @example isCommand("!echo Hello World!")
   * //=> true
   * @example isCommand("Hello World!")
   * //=> false
   * @example isCommand("!")
   * //=> false
   */
  isCommand: (message: string): boolean => {
    return message.startsWith("!") && message.length > 1;
    // str.length > 1 is to prevent a single "!" from being considered a command.
  },
};
const get = {
  /**
   * @example nametag("<Notch> !echo Hello World!")
   * //=> "Notch"
   */
  nametag: (rest: string): string => {
    const nametagStart = rest.indexOf("<");
    const nametagEnd = rest.indexOf(">");

    const playername = rest.substring(nametagStart + 1, nametagEnd);

    return playername;
  },
  /**
   * @example message("<Notch> !echo Hello World!")
   * //=> "!echo Hello World!"
   */
  message: (rest: string): string => {
    const nametagEnd = rest.indexOf(">");
    const message = rest.substring(nametagEnd + 2).trim();

    return message;
  },
  /**
   * @example commandName("!echo Hello World!")
   * //=> "echo"
   */
  commandName: (message: string): string => {
    const command = message.substring(1).split(" ")[0];
    return command;
  },
  /**
   * @example commandArgs("!echo Hello World!")
   * //=> ["Hello", "World!"]
   */
  commandArgs: (message: string): string[] => {
    const words = message.split(" ");
    const _commandName = words.shift()!;
    const args = words;
    return args;
  },
};

export { check, get };
