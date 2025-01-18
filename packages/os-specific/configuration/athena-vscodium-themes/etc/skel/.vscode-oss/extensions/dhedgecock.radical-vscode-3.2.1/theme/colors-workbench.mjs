/**
 * Radical Theme Color Variables
 *
 * Theming with color variables should be handled by element groups. For example the
 * background value shouldn't be set individually for each option, instead theme
 * elements like 'Wells' should be identified, the variables for those elements
 * assigned here, and then the element theming variables should be used throughout
 * the theme, eg: `$wellBackground`.
 *
 * Ideally it should be possible to see the overall theming for everything in this
 * file and only this file would be updated when changing theme color values.
 *
 * Theme Reference: https://code.visualstudio.com/docs/getstarted/theme-color-reference
 * Typings: https://github.com/Microsoft/vscode/blob/main/src/vs/platform/theme/common/colorRegistry.ts
 */

/* eslint-disable no-unused-vars */

import { alpha } from './utils.mjs'

//
// Theme colors
//

// --- Theme colors

const PRIMARY = '#ff428e'
const SECONDARY = '#a8ffef'
const PRIMARY_HOVER = '#ff6ba6'
const SECONDARY_HOVER = '#baffec'

const ULTRA = '#f52277'

// --- Grays

const GRAY_100 = '#94b4c4'

// --- Purples

const PURPLE_100 = '#070a91'
const PURPLE_200 = '#1D1E7D'
const PURPLE_300 = '#242560'
const PURPLE_400 = '#262b4b'

// --- Blues

const BLUE_50 = '#EAFEFA'
const BLUE_100 = '#d0fff4'
const BLUE_125 = '#c9fdf1'
const BLUE_XXX = '#A8D2D4'
const BLUE_175 = '#90b0b3'
const BLUE_200 = '#7c9c9e'
const BLUE_250 = '#415e6c'

// --- Backgrounds

const ULTRA_BACKGROUND = '#100f1a' // (16, 15, 26)
const DARK_BACKGROUND = '#12111f' // (18, 17, 31)
const PRIMARY_BACKGROUND = '#141322' // (20, 19, 34)
const LIGHT_BACKGROUND = '#1c1a30' // (28, 26, 48)
const ANOTHER_BACKGROUND = '#1a1b46'

// Semi-transparent widget background
const BACKGROUND_WIDGET = alpha(PURPLE_400, 0.9)
// Drag and drop background for theme, used primarily in list views
const BACKGROUND_DRAG_DROP = alpha(PRIMARY, 0.6)

// --- Borders

const BORDERS = {
  100: '#1A1B46',
  200: '#242560',
  300: '#1D1E7D',
  400: '#8C2C56',
  500: '#FC0065',
}

const MITO_PURPLE_HOVER = '#222745'
const VSCODE_PURPLE = '#602976'
const VSCODE_PURPLE_HOVER = '#913eb4'
const RADVENDER = '#864df8'
const INLAYS = '#ff42b788'

const CORAL = '#fe6083'

const HUE_TEAL = '#78efc5'
const HUE_PURPLE = '#d043cf'

// --- Highlighting

const HIGHLIGHT_CURRENT_LINE = '#d043cf'
const HIGHLIGHT_RANGE = '#fd43cd'
const HIGHLIGHT_CURRENT_SELECTION = '#874df8'
const HIGHLIGHT_CURRENT_SELECTION_MATCH_BORDER = '#6e45c7'
const HIGHLIGHT_MATCH = '#9736c0'
const HIGHLIGHT_ADDL_MATCH = '#f179e1'
const HIGHLIGHT_READ_ACCESS = '#ff5300'
const HIGHLIGHT_WRITE_ACCESS = '#efe900'

// --- Git colors

const DIFF_ADDED = '#43fdd5'
const DIFF_REMOVED = '#fe6082'
const MERGE_CURRENT = '#fc86fe'
const MERGE_INCOMING = '#008fe9'
const MERGE_COMMON = '#ffd000'

