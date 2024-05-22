<h1 align="center">Sudoku.click</h1>
<p align="center">
  <b>Ionic and Capacitor Sudoku implementation for Android and iOS platforms</b>
</p>
<br>

## About

This project was created for fun. I designed it using Ionic, targeting compilation for Android and iOS platforms. If you want to test it in a desktop browser, enable developer mode with mobile view.

<p align="center">
  <img src="https://raw.githubusercontent.com/damianpolak/sudoku-click2/refs/heads/master/.github/gfx/1.png">
  <img src="https://raw.githubusercontent.com/damianpolak/sudoku-click2/refs/heads/master/.github/gfx/2.png">
  <img src="https://raw.githubusercontent.com/damianpolak/sudoku-click2/refs/heads/master/.github/gfx/3.png">
  <img src="https://raw.githubusercontent.com/damianpolak/sudoku-click2/refs/heads/master/.github/gfx/4.png">
  <img src="https://raw.githubusercontent.com/damianpolak/sudoku-click2/refs/heads/master/.github/gfx/5.png">
  <img src="https://raw.githubusercontent.com/damianpolak/sudoku-click2/refs/heads/master/.github/gfx/6.png">
  <img src="https://raw.githubusercontent.com/damianpolak/sudoku-click2/refs/heads/master/.github/gfx/7.png">
</p>

## Usage

### Global installation:

```bash
npm install -g @ionic/cli
```

### Project installation:

```bash
npm install
ng serve --port 4210
```

### Compile

```bash
ionic build --platform android
npx cap sync
```

## Features to do:

- Multi-solutions (naive algorithm)
- ~~Hide status bar (Android - @capacitor/status-bar)~~
- ~~Create burst mode~~
- ~~Set default selected field when continuing a game~~
- ~~Disable animations when entering a number (only background change)~~
- ~~Create modal banner with animation for start, end, win, lose, restart messages~~
- Create a hint feature
- ~~Change "back" to "undo"~~
- ~~Implement chance usage~~
- Show incorrect numbers in cross-selection (red-tinted backgrounds)
- Change the background color of note numbers when selecting a number in the grid
- Change the background color of incorrect numbers in the highlighted area to red
- ~~Restart game~~
- Create and customize control icons
- Create a new native animation for control number buttons
- ~~Create a new native animation for number field clicks~~
- ~~Create new native animations for new game/continue and restart game~~
- ~~Create a new native square animation when filling all numbers~~
- Create a Sudoku.click logo and icons (AI?)
- ~~Create statistics/rank page~~
- ~~Change "continue" text~~
- ~~Create three additional themes (light and two custom)~~
- ~~Create a themes menu and an icon in the app header~~
- Create a Capacitor splash screen
- ~~Change color and background of numbered buttons when switching input mode (notes enabled/disabled)~~
- Increase font size on the app status bar (top info bar)
- Increase control icons and labels
- Create a preferences menu (done)
- ~~Create a haptics service~~
- ~~Create an audio service~~
- ~~Create a game finish menu~~
- ~~Implement a scoring feature~~
- ~~Handle mistakes and finish game accordingly~~
- Lock screen rotation on smartphones, enable it on tablets
- ~~Refactor animations, replace `setTimeout` with native animation delays~~
- Implement slot machine animation for time, score, and mistakes

## Refactoring:

- Move `level` class and types from `game-state.service.ts` to a dedicated file
- Move save storage from `game-state.service.ts` to a dedicated file
- ~~Change data saving from `localStorage` to Ionic Storage (or Capacitor Preferences)~~

## Bugs:

- Disable score counting when a wrong number is entered first and then corrected
- ~~Border color remains red when the first number is incorrect and the second is correct~~
- ~~No history when continuing a game~~
- ~~Sometimes, when clicking "back," a rotation animation appears~~ (fixed: implemented Ionic lifecycle instead of Angular lifecycle)
- Entering many incorrect values in one field and then undoing triggers an animation
- ~~Currently possible to enter a number in a field containing the correct or initial number~~
- ~~When restarting the app and continuing, the game level is set to Master~~
- Slow board response on iOS (cause: `ngOnChange` sets animations, too many checks)
- Notes/value input mode should reset after a new game, restart, or continue
- ~~When entering note numbers, clearing them, and then entering a number again, all notes reappear~~
- Animate note numbers when placed in a value number field
- "Back" doesn't work in burst mode or after burst mode
- ~~Incorrect color (black) on the finishing screen (should use `--ion-text-color`)~~

## Options section:

- Don't hide number buttons when all are used
- Option to enable/disable opacity or hide/visible numbered buttons when all available numbers have been used
- `fieldAnimation` ON/OFF (field.component)
- `boardAnimation` ON/OFF
- ~~pause `backdropDismiss` ON/OFF (pause.component)~~
- ~~Mistakes limit to 3 ON/OFF~~
- ~~Sounds ON/OFF~~
- ~~Haptics ON/OFF~~
- ~~Timer ON/OFF~~
- ~~Score ON/OFF~~
- ~~Mistakes ON/OFF~~

### Author

Damian Polak @ 2023-2024
