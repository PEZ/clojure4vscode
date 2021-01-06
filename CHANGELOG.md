# Change Log

Changes to Calva.

## [Unreleased]
- Fix: [Dimming ignored forms does not work correctly with metadata](https://github.com/BetterThanTomorrow/calva/issues/908)
- [Make webpack create debug.js file for direct use with node](https://github.com/BetterThanTomorrow/calva/pull/935)

## [2.0.146 - 2021-01-04]
- Fix: [Slurp forward sometimes joins forms to one](https://github.com/BetterThanTomorrow/calva/issues/883)
- Fix: [clojure-lsp processes left running/orphaned if VS Code is closed while the lsp server is starting](https://github.com/BetterThanTomorrow/calva/issues/906)
- Fix: [go to definition jumps to inc instead of inc'](https://github.com/BetterThanTomorrow/calva/issues/884)
- Fix: [Error when start a REPL with jdk15](https://github.com/BetterThanTomorrow/calva/issues/888)

## [2.0.145 - 2021-01-03]
- [Add command for opening the file for the output/repl window namespace](https://github.com/BetterThanTomorrow/calva/issues/920)
- [Add setting for auto opening the repl window on Jack-in/Connect](https://github.com/BetterThanTomorrow/calva/issues/922)
- [Add setting for auto opening the Jack-in Terminal](https://github.com/BetterThanTomorrow/calva/issues/923)
- [Replace opening Calva says on start w/ info message box](https://github.com/BetterThanTomorrow/calva/issues/923)
- [Add command for opening Calva documentation](https://github.com/BetterThanTomorrow/calva/issues/923)
- [Change default keyboard shortcut for syncing the repl window ns to `ctrl+alt+c n`](https://github.com/BetterThanTomorrow/calva/issues/923)

## [2.0.144 - 2021-01-01]
- [Reactivate definitions/navigation in core and library files](https://github.com/BetterThanTomorrow/calva/issues/915)
- [Make load-file available in the output window](https://github.com/BetterThanTomorrow/calva/issues/910)
- [Make the ns in the repl prompt a peekable symbol](https://github.com/BetterThanTomorrow/calva/issues/904)

## [2.0.142 and 2.0.143 - 2020-12-30]
- No changes besides version number. Released due to vsix publishing issues.

## [2.0.141 - 2020-12-30]
- Update clojure-lsp to include [jar dependency navigation fix for Windows](https://github.com/clojure-lsp/clojure-lsp/issues/223)
- Fix: [clojure-lsp refactorings not working on Windows](https://github.com/BetterThanTomorrow/calva/issues/911)
- [Remove default key binding for toggling Calva key bindings](https://github.com/BetterThanTomorrow/calva/issues/815)

## [2.0.140 - 2020-12-28]
- [Make Jack-in dependency versions configurable (and bump 'em all with default settings)](https://github.com/BetterThanTomorrow/calva/pull/899)

## [2.0.139 - 2020-12-28]
- [Use Pseudo Terminal instead of Task for Jack-in](https://github.com/BetterThanTomorrow/calva/pull/654)
- [Prefer cider-nrepl symbol definitions over clojure-lsp](https://github.com/BetterThanTomorrow/calva/issues/897)
- [Enable clojure-lsp completion items when no nrepl connection](https://github.com/BetterThanTomorrow/calva/pull/898)

## [2.0.138 - 2020-12-27]
- [Bring in refactorings we get access to via clojure-lsp](https://github.com/BetterThanTomorrow/calva/issues/890)
- [Add ”clojure-lsp starting” progress indicator](https://github.com/BetterThanTomorrow/calva/issues/892)
- [Fix step into local dep with debugger](https://github.com/BetterThanTomorrow/calva/issues/893)

## [2.0.137 - 2020-12-24]
- [Bring in clojure-lsp](https://github.com/BetterThanTomorrow/calva/pull/572)

## [2.0.136 - 2020-12-23]
- Fix: [Jack-in/Connect prompts sometimes not showing on Windows](https://github.com/BetterThanTomorrow/calva/issues/885)

## [2.0.135 - 2020-12-20]
- [Binding keys to REPL functions, passing the namespace and cursor line (Notespace integration)](https://github.com/BetterThanTomorrow/calva/issues/863)
- [Make REPL prompt submit if the cursor is after the top level form](https://github.com/BetterThanTomorrow/calva/issues/875)
- [Only print stacktrace on demand](https://github.com/BetterThanTomorrow/calva/issues/878)

## [2.0.134 - 2020-12-05]
- Fix: [Live share jackout error](https://github.com/BetterThanTomorrow/calva/issues/856)
- Fix: [Cannot read property 'document' of undefined](https://github.com/BetterThanTomorrow/calva/issues/846)

## [2.0.133] - 2020-11-25
- Add [ns name deriving](https://github.com/BetterThanTomorrow/calva/issues/844)

## [2.0.132] - 2020-11-16
- Fix: [[Live Share] connecting to REPL as guest doesn't work in multi-project workspace](https://github.com/BetterThanTomorrow/calva/issues/831)

## [2.0.131] - 2020-11-05
- Fix: [Syntax highlighting error when repl prompt shows ns containing digits](https://github.com/BetterThanTomorrow/calva/issues/834)
- Fix: [Syntax highlighting errors with tokens at the start of a line](https://github.com/BetterThanTomorrow/calva/issues/835)
- Fix: [Various parsing issues](https://github.com/BetterThanTomorrow/calva/issues/802)

## [2.0.130] - 2020-10-25
- Fix: [Jack-in broken on Windows](https://github.com/BetterThanTomorrow/calva/issues/827)

## [2.0.129] - 2020-10-17
- [Improve stack trace output](https://github.com/BetterThanTomorrow/calva/pull/806)
- Fix: [Jack-in is broken for multi-project workspaces](https://github.com/BetterThanTomorrow/calva/issues/821)

## [2.0.128] - 2020-10-17
- Fix: [Jack-in is broken if live share extension is not installed](https://github.com/BetterThanTomorrow/calva/issues/821)

## [2.0.127] - 2020-10-17
- [Live Share Support](https://github.com/BetterThanTomorrow/calva/issues/803)

## [2.0.126] - 2020-10-11
- Fix: [Can't Jack-In to new Luminus template (+re-frame +shadow-cljs)](https://github.com/BetterThanTomorrow/calva/issues/777)
- Fix: [Wrong `(in-ns ...)` sent for files with `.bb` extension](https://github.com/BetterThanTomorrow/calva/issues/812)

## [no new version] - 2020-09-21
- [Move docs into repo](https://github.com/BetterThanTomorrow/calva/issues/788)

## [2.0.125] - 2020-09-20
- [Fix: evals should be ignored during parsing](https://github.com/BetterThanTomorrow/calva/issues/763)
- Fix: [Test runner can't find tests under cursor when using a custom test macro](https://github.com/BetterThanTomorrow/calva/issues/786)
- Fix: [Test runner output only partially commented](https://github.com/BetterThanTomorrow/calva/issues/787)
- [Allow toggling keyboard shortcuts](https://github.com/BetterThanTomorrow/calva/issues/784)

## [2.0.124] - 2020-08-31
- Re-fix: [Can't jack-in when no project file is open](https://github.com/BetterThanTomorrow/calva/issues/734)
- [Fix getDocument function to not return a Log document](https://github.com/BetterThanTomorrow/calva/issues/771)
- Fix: [Inline evaluation result disappears after a second](https://github.com/BetterThanTomorrow/calva/issues/774)

## [2.0.123] - 2020-08-26
- [Change output/repl window extension to .calva-repl](https://github.com/BetterThanTomorrow/calva/issues/754)
- Re-fix: [Interrupting evaluations produces extra output and no prompt](https://github.com/BetterThanTomorrow/calva/issues/738)
- [Fix/enhance test runner](https://github.com/BetterThanTomorrow/calva/issues/764)

## [2.0.122] - 2020-08-20
- Fix: [Can't jack-in when no project file is open](https://github.com/BetterThanTomorrow/calva/issues/734)
- Fix: [Fix stacktraces not showing in output](https://github.com/BetterThanTomorrow/calva/pull/759)

## [2.0.121] - 2020-08-19
- Fix: ["Go to definition" command fails](https://github.com/BetterThanTomorrow/calva/issues/636)
- Fix: [Weird expand selection behavior near an anonymous function](https://github.com/BetterThanTomorrow/calva/issues/600)
- Fix: [Backspace is not working properly in the output window](https://github.com/BetterThanTomorrow/calva/issues/700)
- Fix: [Cannot read property 'includes' of undefined](https://github.com/BetterThanTomorrow/calva/issues/753)

## [2.0.120] - 2020-08-17
- Fix: [Interrupting evaluations produces extra output and no prompt](https://github.com/BetterThanTomorrow/calva/issues/738)
- Add REPL history to new output/REPL window
- Fix: [Calva's ESC keybinding overrides VS Code's (useful) default](https://github.com/BetterThanTomorrow/calva/issues/740)

## [2.0.119] - 2020-08-07
- Really fix: [Accessing recent results (*1, *2, *3) does not work](https://github.com/BetterThanTomorrow/calva/issues/724)

## [2.0.118] - 2020-08-06
- [Remove old REPL Window](https://github.com/BetterThanTomorrow/calva/issues/711)

## [2.0.117] - 2020-08-05
- Fix: [Paste is broken in 2.0.116](https://github.com/BetterThanTomorrow/calva/issues/730)

## [2.0.116] - 2020-08-05
- Fix: [Format-on-paste should not operate inside string literals](https://github.com/BetterThanTomorrow/calva/issues/720)
- Fix: [Accessing recent results (*1, *2, *3) does not work](https://github.com/BetterThanTomorrow/calva/issues/724)

## [2.0.115] - 2020-08-02
- [Add hover to display results for eval as window into output file](https://github.com/BetterThanTomorrow/calva/issues/693)

## [2.0.114] - 2020-08-02
- Fix: [Stop popping up output window when load file has errors](https://github.com/BetterThanTomorrow/calva/issues/717)

## [2.0.113] - 2020-08-1
- [Add vscode command for to eval code given as args](https://github.com/BetterThanTomorrow/calva/issues/690)
- [Move custom REPL snippets to new output/repl window](https://github.com/BetterThanTomorrow/calva/issues/713)
- Fix: [Continuously evaluating in infinite loop](https://github.com/BetterThanTomorrow/calva/issues/712)

## [2.0.112] - 2020-07-30
- Fix: [Don't open output window until connect starts](https://github.com/BetterThanTomorrow/calva/issues/707)

## [2.0.111] - 2020-07-29
- [Handling ansi code by stripping it](https://github.com/BetterThanTomorrow/calva/issues/696)
- Fix: [Output window sometimes getting out of synch, needing overwrite](https://github.com/BetterThanTomorrow/calva/issues/699)
- Fix: [The *Calva says* panel + output window opening at startup gets a bit too much](https://github.com/BetterThanTomorrow/calva/issues/702)
- Fix: [Repl connection fails if afterCLJJackInCode errors](https://github.com/BetterThanTomorrow/calva/issues/703)

## [2.0.110] - 2020-07-28
- [Fix Connect Fails on Windows](https://github.com/BetterThanTomorrow/calva/issues/694)

## [2.0.109] - 2020-07-27
- [New output/REPL window introduced](https://github.com/BetterThanTomorrow/calva/issues/681)

## [2.0.108] - 2020-07-24
- Fix [Jack-in error when choosing Clojure CLI + shadow-cljs project type](https://github.com/BetterThanTomorrow/calva/issues/675)
- Fix [Cannot use default connect sequences when custom connect sequences added](https://github.com/BetterThanTomorrow/calva/issues/685)
- Add analytics to debugger

## [2.0.107] - 2020-06-16
- Fix [Flicker matching brackets as code is typed](https://github.com/BetterThanTomorrow/calva/issues/673)

## [2.0.106] - 2020-06-16
- Fix [Crash - Lexing fails on comment w/ a 20+ hashes](https://github.com/BetterThanTomorrow/calva/issues/667)

## [2.0.105] - 2020-06-15
- Fix [Debug decorations are breaking after stepping through code during debug session](https://github.com/BetterThanTomorrow/calva/issues/669)

## [2.0.104] - 2020-06-14
- Fix [File lexing fails on junk characters inside strings](https://github.com/BetterThanTomorrow/calva/issues/659)
- [Use Pseudo-terminal instead of Task for Jack-in](https://github.com/BetterThanTomorrow/calva/pull/654)

## [2.0.103] - 2020-06-05
- Fix [Stream output messages to Calva Says as they're received](https://github.com/BetterThanTomorrow/calva/issues/638)
- Fix [highlighting of var quote before open token](https://github.com/BetterThanTomorrow/calva/issues/663)

## [2.0.102] - 2020-06-04
- Fix [Format Document sometimes causes Calva to stop working](https://github.com/BetterThanTomorrow/calva/issues/651)
- Fix [repl hanging after disconnecting debugger while repl window focused](https://github.com/BetterThanTomorrow/calva/issues/647)
- [Use a pseudo terminal for Jack-in - and stop (ab)using the Tasks system for this](https://github.com/BetterThanTomorrow/calva/pull/654)

## [2.0.101] - 2020-05-11
- [Paredit slurp outer form if current form is nested](https://github.com/BetterThanTomorrow/calva/issues/554)

## [2.0.100] - 2020-05-11
- Fix [clj-kondo exceptions thrown by debugger decorations code](https://github.com/BetterThanTomorrow/calva/issues/642)
- Move [warning for clj-kondo not found on classpath](https://github.com/BetterThanTomorrow/calva/issues/639) to Calva says output channel instead of window warning

## [2.0.99] - 2020-05-10
- Fix [Formatting top-level form stopped working](https://github.com/BetterThanTomorrow/calva/issues/640)

## [2.0.98] - 2020-05-04
- Fix [Problems Editing a Bare file (instead of directory)](https://github.com/BetterThanTomorrow/calva/issues/622)

## [2.0.97] - 2020-05-02
- Fix: [The New Indent engine doesn't follow block rules in ns :require #633](https://github.com/BetterThanTomorrow/calva/issues/633)
- Make the new indent engine the default
- Remove dependency on `paredit.js` from `calva-lib`

## [2.0.96] - 2020-04-29
- [Fix colors in suggestion popup (REPL window)](https://github.com/BetterThanTomorrow/calva/issues/623)
- Add "Instrument Top Level Form for Debugging" command and decorations for instrumented functions
- [Remove duplicate paredit.selectOpenList command in package.json](https://github.com/BetterThanTomorrow/calva/issues/629)

## [2.0.95] - 2020-04-25
- [Separate setting for highlighting current indent guide](https://github.com/BetterThanTomorrow/calva/issues/625)
- [Fix: Problems with v2.0.94 rendering performance ](https://github.com/BetterThanTomorrow/calva/issues/626)

## [2.0.94] - 2020-04-24
- [Rainbow indent guides](https://github.com/BetterThanTomorrow/calva/issues/620)

## [2.0.93] - 2020-04-21
- [Unclutter editor context menu when not in clojure files](https://github.com/BetterThanTomorrow/calva/issues/615)

## [2.0.92] - 2020-04-15
- [Changed all documentation links from https://calva.readthedocs.io/ to https://calva.io/](https://github.com/BetterThanTomorrow/calva/issues/604)
- Add step over, step into, and step out debugger features
- Add annotations for debugging to show debug values as the cursor moves to each breakpoint
- Fix debugger disconnect to show quit value instead of cider-nrepl exception
- Use visible editor if one exists with code being debugged, instead of opening a new one

## [2.0.91] - 2020-04-07
- [Add debugger](https://github.com/BetterThanTomorrow/calva/issues/469)

## [2.0.90] - 2020-04-06
- nREPL `eval` should always send along the `ns` parameter

## [2.0.89] - 2020-03-29
- [Add support for connecting to generic project types](https://github.com/BetterThanTomorrow/calva/issues/595)

## [2.0.88] - 2020-03-22
- [Change all references to `#calva-dev` so that they now point to the `#calva` Slack channel](https://clojurians.slack.com/messages/calva/)

## [2.0.87] - 2020-03-21
- [Fix: Two CLJ REPL Windows open on connect when `afterCLJReplJackInCode`is used](https://github.com/BetterThanTomorrow/calva/issues/593)
- [Add info to docs about how to get around `command not found` Jack-in problems](https://github.com/BetterThanTomorrow/calva/issues/591)

## [2.0.86] - 2020-03-19
- [Fix: REPL Window Paredit does not close strings properly](https://github.com/BetterThanTomorrow/calva/issues/587)

## [2.0.85] - 2020-03-15
- Fix: Make lein-shadow project type use lein injections

## [2.0.84] - 2020-03-15
- [Support projects using lein-shadow](https://github.com/BetterThanTomorrow/calva/issues/585)
- [Add documentation for how to use Calva with Luminus](https://calva.io/luminus/)

## [2.0.83] - 2020-03-13
- When format config fails to parse, fall back on defaults rather than crash
- [Fix: Var quoted symbols are treated as reader tags](https://github.com/BetterThanTomorrow/calva/issues/584)

## [2.0.82] - 2020-03-11
- Fix bug with bad formatting defaults when no config file

## [2.0.81] - 2020-03-11
- [Fix: Structural editing is a bit broken when reader tags are involved](https://github.com/BetterThanTomorrow/calva/issues/581)
- [Add cljfmt indent rules](https://github.com/BetterThanTomorrow/calva/issues/80)

## [2.0.80] - 2020-03-07
- Fix so that Paredit treats symbols containing the quote character correctly.
- [Fix: Parameter hints popup should be off by default](https://github.com/BetterThanTomorrow/calva/issues/574)
- [Fix: `nil` followed by comma not highlighted correctly](https://github.com/BetterThanTomorrow/calva/issues/577)
- [Fix: The syntax highlightning fails with symbols named truesomething/falsesomething](https://github.com/BetterThanTomorrow/calva/issues/578)
- Fix so that Paredit does not consider `^` to be part of a symbol name.

## [2.0.79] - 2020-03-01
- Use scope `variable.other.constant` for keywords, making them highlight nicely
- [Highlight/parsing/etc: Data reader tags are part of the tagged form](https://github.com/BetterThanTomorrow/calva/issues/570)

## [2.0.78] - 2020-02-28
- [Improve structural navigation through unbalanced brackets](https://github.com/BetterThanTomorrow/calva/issues/524)
- [Fix lexer going into some weird state after lexing certain patterns](https://github.com/BetterThanTomorrow/calva/issues/566)

## [2.0.77] - 2020-02-23
- [Make rainbow parens and highlight use the same lexer as Paredit](https://github.com/BetterThanTomorrow/calva/issues/561)
- [Fix: Some character literals throws paredit out of whack](https://github.com/BetterThanTomorrow/calva/issues/563)
- [Fix: Initial expand selection sometimes fails](https://github.com/BetterThanTomorrow/calva/issues/549)
- [Change line comment characters to ;;](https://github.com/BetterThanTomorrow/calva/issues/564)
- [Use editor namespace for custom REPL commands w/o `ns` specified](https://github.com/BetterThanTomorrow/calva/issues/558)
- [Add support for comment continuation](https://github.com/BetterThanTomorrow/calva/issues/536)

## [2.0.76] - 2020-02-12
- [Fix Calva locking up when opening files with very long lines](https://github.com/BetterThanTomorrow/calva/issues/556)

## [2.0.75] - 2020-02-01
- [Support cljs-suitable JavaScript completion](https://github.com/BetterThanTomorrow/calva/issues/552)
- [Fix Printing to Calva REPL prints <repl#7> before each print out](https://github.com/BetterThanTomorrow/calva/issues/548)

## [2.0.74] - 2020-01-12
- [Fix Windows documentation for Evaluate current form](https://github.com/BetterThanTomorrow/calva/issues/533)
- [Fix repl-window history issue](https://github.com/BetterThanTomorrow/calva/issues/491)
- [Fix documentation for Calva jack-in with REBL and Leiningen](https://github.com/BetterThanTomorrow/calva/issues/542)

## [2.0.73] - 2019-12-25
- [Add Paredit drag up/down commands](https://github.com/BetterThanTomorrow/calva/issues/500)
- [Add Paredit drag forward up/backward down commands](https://github.com/BetterThanTomorrow/calva/issues/500)

## [2.0.72] - 2019-12-13
- [Deselect text after surrounding with parens/braces/etc](https://github.com/BetterThanTomorrow/calva/issues/511)
- Fix: [Strict mode backspace/delete not deleting unbalanced brackets](https://github.com/BetterThanTomorrow/calva/issues/501)

## [2.0.71] - 2019-12-13
- Fix: [Autocompletion in REPL window broken](https://github.com/BetterThanTomorrow/calva/issues/519)

## [2.0.70] - 2019-12-12
- Fix: [REPL Window not accepting keys like cursor, return, etcetera](https://github.com/BetterThanTomorrow/calva/issues/516)

## [2.0.69] - 2019-12-12
- Fix: [Prepare for Fix of Webview editor font size bug](https://github.com/microsoft/vscode/commit/7e2d7965e5d5728c53996f0024be9b0681369b2a)
- Fix: [REPL window font broken](https://github.com/BetterThanTomorrow/calva/issues/515)

## [2.0.68] - 2019-12-11
- Fix: [(read-line) is being called twice from the REPL Window](https://github.com/BetterThanTomorrow/calva/issues/509)
- Fix: [Font size if visibly bigger in the REPL window](https://github.com/BetterThanTomorrow/calva/issues/152)

## [2.0.67] - 2019-12-10
- [Use markdown to format doc strings in hover](https://github.com/BetterThanTomorrow/calva/pull/503)
- [Add setting to enable doc strings in parameter hints](https://github.com/BetterThanTomorrow/calva/pull/503)
- Fix: [Select Backward * commands won't grow selection in REPL window](https://github.com/BetterThanTomorrow/calva/issues/498)
- Fix: [Paredit select forward/backward add to the selection stack even when they don't select anything](https://github.com/BetterThanTomorrow/calva/issues/506)
- Fix: Calva disables cursor movement in non-clojure files when switching from REPL window to, say, a `.json` file.

## [2.0.66] - 2019-12-02
- Fix: [Cursor moves forward after undoing wraparound commands in REPL window](https://github.com/BetterThanTomorrow/calva/issues/499)
- Fix: Wrong keybinding for Toggle Paredit Mode, now is `ctrl+alt+p ctrl+alt+m`, as it should be
- Fix: [Force Delete Forward not working in REPL window in strict mode](https://github.com/BetterThanTomorrow/calva/issues/496)

## [2.0.65] - 2019-12-02
- [Make all Paredit selection commands shrinkable](https://www.reddit.com/r/Clojure/comments/e3zni2/a_paredit_visual_guide_calvas_paredit_docs/f9e7ujq/)
- Fix: [Raise Sexp/Form needs updated doc and shortcut keys](https://github.com/BetterThanTomorrow/calva/issues/495)

## [2.0.64] - 2019-12-01
- [Add Paredit commands **Push Form Left/right**](https://www.reddit.com/r/Clojure/comments/e3zni2/a_paredit_visual_guide_calvas_paredit_docs/f95v24w/)
- [Add Paredit command **Rewrap**](https://clojureverse.org/t/calva-paredit-just-got-majorly-better/5155/3)

## [2.0.63] - 2019-11-30
- Improve performance of editing Paredit commands
- Add command **Wrap Around ""**

## [2.0.62] - 2019-11-30
- Fix: [Tokenization errors with quotes, derefs, etcetera](https://github.com/BetterThanTomorrow/calva/issues/467)
- Fix: [Glitch in current form highlight in the REPL window when cursor is to the right of a form](https://github.com/BetterThanTomorrow/calva/issues/472)
- Now using the same Paredit implementation for the editor as for the REPL Window.
  - A much more complete set of Paredit commands, and [all documented](https://calva.io/paredit/), in beautiful GIF animations.
  - List based Paredit commands work on strings as well. (Limited by that strings don't have sub lists/strings).
  - Lots of fixes for Paredit commands.
- Fix: [Paredit not activated until focused moved from and back to the editor again](https://github.com/BetterThanTomorrow/calva/issues/454)
- Improving: [paredit `paredit-kill`](https://github.com/BetterThanTomorrow/calva/issues/380)
- Fix: [paredit `backspace` in strict mode](https://github.com/BetterThanTomorrow/calva/issues/379)
- Fix: [REPL window use it own set of paredit hotkeys and these are not configurable](https://github.com/BetterThanTomorrow/calva/issues/260)
- Add default keyboard shortcut maps for the REPL prompt: multi-line or single-line.
- Improvements for Commands using the **Current form** and **Current top level form**:
  - Fix: [Form selection fails on things like '(1)](https://github.com/BetterThanTomorrow/calva/issues/418)
  - Less precision needed for the right form to be selected.
  - All commands for this use the same implementation (so, you can use e.g. **Select Current Form** to know what **Evaluate Current Form** will evaluate).
- Fix: ["Load current Namespace in REPL Window" command not working](https://github.com/BetterThanTomorrow/calva/issues/477)
- Theme compatible status bar indicators for pprint and paredit

## [2.0.61] - 2019-11-15
- Fix: [paredit.deleteBackward sets cursor position wrong when deleting a line. ](https://github.com/BetterThanTomorrow/calva/issues/458)
- Fix: [Calva Highlight sometimes incorrectly recognizes form as a `comment` form](https://github.com/BetterThanTomorrow/calva/issues/403)
- Fix: [Expand selection fails at the start and end of the input of the REPL window](https://github.com/BetterThanTomorrow/calva/issues/417)
- [Add test message to test runner](https://github.com/BetterThanTomorrow/calva/issues/425)
- [Remove some paredit inconsistencies](https://github.com/BetterThanTomorrow/calva/issues/170)
- Fix: [Lexing regex literal tokenization](https://github.com/BetterThanTomorrow/calva/issues/463)

## [2.0.60] - 2019-11-11
- Re-enable default stylings for nREPL status bar items.
- Make `pprint` the default Pretty Printer.

## [2.0.59] - 2019-11-10
- [Enable information providers in jar files e.g. opened with the "Go to Definition" command](https://github.com/BetterThanTomorrow/calva/pull/455)
- [Make Pretty Printing more Configurable](https://github.com/BetterThanTomorrow/calva/pull/436)

## [2.0.58] - 2019-11-07
- [Incorrect red highlights around brackets/paren in specific case](https://github.com/BetterThanTomorrow/calva/issues/410)
- ["Require REPL Utilities" command is broken](https://github.com/BetterThanTomorrow/calva/issues/451)
- [Fix hover definition for symbols derefed with `@` and quoted symbols](https://github.com/BetterThanTomorrow/calva/issues/106)
- [Improve signature help-while-typing hover, with active arg markup](https://github.com/BetterThanTomorrow/calva/pull/450)

## [2.0.57] - 2019-11-03
- [Provide argument list help as you type the function's arguments](https://github.com/BetterThanTomorrow/calva/issues/361)
- [Support special forms in editor hover/completion](https://github.com/BetterThanTomorrow/calva/issues/441)

## [2.0.56] - 2019-11-02
- Add setting for wether to open REPL Window on connect or not
- [Re-open REPL windows where they were last closed](https://github.com/BetterThanTomorrow/calva/issues/300)
- Lexer performance considerably improved. Fixes [this](https://github.com/BetterThanTomorrow/calva/issues/228) and [this](https://github.com/BetterThanTomorrow/calva/issues/128))
- [REPL colours and logo a bit toned down](https://github.com/BetterThanTomorrow/calva/issues/303)
- Removed `useWSL`configuration option because the the use of Calva is fully supported through the [Remote - WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) extension.

## [2.0.55] - 2019-10-27
- [Add commands for interrupting the current evaluation as well as all running evaluations](https://github.com/BetterThanTomorrow/calva/issues/237)
- [Calva asks for user input when `stdin` needs it (e.g. `read-line`)](https://github.com/BetterThanTomorrow/calva/issues/377)
- Command for clearing the REPL history reworked and now also ”restarts” the REPL window.
- Commands are now added to REPL window history only if they are not identical to the previous command on the history stack.
- [Fix floating promises in evaluation module](https://github.com/BetterThanTomorrow/calva/issues/411)
- REPL Window Evaluation errors now initially hide the stack trace. The user can show it with a click.

## [2.0.54] - 2019-10-25
- [Stop linting, start bundling clj-kondo](https://github.com/BetterThanTomorrow/calva/issues/423)

## [2.0.53] - 2019-10-24
- [Fix hang when user input is requested](https://github.com/BetterThanTomorrow/calva/issues/377)
- Upgrade to `cider-nrepl 0.22.4`

## [2.0.52] - 2019-10-19
- [Add info box for VIM Extension users](https://github.com/BetterThanTomorrow/calva/issues/396)
- [Fix undefined namespace when starting a shadow-cljs cljs REPL Window ](https://github.com/BetterThanTomorrow/calva/issues/115)
- [Make opening the REPL window on connect async](https://github.com/BetterThanTomorrow/calva/issues/399)
- [Fix shadow-cljs menuSelections for Custom Connect Sequences](https://github.com/BetterThanTomorrow/calva/issues/404)

## [2.0.51] - 2019-10-15
- [Toggle the "Use WSL" setting requires extension restart to effect definition provider](https://github.com/BetterThanTomorrow/calva/issues/397)
- [Go to Definition and Peek Definition not working on Windows 10 when using WSL](https://github.com/BetterThanTomorrow/calva/issues/132)
- [Highlight extension settings are uninitialized if no closure editor active on activation ](https://github.com/BetterThanTomorrow/calva/issues/401)
- [Overly aggressive paredit in REPL window](https://github.com/BetterThanTomorrow/calva/issues/255)
- [REPL window use it own set of paredit hotkeys and these are not configurable](https://github.com/BetterThanTomorrow/calva/issues/260)
- [Completion in REPL window should work like in the editor](https://github.com/BetterThanTomorrow/calva/issues/394)

## [2.0.50] - 2019-10-15
- Move user documentation from the wiki to: https://calva.readthedocs.io/

## [2.0.49] - 2019-10-11
- [Fix bugs in comment form selection](https://github.com/BetterThanTomorrow/calva/issues/374)
- [Use of undeclared var in REPL window resets the namespace](https://github.com/BetterThanTomorrow/calva/issues/257)
- [Remove warning that extensions use the `vscode-resource:` scheme directly](https://github.com/BetterThanTomorrow/calva/issues/391)

## [2.0.48] - 2019-10-11
- [Support Jack-in without file open for single-rooted workspace](https://github.com/BetterThanTomorrow/calva/issues/366)
- [Show argument list of fn](https://github.com/BetterThanTomorrow/calva/issues/238)
- [Make code more robust in case Jack-in task fails](https://github.com/BetterThanTomorrow/calva/issues/367)
- [Fix dimming out of stacked ignored forms](https://github.com/BetterThanTomorrow/calva/issues/385)
- [The extension should specify the default schemes for document selectors](https://github.com/BetterThanTomorrow/calva/issues/368)

## [2.0.46] - 2019-10-08
- [Connect warnings and errors as popups](https://github.com/BetterThanTomorrow/calva/issues/356)
- [Don't remove default indents when Calva is not the auto-formatter](https://github.com/BetterThanTomorrow/calva/pull/383)

## [2.0.44] - 2019-10-05
- [Support for custom project/workflow commands](https://github.com/BetterThanTomorrow/calva/issues/281)

## [2.0.43] - 2019-10-03
- [Insourcing @tonsky's Clojure Warrior, now named Calva Highlight](https://github.com/BetterThanTomorrow/calva/pull/362)
- [Update status bar when configuration changed](https://github.com/BetterThanTomorrow/calva/issues/358)

## [2.0.42] - 2019-09-29
- [Adding selected calva commands to the editors context menu](https://github.com/BetterThanTomorrow/calva/issues/338)
- [Fix bug with painting all existing result decoration with the same status](https://github.com/BetterThanTomorrow/calva/issues/353)
- [Fix bug with reporting errors using off-by-one line and column numbers](https://github.com/BetterThanTomorrow/calva/issues/354)

## [2.0.41] - 2019-09-28
- [Add pretty print mode](https://github.com/BetterThanTomorrow/calva/issues/327)
- [Add command for evaluating top level form as comment](https://github.com/BetterThanTomorrow/calva/issues/349)
- [Stop writing results from **Evaluate to Comment** to output pane](https://github.com/BetterThanTomorrow/calva/issues/347)

## [2.0.40] - 2019-09-25
- [Add command for connecting to a non-project REPL](https://github.com/BetterThanTomorrow/calva/issues/328)
- [Add hover to inline result display, containing the full results](https://github.com/BetterThanTomorrow/calva/pull/336)
- [Better inline evaluation error reports with file context](https://github.com/BetterThanTomorrow/calva/issues/329)
- [Enhancement REPL window handling / nREPL menu button](https://github.com/BetterThanTomorrow/calva/issues/337)
- [Print async output, and a setting for where it should go](https://github.com/BetterThanTomorrow/calva/issues/218)
- [Fix REPL window prompt does not always reflect current ns](https://github.com/BetterThanTomorrow/calva/issues/280)
- [Escape HTML in stdout and stderr in REPL window](https://github.com/BetterThanTomorrow/calva/issues/321)
- [Add content security policy to webview and remove image load error](https://github.com/BetterThanTomorrow/calva/issues/341)

## [2.0.39] - 2019-09-20
- [Revert disconnecting and jacking out on closing of REPL window](https://github.com/BetterThanTomorrow/calva/issues/326)

## [2.0.38] - 2019-09-14
- [Close java processes when closing or reloading VS Code. (Windows)](https://github.com/BetterThanTomorrow/calva/issues/305)

## [2.0.37] - 2019-09-14
- [Support connecting to Leiningen and CLI project using shadow-cljs watcher](https://github.com/BetterThanTomorrow/calva/issues/314)
- Fix [Figwheel Main deps added to non-cljs projects](https://github.com/BetterThanTomorrow/calva/issues/317)

## [2.0.36] - 2019-09-12
- Fix [REPL Window namespace being reset to user](https://github.com/BetterThanTomorrow/calva/issues/302)
- Update nrepl-version to 0.22.1

## [2.0.35] - 2019-09-10
- [Customizing the REPL connect sequence](https://github.com/BetterThanTomorrow/calva/issues/282)
- [Support for launching with user aliases/profiles](https://github.com/BetterThanTomorrow/calva/issues/288)

## [2.0.34] - 2019-09-04
- More accurate code completion lookups.
- [Keep focus in editor when evaluating to the REPL Window](https://github.com/BetterThanTomorrow/calva/issues/229).

## [2.0.33] - 2019-08-17
- Support for starting leiningen and clj projects with aliases.

## [2.0.31] - 2019-08-13
- Support Jack-in and Connect in multi-project workspaces.
- Fix bug with snippet field navigation not working.

## [2.0.30] - 2019-08-04
- nREPL status bar indicator can now be styled

## [2.0.29] - 2019-08-04
- Fix jack-in command quoting for `zsh`.

## [2.0.28] - 2019-08-01
- Jack in quoting fixes, mainly for Windows with `clojure/clj`.
- Fix formatting bug when forms not separated by whitespace.

## [2.0.25] - 2019-07-12
- Add command for running test under cursor (at point in CIDER lingo).

## [2.0.24] - 2019-07-12
- Add ParEdit `forwardUpSexp`.

## [2.0.20] - 2019-06-20
- Improve custom CLJS REPL.

## [1.3.x -> 2.0.20] - -> 06.2019
... huge gap in the Changelog. Sorry about that, but now we have decided to pick up maintaining this log again.

## [1.3.0] - 2018-04-16
- Add support for [shadow-cljs](http://shadow-cljs.org). Please contact me with any information on how this is working for you out there.

## [1.2.14] - 2018-04-06
- Change all keyboard shortcuts to use prefix `ctrl+alt+v`, due to old prefix not working on some alternate keyboard layouts. See [Issue #9](https://github.com/PEZ/clojure4vscode/issues/9).

## [1.2.12] - 2018-04-06
- Add command for re-running previously failing tests (`ctrl+alt+v ctrl+t`).

## [1.2.10] - 2018-04-03
- Add command for toggling automatic adjustment of indentation for new lines (`ctrl+alt+v tab`)

## [1.2.8] - 2018-04-02
- Auto adjust indent more close to this Clojure Style Guide: https://github.com/bbatsov/clojure-style-guide

## [1.2.1] - 2018-03-28
- Select current (auto-detected) form

## [1.2.0] - 2018-03-28
- Terminal REPLs
  - Integrates REPL sessions from the Terminal tab and lets you do stuff like load current namespace ad evaluate code from the editor in the REPL.
- Connection and reconnection stabilization
  - Connecting the editor REPLs was a bit unstable. Now more stable (but there are still some quirks).

## [1.1.20] - 2018-03-25
- Auto detection of forms to evaluate now considers reader macro characters prepending the forms. E.g. before if you tried to evaluate say `#{:a :b :c}` with the cursor placed directly adjacent to the starting or ending curly braces only `{:a :b :c}` would be auto detected and evaluated.
- Highlighting of auto detected forms being evaluated.
- Rendering evaluation errors in the editor the same way as successful (but in red to quickly indicate that the evaluation errored).

![Evaluation demo](/assets/howto/evaluate.gif)

## [1.1.15] - 2018-03-20
- Evaluates vectors and maps with the same ”smart” selection as for lists.

## [1.1.11] - 2018-03-20
- Add inline annotations for interactive code evaluation results.

## [1.1.9] - 2018-03-18
- Add toggle for switching which repl connection is used for `cljc` files, `clj` or `cljs`.

![CLJC repl switching](/assets/howto/cljc-clj-cljs.gif)

- `clj` repl connected to all file types, meaning you can evaluate clojure code in, say, Markdown files.


## [1,1.3] - 2018-03-17
- User setting to evaluate namespace on save/open file (defaults to **on**)

## [1.1.1] - 2018-03-16
- Release of v1, based on **visual:clojure** v2.0, adding:
    - Running tests through the REPL connection, and mark them in the Problems tab
        - Run namespace tests: `ctrl+alt+v t`
        - Run all tests: `ctrl+alt+v a`
    - Evaluate code and replace it in the editor, inline: `ctrl+alt+v e`
    - Error message when evaluation fails
    - Pretty printing evaluation results: `ctrl+alt+v p`
    - Support for `cljc` files (this was supposed to be supported by the original extension, but bug)