const GIT_ADDED = '#a3ff57'
const GIT_MODIFIED = '#ffb000'
const GIT_DELETED = '#ff427b'
const GIT_UNTRACKED = '#c8ff00'
const GIT_IGNORED = '#415e6c'
const GIT_CONFLICTING = '#ff428a'
const GIT_SUBMODULE = '#cc6796'

// --- Status colors

const INFO = '#93E0E3'
const WARNING = '#ffd000'
const ERROR = '#ff1767'

// Transparent
const TRANSPARENT = '#0000'

// Shadows are show by items that are scrolled and under widgets
const SHADOW = alpha(PRIMARY, 0.5)

// VSCode Radical theme 🎉
// ---------------------------------------------------------------------------

/**
 * ℹ️ Editor hieararchy
 * - Elevations set editor heiararchy with 3 progressively lighter colors for
 *   different sections:
 *    1. ULTRA - Darkest background for the title bar and activity bar
 *    2. DARK - Middle background for sidebar, tabs/breadcrumbs and status bar
 *    3. PRIMARY - Lightest background for the editor and panel
 */

//
// High contrast
//

// This theme is not high contrast
const contrast = {
  contrastActiveBorder: null,
  contrastBorder: null,
}

//
// Base colors
//

const base = {
  'focusBorder': TRANSPARENT, // Default to not showing focus borders
  'foreground': BLUE_200,
  'widget.shadow': SHADOW,
  // Background for text selection inside of inputs and textareas
  // (Type into the find input and then select some text)
  'selection.background': alpha(HUE_TEAL, 0.1),
  // Incoming/Current merge conflict labels use this
  'descriptionForeground': INFO,
  // Repro: Search for something with no matches using the find widget
  'errorForeground': ERROR,
}

//
// Text
//

const text = {
  'textBlockQuote.background': PURPLE_300,
  'textBlockQuote.border': BLUE_200,
  // Only showing inside of hover widget for code snippets (eg hover over chroma.hex())
  // It would be awesome if this showed inside READMEs code blocks...
  'textCodeBlock.background': VSCODE_PURPLE,
  // Includes link hover state
  'textLink.foreground': SECONDARY,
  'textLink.activeForeground': SECONDARY_HOVER,
  // Monospace font texts
  'textPreformat.foreground': PRIMARY,
  'textSeparator.foreground': null, // unknown
}

//
// Buttons
//

// Same as badges, but with hover
const button = {
  'button.background': PRIMARY,
  'button.foreground': BLUE_50,
  'button.hoverBackground': ULTRA,
  // 'button.secondaryForeground',
  // 'button.secondaryBackground',
  // 'button.secondaryHoverBackground',
  // 'checkbox.background'
  // 'checkbox.foreground'
  // 'checkbox.border'
}

//
// Dropdowns
//

const dropdown = {
  'dropdown.background': ANOTHER_BACKGROUND,
  'dropdown.listBackground': BACKGROUND_WIDGET,
  'dropdown.foreground': BLUE_175,
  'dropdown.border': BORDERS[200],
}

//
// Scroll bar controls
//

const scrollBarControl = {
  'scrollbar.shadow': SHADOW,
  // Scroll bar is primary with decreasing opacity
  'scrollbarSlider.background': alpha(PRIMARY, 0.1),
  'scrollbarSlider.hoverBackground': alpha(PRIMARY, 0.25),
  'scrollbarSlider.activeBackground': alpha(PRIMARY, 0.4),
}

//
// Badges
//

// Same as buttons
const badge = {
  'badge.background': ULTRA,
  'badge.foreground': BLUE_100,
}

//
// Progress bar
//

const progressBar = {
  'progressBar.background': VSCODE_PURPLE,
}

//
// Lists and trees
//

