# VSCode theme implementation notes

## Patterns

- Use primary color to show hover/active focus and backgrounds. Use different
  levels of opacity to provide contrast.
- Use secondary color to show matching input values

## Lists and trees

- Includes file list view, individual notifications, autosuggest list, command
  suggest lists...
- Consider the different user flows that lists need to support when theming...
  Lists like the file explorer are usually interacted with mouse movements and
  may not need much theming, but lists like the project dropdown select are
  usually interacted with using they keyboard and need appropriate feedback for
  that.

## Notifications

_The slide up notifications in bottom left_

- The list of notifications seems to fall under the theming group of 'lists',
  theme values for list hover and selection are applied to indvidual
  notifications.
- The hover background for notifications is set by the 'list.hoverBackground'!

## Search behaviors

When using search, the first instance of a search match is highlighted, this is
the `findMatch` values. Additional instances of a search match are the
`findMatchHighlight` value.

When searching within a selection by selecting the lines icon or `alt+cmd+l` the
`findRangeHighlight` theming is applied to the entire selected range.

## Project manager extension

- The dropdown of available projects seems to have this issue: The text color
  inside the dropdown should be list.focusForeground when using keyboard to
  navigate the list, but it doesn't change.

## Non Mac elements

It appears the menu bar and dropdowns only shows in Windows/Linux?

## Unknowns

What these theme values impact isn't really known, they're left blank to try and
make them show themselves.

- selection.background
- descriptionForeground
- errorForeground
- textCodeBlock.background
- textSeparator.foreground
- list.inactiveFocusBackground
- editorHint.foreground
- editorUnnecessaryCode.border
