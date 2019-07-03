# VSCode setup used in the course

### Theme

I use the `Oceanic Next` theme with the dimmed bg option. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=naumovs.theme-oceanicnext)

### Extensions used in course videos

For each of the extensions, read the overview page in order to learn how to use it.

`Prettier` to automatically format code (there is a video in the course on how to set it up). [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

`ESLint` to automatically find errors in code (there is a video in the course on how to set it up). [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

`DotENV` to enable syntax highlighting for .env files. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv)

`Pug beautify` to automatically format Pug code. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=mrmlnc.vscode-pugbeautify)

`TODO Highlight` to highlight annotations in code. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight)

`Image previews` for previews on image hover and in the gutter. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=kisstkondoros.vscode-gutter-preview)

`TabNine` to autocomplete everything, code and text. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=TabNine.tabnine-vscode)

`Path Intellisense` to autocomplete filenames. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)

### Other extensions I use

`Bracket Pair Colorizer 2` to make it easy to find matching brackets. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer-2)

`Settings sync` to synchronize all your settings between computers. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync)

`Project Manager` to easily switch between projects. One of the most useful extensions. [Link &rarr;](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager)

### Terminal

To make your terminal as pretty as mine, you need to use a tool called `oh-my-zsh`. I followed [this tutorial &rarr;](https://www.freecodecamp.org/news/jazz-up-your-zsh-terminal-in-seven-steps-a-visual-guide-e81a8fd59a38/) to set it up.

### Settings

If you want your editor to work and look exactly the same way as mine does in the course videos, you can copy these settings to your own settings file (`settings.json`).

```
{
  "workbench.colorTheme": "Oceanic Next (dimmed bg)",
  "files.autoSave": "onFocusChange",
  "editor.formatOnSave": true,
  "editor.minimap.enabled": true,
  "workbench.statusBar.visible": true,
  "workbench.activityBar.visible": true,
  "editor.formatOnSave": false,
  "editor.wordWrap": "on",
  "editor.trimAutoWhitespace": false,
  "eslint.run": "onSave",

  "workbench.colorCustomizations": {
    "statusBar.background": "#333333",
    "statusBar.noFolderBackground": "#333333",
    "statusBar.debuggingBackground": "#263238"
  }
}
```