const listsTrees = {
  // Mouse hover
  'list.hoverBackground': alpha(PRIMARY, 0.05),
  'list.hoverForeground': BLUE_200,
  // Keyboard focus - using slightly higher alpha to make selection more obvious,
  // this helps UX for things like project and command dropdown selection with
  // the keyboard
  'list.focusBackground': alpha(PRIMARY, 0.2),
  'list.focusForeground': SECONDARY,
  // Selected item when the list container is in focus
  'list.activeSelectionBackground': alpha(PRIMARY, 0.1),
  'list.activeSelectionForeground': SECONDARY,
  // Selected item when the list container is NOT in focus. (Currently assuming
  // this really only applies to file explorer view, where having the last file
  // that was selected have a background is distracting, especially if you don't
  // have VSCode focus the file you're viewing when you change files)
  'list.inactiveSelectionBackground': DARK_BACKGROUND,
  'list.inactiveSelectionForeground': SECONDARY,
  // Focused item when the list container is NOT in focus
  'list.inactiveFocusBackground': null, // unknown
  // Drag and drop background, shows when you hover a drag item over a droppable area
  'list.dropBackground': BACKGROUND_DRAG_DROP,
  // The text that matches a search term inside of lists
  'list.highlightForeground': SECONDARY,
  'list.errorForeground': ERROR,
  'list.warningForeground': WARNING,
  'list.invalidItemForeground': null,

  // Vertical lines in tree view shown for open directories
  'tree.indentGuidesStroke': BORDERS[200],
}

//
// Inputs
//

const input = {
  'input.background': LIGHT_BACKGROUND,
  'input.border': BORDERS[200],
  'input.foreground': BLUE_200,
  'input.placeholderForeground': BLUE_200,
  // The controls inside of the input for setting search constraints
  'inputOption.activeBorder': BORDERS[400],
  'inputOption.activeBackground': alpha(PRIMARY, 0.15),
  'inputValidation.errorBackground': ERROR,
  'inputValidation.errorBorder': ERROR,
  'inputValidation.infoBackground': INFO,
  'inputValidation.infoBorder': INFO,
  'inputValidation.warningBackground': WARNING,
  'inputValidation.warningBorder': WARNING,
}

// ========================================================
// Editor, Editor Groups and Editor Tabs
// ========================================================

// Editor groups contain editor instances, and each editor instance is
// represented by a tab
const editorGroup = {
  // Border applies to multiple editor groups
  'editorGroup.border': BORDERS[200],
  'editorGroup.dropBackground': BACKGROUND_DRAG_DROP,
  // When all tabs are closed the editorGroup is empty, you would see this on
  // opening VSCode without a previous project, eg cmd+shift+n
  'editorGroup.emptyBackground': null,
  'editorGroup.focusedEmptyBorder': TRANSPARENT,
  // If you're not using tabs, show regular background, can't think of a better
  // color for that display
  'editorGroupHeader.noTabsBackground': null,
  'editorGroupHeader.tabsBackground': DARK_BACKGROUND,
  'editorGroupHeader.tabsBorder': BORDERS[200],
  'editorGroupHeader.border': BORDERS[100],
}

// Editor tabs
const tab = {
  // Border is *between* tabs, set to background so there isn't a border
  'tab.border': DARK_BACKGROUND,
  'tab.activeBorder': TRANSPARENT,
  'tab.activeBorderTop': BORDERS[500],
  'tab.activeBackground': DARK_BACKGROUND,
  'tab.activeForeground': BLUE_125,
  'tab.inactiveBackground': DARK_BACKGROUND,
  'tab.inactiveForeground': BLUE_175,
  // --- Hover
  'tab.hoverBackground': null,
  'tab.hoverBorder': BLUE_250,
  // --- Unfocused editor group tabs
  // default styles slightly darken tab colors and look good 👍
  'tab.unfocusedActiveBorder': null,
  'tab.unfocusedActiveBorderTop': null,
  'tab.unfocusedActiveForeground': null,
  'tab.unfocusedHoverBackground': null,
  'tab.unfocusedHoverBorder': null,
  'tab.unfocusedInactiveForeground': null,
}

