<h1 align="center">Sudoku.click</h1>
<p align="center">
  <b>Ionic and capacitor sudoku implementation for Android and iOS platform</b>
</p>
<br>

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

- Multisolutions (naive alghoritm)
- ~~Hide status bar (android - @capacitor/status bar)~~
- ~~Create burst mode~~
- ~~Set default selected field when continue game~~
- ~~Don't run animations when put number (only background)~~
- ~~Create modal banner with animation for start, end, win, lose, restart messages~~
- Create tip feature
- ~~Change back to undo~~
- ~~Implement chance used~~
- Show wrong numbers in cross selection (red tint backgrounds)
- ~~Restart game~~
- Create and change control icons for own custom
- Create new native animation on control number button
- ~~Create new native animation on number field click~~
- ~~Create new native animations for new game/continue, restart game~~
- ~~Create new native square animate when fill all numbers~~
- Create sudoku.click logo and icons
- ~~Create statistic/rank page~~
- ~~Change continue text~~
- ~~Create three additional themes (light and two custom)~~
- ~~Create themes menu and icon on app-header~~
- Create capacitor splash screen
- ~~Change color and background of numbered buttons when change input mode (notes enabled/disabled)~~
- Set larger font size on app-status-bar (top info bar)
- Set larger controls icons and labels
- Create preference menu
- Create a haptics service
- Create an audio service
- ~~Create finish game menu~~
- ~~Create scoring feature~~
- ~~Mistakes handling and finishing game~~
- Lock rotating screen on smartphones, enabled on tables
- ~~Refactor animations, replace setTimeout instead native animation delay~~
- time, score and mistakes slot machine animation

## Refactoring:

- Move level class and types from game-state.service.ts to dedicated file
- Move save storage from game-state.service.ts to dedicated file
- ~~Change data saving from localStorage to ionic storage (or capacitor preferences)~~

## Bugs:

- disable score counting when first type wrong number then type properly
- ~~Border color when first number was wrong and second propertly then border is red~~
- ~~No history when continue game~~
- ~~Sometimes when player click back then we can see rotate animation~~ (fixed: implemented ionic lifecycle instead angular)
- When put many wrong values in one field and back then it launch animation
- ~~Currently available type number in field where is properly or initial number~~
- ~~When restart application and continue then game level is set to master~~
- Slow board click on iOS (cause: ngOnChange set animations, a lot of checks)
- Notes/Value input mode should be cleared after new game, restart or continue
- ~~When put notes numbers and clear and put number again then all numbers back~~
- Put notes numbers on value number animate field
- Back doesn't work when burst mode and after burst
- ~~Wrong color (black) on finishing screen (should be --ion-text-color)~~

## Options section:

- Don't hide number buttons when all used
- Option for enable/disable opacity or hidden/visible numbered button when all available numbers have been used
- fieldAnimation ON/OFF (field.component)
- boardAnimation ON/OFF
- pause backdropDismiss ON/OFF (pause.component)
- mistakes limit to 3 ON/OFF
- sounds ON/OFF
- haptics ON/OFF
- timer ON/OFF
- score ON/OFF
- mistakes ON/OFF

### Author

Damian Polak @ 2023-2024
