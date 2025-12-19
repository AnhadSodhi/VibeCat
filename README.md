# VibeCat 🐱

A fun VSCode extension that displays an animated GIF in a sidebar panel, with frames advancing on every keyboard input. Watch your vibing cat (or any GIF you choose) react to your coding!

![VibeCat Demo](assets/vibecat.gif)

## Features

- **Interactive GIF Display**: Shows GIF frames in a dedicated sidebar panel
- **Keyboard-Driven Animation**: Each keypress or cursor movement advances to the next frame
- **Custom GIF Support**: Use any GIF you want via the extension settings
- **Clean Interface**: Just the GIF, no clutter
- **Auto-Loop**: Seamlessly loops back to the first frame after the last
- **Hot Reload**: Automatically reloads when you change the custom GIF path

## Usage

1. Click the VibeCat icon in the Activity Bar to open the panel
2. Start typing or moving your cursor to see the animation advance
3. Each keyboard action shows the next frame of the GIF

## Extension Settings

This extension contributes the following settings:

* `vibecat.customGifPath`: Path to a custom GIF file. Can be:
  - Absolute path (e.g., `C:\Users\YourName\Pictures\mygif.gif`)
  - Relative path (relative to workspace root)
  - Leave empty to use the default VibeCat GIF

## How to Use Custom GIF

1. Open VSCode Settings (Ctrl+, or Cmd+,)
2. Search for "vibecat"
3. Enter the path to your GIF in "Custom Gif Path"
4. The extension will automatically reload with your GIF

## Requirements

No additional requirements or dependencies needed.

## Known Issues

None at this time. Please report any issues on the GitHub repository.

## Release Notes

### 0.0.1

Initial release of VibeCat!

- Display GIF frames in sidebar panel
- Advance frames on keyboard input
- Custom GIF support
- Settings hot reload

---

**Enjoy your vibing companion! 🐱**