const editor = {
  'editor.background': PRIMARY_BACKGROUND,
  // The editor default foreground shows up in widgets, is the color of the
  // separators in merge conflicts
  'editor.foreground': GRAY_100,

  // --- Line number colors
  'editorLineNumber.foreground': BLUE_250,
  'editorLineNumber.activeForeground': BLUE_100,

  // Editor highlighting (#highlighting)
  // ------------------------------------
  // Highlighting is not exclusive, the highlighting features often overlay each
  // other.

  // --- Current line (#current_line_highlight)
  // nb: Current line is highlighted only when cursor focus is on that line, so
  // actions like switching to find widget removes current line highlight. The
  // highlight is also removed when making a selection.
  'editor.lineHighlightBackground': alpha(HIGHLIGHT_CURRENT_LINE, 0.07),
  'editor.lineHighlightBorder': TRANSPARENT, // ETOOMUCHBORDER

  // --- Range highlight (#current_range_highlight)
  // Highlights ranges of current matches, including the currently selected
  // match for find and currently selected symbol in Go to symbol. No border
  // because range highlight can match multiple lines for go to symbol and each
  // line gets a border ETOOMUCHCOLOR
  'editor.rangeHighlightBackground': alpha(HIGHLIGHT_RANGE, 0.07),
  'editor.rangeHighlightBorder': TRANSPARENT, // ETOOMUCHBORDER

  // --- Current selection (#current_selection_highlight)
  // nb: The additional matches of the current selection highlight border is an
  // opaque color because it is frequently overlain by the symbol access borders
  // and using an opaque color provides a better base for multiple highlights
  'editor.selectionBackground': alpha(HIGHLIGHT_CURRENT_SELECTION, 0.3),
  'editor.selectionForeground': null, // For high contrast themes
  'editor.inactiveSelectionBackground': null, // Default opacity adjust is 👍
  // Themes highlight of text matching the current selection, include a border
  // to make matches more obvious b/c they're frequently important!
  'editor.selectionHighlightBackground': alpha(HIGHLIGHT_CURRENT_SELECTION, 0.1),
  'editor.selectionHighlightBorder': HIGHLIGHT_CURRENT_SELECTION_MATCH_BORDER,

  // --- Find (#find_highlight)
  // The find editor widget and find panel both use these values, and can both
  // appear at the same time for different searches. The `findMatch` is the
  // currently selected find match, which is automatically selected when using
  // the find widget, but must actively be selected when using the find panel.
  'editor.findMatchBackground': TRANSPARENT,
  'editor.findMatchBorder': alpha(HIGHLIGHT_MATCH, 0.55),
  'editor.findMatchHighlightBackground': TRANSPARENT,
  'editor.findMatchHighlightBorder': alpha(HIGHLIGHT_ADDL_MATCH, 0.8),
  // (select text and type alt+cmd+L to toggle)
  'editor.findRangeHighlightBackground': alpha(HIGHLIGHT_RANGE, 0.07),
  'editor.findRangeHighlightBorder': null, // ETOOMUCHBORDER

  // --- Symbol access (#symbol_access_highlight)
  // Symbol (and word) access highlighting is shown when the cursor is inside a
  // symbol (although this seems to be mistakenly removed when keyboard is
  // used inside word).
  // nb: highlight is with opacity, this highlight shows up fairly often for
  // mouse users and overlays the other highights. Stronger theming adds a lot
  // of noise to the editor (overlays current line, current selection and find
  // highlights)
  'editor.wordHighlightBackground': alpha(HIGHLIGHT_READ_ACCESS, 0.05),
  'editor.wordHighlightBorder': alpha(HIGHLIGHT_READ_ACCESS, 0.25),
  'editor.wordHighlightStrongBackground': alpha(HIGHLIGHT_WRITE_ACCESS, 0.05),
  'editor.wordHighlightStrongBorder': alpha(HIGHLIGHT_WRITE_ACCESS, 0.25),

  // -- Symbol hover (#symbol_hover_highlight)
  // Highlights a symbol when hovering over it for intellisense
  'editor.hoverHighlightBackground': alpha(HIGHLIGHT_RANGE, 0.25),

  // Editor decorations
  // ------------------------------------

  // --- Editor cursor
  // Cursor: background styles the text underneath the cursor, which we leave as
  // is so regular token colors are applied. Foreground styles the cursor line
  // and cursor background which is really confusing (aka these are flipped to
  // what you would guess they are)
  'editorCursor.background': null,
  'editorCursor.foreground': PRIMARY,

  // --- Editor links colors
  // Links are active when holding cmd on top of them, note that the hover
  // background also shows at this time. Using a bright teal to contrast more
  // with the translucent purple hover
  'editorLink.activeForeground': '#43fdd5',

  // --- Inlay hints
  'editorInlayHint.background': TRANSPARENT,
  'editorInlayHint.foreground': INLAYS,

  // --- Whitespace color
  'editorWhitespace.foreground': null, // Default gray color is muted enough 👍

  // --- Indent guides
  'editorIndentGuide.background': null, // Default gray color is muted enough 👍
  'editorIndentGuide.activeBackground': BACKGROUND_DRAG_DROP, // Mirror rulers

  // --- Ruler color
  'editorRuler.foreground': BACKGROUND_DRAG_DROP,

  // --- Code lens
  'editorCodeLens.foreground': alpha(HUE_PURPLE, 0.5),

  // --- Bracket match
  'editorBracketMatch.background': null,
  'editorBracketMatch.border': HUE_PURPLE,

  // --- Unused source code
  // (Ref: Create a fn with parameters that aren't used)
  // Dim opacity on unused code, but don't add a border as this is often done by
  // linters and we don't want to double up
  'editorUnnecessaryCode.border': null,
  'editorUnnecessaryCode.opacity': '#0000006e',

  // --- Gutter colors
  'editorGutter.background': null, // Defaults to editor bg
  'editorGutter.addedBackground': GIT_ADDED,
  'editorGutter.modifiedBackground': GIT_MODIFIED,
  'editorGutter.deletedBackground': GIT_DELETED,

  // --- Status decorations
  'editorError.foreground': ERROR,
  'editorError.border': null,
  'editorWarning.foreground': WARNING,
  'editorWarning.border': null,
  'editorInfo.foreground': INFO,
  'editorInfo.border': null,
  'editorHint.foreground': null, // unknown
  'editorHint.border': null,

  // --- Snippets
  // Decorations show anytime a snippet with tabstops is triggered
  'editor.snippetTabstopHighlightBackground': alpha(PRIMARY, 0.1),
  'editor.snippetTabstopHighlightBorder': VSCODE_PURPLE,
  'editor.snippetFinalTabstopHighlightBackground': alpha(PRIMARY, 0.1),
  'editor.snippetFinalTabstopHighlightBorder': RADVENDER,
}

// Overview ruler - located beneath scroll bar on right edge of editor and contains an
// overview of all editor decorations
const editorOverviewRuler = {
  'editorOverviewRuler.border': BORDERS[200],
  'editorOverviewRuler.findMatchForeground': null,
  'editorOverviewRuler.rangeHighlightForeground': null,
  'editorOverviewRuler.selectionHighlightForeground': null,
  'editorOverviewRuler.wordHighlightForeground': null,
  'editorOverviewRuler.wordHighlightStrongForeground': null,
  'editorOverviewRuler.bracketMatchForeground': null,
  // Status decorations (includes linter)
  'editorOverviewRuler.errorForeground': ERROR,
  'editorOverviewRuler.warningForeground': WARNING,
  'editorOverviewRuler.infoForeground': INFO,
  // Git decorations
  'editorOverviewRuler.modifiedForeground': GIT_MODIFIED,
  'editorOverviewRuler.addedForeground': GIT_ADDED,
  'editorOverviewRuler.deletedForeground': GIT_DELETED,
}

// Editor widgets
const editorWidget = {
  'editorWidget.background': BACKGROUND_WIDGET,
  'editorWidget.border': BLUE_200,
  'editorWidget.resizeBorder': PRIMARY_HOVER,
  // Suggest widget falls back to editor widget values which look good.
  'editorSuggestWidget.background': null,
  'editorSuggestWidget.border': null,
  'editorSuggestWidget.foreground': null,
  'editorSuggestWidget.highlightForeground': null,
  'editorSuggestWidget.selectedBackground': null,
  'editorHoverWidget.background': null,
  'editorHoverWidget.border': null,
  // Widget that shows when navigating between errors/warnings
  'editorMarkerNavigation.background': BACKGROUND_WIDGET,
  // These actually style the borders of the marker navigation
  'editorMarkerNavigationError.background': ERROR,
  'editorMarkerNavigationWarning.background': WARNING,
  'editorMarkerNavigationInfo.background': INFO,
}

// Minimap
const minimap = {
  // 'minimap.background': DARK_BACKGROUND,
  'minimap.findMatchHighlight': alpha(HIGHLIGHT_MATCH, 0.75),
  'minimapGutter.addedBackground': GIT_ADDED,
  'minimapGutter.modifiedBackground': GIT_MODIFIED,
  'minimapGutter.deletedBackground': GIT_DELETED,
}

//
// Peek View
//

const peekView = {
  'peekView.border': CORAL,
  'peekViewEditor.background': DARK_BACKGROUND,
  'peekViewEditorGutter.background': DARK_BACKGROUND,
  'peekViewEditor.matchHighlightBackground': alpha(CORAL, 0.15),
  'peekViewEditor.matchHighlightBorder': '#0000',
  'peekViewResult.background': DARK_BACKGROUND,
  'peekViewResult.fileForeground': BLUE_200,
  'peekViewResult.lineForeground': BLUE_200,

  // The background of all matches in the peek sidebar
  'peekViewResult.matchHighlightBackground': alpha(HIGHLIGHT_RANGE, 0.2),

  // The background and foreground color for the entire line of the current
  // match selection in the peek sidebar
  'peekViewResult.selectionBackground': alpha(HIGHLIGHT_RANGE, 0.1),
  'peekViewResult.selectionForeground': SECONDARY,

  'peekViewTitle.background': DARK_BACKGROUND,
  'peekViewTitleLabel.foreground': SECONDARY,
  'peekViewTitleDescription.foreground': BLUE_200,
}

//
// Activity Bar
//

const activityBar = {
  'activityBar.background': ULTRA_BACKGROUND,
  'activityBar.dropBackground': BACKGROUND_DRAG_DROP,
  'activityBar.border': BORDERS[400],
  'activityBar.foreground': ULTRA,
  'activityBar.inactiveForeground': alpha(ULTRA, 0.6),
  'activityBar.activeBorder': ULTRA,
  // Badges
  'activityBarBadge.background': badge['badge.background'],
  'activityBarBadge.foreground': badge['badge.foreground'],
}

//
// Panel
//

// Panels are shown below the editor area and contain views like Output and
// Integrated Terminal.
const panel = {
  'panel.background': PRIMARY_BACKGROUND,
  'panel.border': BORDERS[200],
  'panel.dropBackground': BACKGROUND_DRAG_DROP,
  // Panel title
  'panelTitle.activeBorder': PRIMARY,
  'panelTitle.activeForeground': BLUE_200,
  'panelTitle.inactiveForeground': BLUE_200,
}

//
// Sidebar
//

// Contains the Explore/Debug/Extension/etc. views
const sideBar = {
  'sideBar.background': DARK_BACKGROUND,
  'sideBar.foreground': BLUE_175,
  'sideBar.border': BORDERS[300],
  'sideBar.dropBackground': BACKGROUND_DRAG_DROP,
  // The title for the entire side bar, eg 'EXPLORER' or 'DEBUG'
  'sideBarTitle.foreground': BLUE_200,
  // Side bar sections for features
  'sideBarSectionHeader.background': DARK_BACKGROUND, // same bg for subtler headers
  'sideBarSectionHeader.foreground': BLUE_200,
  'sideBarSectionHeader.border': TRANSPARENT, // ?? Maybe add a color here ??
}

//
// Status Bar
//

// Bar at bottom of application with current statuses and info
const statusBar = {
  'statusBar.background': DARK_BACKGROUND,
  'statusBar.foreground': BLUE_200,
  'statusBar.border': BORDERS[200],
  // DEBUGGING MODE
  'statusBar.debuggingBackground': DARK_BACKGROUND,
  'statusBar.debuggingForeground': SECONDARY,
  'statusBar.debuggingBorder': PRIMARY,
  // NO FOLDER MODE
  'statusBar.noFolderBackground': PURPLE_300,
  'statusBar.noFolderForeground': BLUE_200,
  'statusBar.noFolderBorder': VSCODE_PURPLE,
  // ℹ️ You can only style the background of status bar items
  'statusBarItem.prominentBackground': VSCODE_PURPLE,
  'statusBarItem.prominentHoverBackground': VSCODE_PURPLE_HOVER,
  'statusBarItem.hoverBackground': alpha(RADVENDER, 0.2),
  'statusBarItem.activeBackground': VSCODE_PURPLE,
}

//
// Title Bar
//

// Bar at top of application with title of project
const titleBar = {
  'titleBar.activeBackground': ULTRA_BACKGROUND,
  'titleBar.activeForeground': ULTRA,
  'titleBar.border': BORDERS[400],
  // Title bar is slightly darkened on blur by default and looks good
  'titleBar.inactiveBackground': null,
  'titleBar.inactiveForeground': null,
}

//
// Menu bar
//

const menuBar = {
  'menubar.selectionForeground': null,
  'menubar.selectionBackground': null,
  'menubar.selectionBorder': null,
  'menu.foreground': null,
  'menu.background': null,
  'menu.selectionForeground': null,
  'menu.selectionBackground': null,
  'menu.selectionBorder': null,
}

//
// Extensions
//

const extension = {
  'extensionButton.prominentForeground': SECONDARY,
  'extensionButton.prominentBackground': PRIMARY,
  'extensionButton.prominentHoverBackground': PRIMARY_HOVER,
}

//
// Quick Input
//

const quickInput = {
  'pickerGroup.border': BORDERS[400],
  'pickerGroup.foreground': SECONDARY,
  // Add a fun widget background style to the quick input which opens on go to
  // file, go to symbol, etc.
  'quickInput.background': BACKGROUND_WIDGET,
  'quickInput.foreground': BLUE_175,
  // 'quickInputTitle.background' ???
  'quickInput.list.focusBackground': alpha(PRIMARY, 0.2),
}

//
// Git
//

const gitDecoration = {
  'gitDecoration.addedResourceForeground': GIT_ADDED,
  'gitDecoration.modifiedResourceForeground': GIT_MODIFIED,
  'gitDecoration.deletedResourceForeground': GIT_DELETED,
  'gitDecoration.untrackedResourceForeground': GIT_UNTRACKED,
  'gitDecoration.ignoredResourceForeground': GIT_IGNORED,
  'gitDecoration.conflictingResourceForeground': GIT_CONFLICTING,
  'gitDecoration.submoduleResourceForeground': GIT_SUBMODULE,
}

//
// Diff editor
//

const diffEditor = {
  // nb: diff borders get added to every line and are too noisy
  'diffEditor.insertedTextBackground': alpha(DIFF_ADDED, 0.09),
  'diffEditor.insertedTextBorder': null, // ETOOMUCHBORDER
  'diffEditor.removedTextBackground': alpha(DIFF_REMOVED, 0.09),
  'diffEditor.removedTextBorder': null, // ETOOMUCHBORDER
  'diffEditor.border': BORDERS[200],
}

//
// Merge conflicts
//

const mergeConflicts = {
  'merge.currentHeaderBackground': alpha(MERGE_CURRENT, 0.2),
  'merge.currentContentBackground': alpha(MERGE_CURRENT, 0.075),
  'merge.incomingHeaderBackground': alpha(MERGE_INCOMING, 0.2),
  'merge.incomingContentBackground': alpha(MERGE_INCOMING, 0.075),
  'merge.border': BORDERS[200],
  'merge.commonContentBackground': alpha(MERGE_COMMON, 0.075),
  'merge.commonHeaderBackground': alpha(MERGE_COMMON, 0.2),
  'editorOverviewRuler.currentContentForeground': alpha(MERGE_CURRENT, 0.3),
  'editorOverviewRuler.incomingContentForeground': alpha(MERGE_INCOMING, 0.3),
  'editorOverviewRuler.commonContentForeground': alpha(MERGE_COMMON, 0.3),
}

//
// Debug
//

const debug = {
  // --- Debug status toolbar
  'debugToolBar.background': alpha(PURPLE_300, 0.87),
  'debugToolBar.border': TRANSPARENT,

  // --- Breakpoint highlighting
  // Highlight shows on breakpoint stop line
  'editor.stackFrameHighlightBackground': alpha(HIGHLIGHT_READ_ACCESS, 0.12),
  // Highlight shows when selecting frame in stack trace after stopping on breakpoint
  'editor.focusedStackFrameHighlightBackground': alpha(HIGHLIGHT_WRITE_ACCESS, 0.1),

  // --- Debug exception widget
  // Shows when connected to a debug session and an exception is encounered
  'debugExceptionWidget.background': alpha(GIT_CONFLICTING, 0.45), // #ff428a73
  'debugExceptionWidget.border': ERROR,
}

//
// Welcome page
//

const welcomePage = {
  'welcomePage.buttonBackground': PURPLE_300,
  'welcomePage.buttonHoverBackground': MITO_PURPLE_HOVER,
  'walkThrough.embeddedEditorBackground': '#1e2732',
}

//
// Breadcrumbs
//

// By default breadcrumbs look good, they have the foreground gray with the
// alpha mito purple and primary accent colors
const breadcrumbs = {
  'breadcrumb.background': DARK_BACKGROUND,
  'breadcrumb.foreground': BLUE_250,
  // When a breadcrumb is hovered or focused with 'Focus breadcrumbs' command,
  // this will apply
  'breadcrumb.focusForeground': SECONDARY,
  // After a focused breadcrumb has been opened to show the picker, it is active
  // and this will apply
  'breadcrumb.activeSelectionForeground': SECONDARY,
  // Dropdown triggered when you click a breadcrum
  'breadcrumbPicker.background': BACKGROUND_WIDGET,
}

//
// Gitlens
//

const gitLens = {
  'gitlens.trailingLineBackgroundColor': null,
  'gitlens.trailingLineForegroundColor': '#F425FC59', // 35%
  'gitlens.lineHighlightBackgroundColor': '#F425FC26', // 20%
  'gitlens.lineHighlightOverviewRulerColor': '#F425FC80', // 50%
  'gitlens.gutterBackgroundColor': PRIMARY_BACKGROUND,
  'gitlens.gutterForegroundColor': '#c6d2d1',
  'gitlens.gutterUncommittedForegroundColor': '#85a5a0',
}

export default {
  ...activityBar,
  ...badge,
  ...base,
  ...button,
  ...contrast,
  ...diffEditor,
  ...dropdown,
  ...editor,
  ...editorGroup,
  ...editorOverviewRuler,
  ...editorWidget,
  ...minimap,
  ...extension,
  ...quickInput,
  ...gitDecoration,
  ...input,
  ...listsTrees,
  ...mergeConflicts,
  ...menuBar,
  ...panel,
  ...peekView,
  ...progressBar,
  ...scrollBarControl,
  ...sideBar,
  ...statusBar,
  ...tab,
  ...text,
  ...titleBar,
  ...debug,
  ...welcomePage,
  ...breadcrumbs,
  ...gitLens,
}

export { PRIMARY_BACKGROUND, BORDERS, PRIMARY }
