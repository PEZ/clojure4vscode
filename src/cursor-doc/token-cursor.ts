import { LineInputModel } from "./model";
import { Token, validPair } from "./clojure-lexer";


function tokenIsWhiteSpace(token: Token) {
    return token.type === 'eol' || token.type == 'ws';
}

/**
 * A mutable cursor into the token stream.
 */
export class TokenCursor {
    constructor(public doc: LineInputModel, public line: number, public token: number) {
    }

    /** Create a copy of this cursor. */
    clone() {
        return new TokenCursor(this.doc, this.line, this.token);
    }

    /**
     * Sets this TokenCursor state to the same as another.
     * @param cursor the cursor to copy state from.
     */
    set(cursor: TokenCursor) {
        this.doc = cursor.doc;
        this.line = cursor.line;
        this.token = cursor.token;
    }

    /** Return the position */
    get rowCol() {
        return [this.line, this.getToken().offset];
    }

    /** Return the offset at the start of the token */
    get offsetStart() {
        return this.doc.getOffsetForLine(this.line) + this.getToken().offset;
    }

    /** Return the offset at the end of the token */
    get offsetEnd() {
        return Math.min(this.doc.maxOffset, this.doc.getOffsetForLine(this.line) + this.getToken().offset + this.getToken().raw.length);
    }


    /** True if we are at the start of the document */
    atStart() {
        return this.token == 0 && this.line == 0;
    }

    /** True if we are at the end of the document */
    atEnd() {
        return this.line == this.doc.lines.length - 1 && this.token == this.doc.lines[this.line].tokens.length - 1;
    }

    /** Move this cursor backwards one token */
    previous() {
        if (this.token > 0) {
            this.token--;
        } else {
            if (this.line == 0) return;
            this.line--;
            this.token = this.doc.lines[this.line].tokens.length - 1;
        }
        return this;
    }

    /** Move this cursor forwards one token */
    next() {
        if (this.token < this.doc.lines[this.line].tokens.length - 1) {
            this.token++;
        } else {
            if (this.line == this.doc.lines.length - 1) return;
            this.line++;
            this.token = 0;
        }
        return this;
    }

    /**
     * Return the token immediately preceding this cursor. At the start of the file, a token of type "eol" is returned.
     */
    getPrevToken(): Token {
        if (this.line == 0 && this.token == 0)
            return { type: "eol", raw: "\n", offset: 0, state: null };
        let cursor = this.clone();
        cursor.previous();
        return cursor.getToken();
    }

    /**
     * Returns the token at this cursor position.
     */
    getToken() {
        return this.doc.lines[this.line].tokens[this.token];
    }

    equals(cursor: TokenCursor) {
        return this.line == cursor.line && this.token == cursor.token && this.doc == cursor.doc;
    }
}

/**
 * Implementation for cursor.rangesForSexpsInList and
 * cursor.rowColRangesForSexpsInList
 * Returns the ranges for all forms in the current list.
 * Returns undefined if the current cursor is not within a list.
 * If you are particular about which list type that should be considered, supply an `openingBracket`.
 */

function _rangesForSexpsInList(cursor: LispTokenCursor, useRowCol = false, openingBracket?: string):
    [number, number][] | [[number, number], [number, number]][] {
    if (openingBracket !== undefined) {
        if (!cursor.backwardListOfType(openingBracket)) {
            return undefined;
        }
    } else {
        if (!cursor.backwardList()) {
            return undefined;
        }
    }
    let ranges = [];
    // TODO: Figure out how to do this ignore skipping more generally in forward/backward this or that.
    let ignoreCounter = 0;
    while (true) {
        cursor.forwardWhitespace();
        const start = useRowCol ? cursor.rowCol : cursor.offsetStart;
        if (cursor.getToken().type === 'ignore') {
            ignoreCounter++;
            cursor.forwardSexp();
            continue;
        }
        if (cursor.forwardSexp()) {
            if (ignoreCounter === 0) {
                const end = useRowCol ? cursor.rowCol : cursor.offsetStart;
                ranges.push([start, end]);
            } else {
                ignoreCounter--;
            }
        } else {
            break;
        }
    }
    return ranges;
}

export class LispTokenCursor extends TokenCursor {

    constructor(public doc: LineInputModel, public line: number, public token: number) {
        super(doc, line, token);
    }

    /** Create a copy of this cursor. */
    clone() {
        return new LispTokenCursor(this.doc, this.line, this.token);
    }

    tokenBeginsMetadata(): boolean {
        return this.getToken().raw.endsWith('^{');
    }

    /**
     * Moves this token past any whitespace or comment.
     */
    forwardWhitespace(includeComments = true) {
        while (!this.atEnd()) {
            switch (this.getToken().type) {
                case "comment":
                case "prompt":
                    if (!includeComments) {
                        return;
                    }
                case "eol":
                case "ws":
                    this.next();
                    if (["comment", "prompt"].includes(this.getToken().type) && !includeComments) {
                        return;
                    }
                    continue;
                default:
                    return;
            }
        }
    }

    /**
     * Moves this token back past any whitespace or comment.
     */
    backwardWhitespace(includeComments = true) {
        while (!this.atStart()) {
            switch (this.getPrevToken().type) {
                case "comment":
                case "prompt":
                    if (!includeComments) {
                        return;
                    }
                case "eol":
                case "ws":
                    this.previous();
                    if (["comment", "prompt"].includes(this.getPrevToken().type) && !includeComments) {
                        return;
                    }
                    continue;
                default:
                    return;
            }
        }
    }

    // Lisp navigation commands begin here.

    // TODO: When f/b sexp, use the stack knowledge to ”flag” unbalance

    /**
     * Moves this token forward one s-expression at this level.
     * If the next non whitespace token is an open paren, skips past it's matching
     * close paren.
     *
     * If the next token is a form of closing paren, does not move.
     *
     * @returns true if the cursor was moved, false otherwise.
     */
    forwardSexp(skipComments = true, skipMetadata = false, skipIgnoredForms = false): boolean {
        // TODO: Consider using a proper bracket stack
        const stack = [];
        let isMetadata = false;
        this.forwardWhitespace(skipComments);
        if (this.getToken().type === 'close') {
            return false;
        }
        if (this.tokenBeginsMetadata()) {
            isMetadata = true;
        }
        while (!this.atEnd()) {
            this.forwardWhitespace(skipComments);
            const token = this.getToken();
            switch(token.type) {
                case 'comment':
                    this.next();
                    this.next();
                    break;
                case 'prompt':
                    this.next();
                    this.next();
                    break;
                case 'ignore':
                    if (skipIgnoredForms) {
                        this.next();
                        this.forwardSexp(skipComments, skipMetadata, skipIgnoredForms);
                        break;
                    }
                case 'id':
                case 'lit':
                case 'kw':
                case 'junk':
                case 'str-inside':
                    if (skipMetadata && this.getToken().raw.startsWith('^')) {
                        this.next();
                    } else {
                        this.next();
                        if (stack.length <= 0) {
                            return true;
                        }
                    }
                    break;
                case 'close':
                    const close = token.raw;
                    let open: string;
                    while (open = stack.pop()) {
                        if (validPair(open, close)) {
                            this.next();
                            break;
                        }
                    }
                    if (skipMetadata && isMetadata) {
                        this.forwardSexp(skipComments, skipMetadata);
                    }
                    if (stack.length <= 0) {
                        return true;
                    }
                    break;
                case 'open':
                    stack.push(token.raw);
                    this.next();
                    break;
                default:
                    this.next();
                    break;
            }
        }
    }

    /**
     * Moves this token backward one s-expression at this level.
     * If the previous non whitespace token is a close paren, skips past it's matching
     * open paren.
     *
     * If the previous token is a form of open paren, does not move.
     *
     * @returns true if the cursor was moved, false otherwise.
     */
    backwardSexp(skipComments = true) {
        let stack = [];
        this.backwardWhitespace(skipComments);
        if (this.getPrevToken().type === 'open') {
            return false;
        }
        while (!this.atStart()) {
            this.backwardWhitespace(skipComments);
            let tk = this.getPrevToken();
            switch (tk.type) {
                case 'id':
                case 'lit':
                case 'kw':
                case 'ignore':
                case 'junk':
                case 'comment':
                case 'prompt':
                case 'str-inside':
                    this.previous();
                    this.backwardThroughAnyReader();
                    if (stack.length <= 0)
                        return true;
                    break;
                case 'close':
                    stack.push(tk.raw);
                    this.previous();
                    break;
                case 'open':
                    const open = tk.raw;
                    let close: string;
                    while (close = stack.pop()) {
                        if (validPair(open, close)) {
                            break;
                        }
                    }
                    this.previous();
                    this.backwardThroughAnyReader();
                    if (stack.length <= 0)
                        return true;
                    break;
                default:
                    this.previous();
                    break;
            }
        }
    }

    /**
     * Moves this cursor past the previous non-ws token, if it is a `reader` token.
     * Otherwise, this cursor is left unaffected.
     */
    backwardThroughAnyReader() {
        const cursor = this.clone();
        while (true) {
            cursor.backwardWhitespace();
            if (cursor.getPrevToken().type === 'reader') {
                cursor.previous();
                this.set(cursor);
            } else {
                break;
            }
        }
    }

    /**
     * Moves this cursor past the next non-ws token, if it is a `reader` token.
     * Otherwise, this cursor is left unaffected.
     */
    forwardThroughAnyReader() {
        const cursor = this.clone();
        while (true) {
            cursor.forwardWhitespace();
            if (cursor.getToken().type === 'reader') {
                cursor.next();
                this.set(cursor);
            } else {
                break;
            }
        }
    }

    /**
     * Moves this cursor to the close paren of the containing sexpr, or until the end of the document.
     */
    forwardList(): boolean {
        let cursor = this.clone();
        while (cursor.forwardSexp()) { }
        if (cursor.getToken().type === "close") {
            this.set(cursor);
            return true;
        }
        return false;
    }

    /**
     * Moves this cursor forwards to the `closingBracket` of the containing sexpr, or until the end of the document.
     */
    forwardListOfType(closingBracket: string): boolean {
        let cursor = this.clone();
        while (cursor.forwardList()) {
            if (cursor.getPrevToken().raw === closingBracket) {
                this.set(cursor);
                return true;
            }
            if (!cursor.upList()) {
                return false;
            }
        }
    }

    /**
     * Moves this cursor backwards to the open paren of the containing sexpr, or until the start of the document.
     */
    backwardList(): boolean {
        let cursor = this.clone();
        while (cursor.backwardSexp()) { }
        if (cursor.getPrevToken().type == "open") {
            this.set(cursor);
            return true;
        }
        return false;
    }

    /**
     * Moves this cursor backwards to the `openingBracket` of the containing sexpr, or until the start of the document.
     */
    backwardListOfType(openingBracket: string): boolean {
        let cursor = this.clone();
        while (cursor.backwardList()) {
            if (cursor.getPrevToken().raw === openingBracket) {
                this.set(cursor);
                return true;
            }
            if (!cursor.backwardUpList()) {
                return false;
            }
        }
    }

    /**
     * Finds the range of the current list up to `depth`.
     * If you are particular about which type of list, supply the `openingBracket`.
     * @param openingBracket
     */
    rangeForList(depth: number, openingBracket?: string): [number, number] {
        const cursor = this.clone();
        let range: [number, number] = undefined;
        for (let i = 0; i < depth; i++) {
            if (openingBracket === undefined) {
                if (!(cursor.backwardList() && cursor.backwardUpList())) {
                    return range;
                }
            } else {
                if (!(cursor.backwardListOfType(openingBracket) && cursor.backwardUpList())) {
                    return range;
                }
            }
            const start = cursor.offsetStart;
            if (!cursor.forwardSexp()) {
                return range;
            }
            const end = cursor.offsetStart;
            range = [start, end];
        }
        return range;
    }

    /**
     * If possible, moves this cursor forwards past any whitespace, and then past the immediately following open-paren and returns true.
     * If the source does not match this, returns false and does not move the cursor.
     */
    downList(skipMetadata = false): boolean {
        let cursor = this.clone();
        cursor.forwardThroughAnyReader();
        cursor.forwardWhitespace();
        if (cursor.getToken().type === 'open') {
            if (skipMetadata) {
                while (cursor.tokenBeginsMetadata()) {
                    cursor.forwardSexp();
                    cursor.forwardWhitespace();
                }
            }
            cursor.next();
            this.set(cursor);
            return true;
        }
        return false;
    }

    /**
     * If possible, moves this cursor forwards past any whitespace, and then past the immediately following close-paren and returns true.
     * If the source does not match this, returns false and does not move the cursor.
     */
    upList(): boolean {
        let cursor = this.clone();
        cursor.forwardWhitespace();
        if (cursor.getToken().type == "close") {
            cursor.next();
            this.set(cursor);
            return true;
        }
        return false;
    }

    /**
     * If possible, moves this cursor backwards past any whitespace, and then backwards past the immediately following open-paren and returns true.
     * If the source does not match this, returns false and does not move the cursor.
     */
    backwardUpList(): boolean {
        let cursor = this.clone();
        cursor.backwardThroughAnyReader();
        cursor.backwardWhitespace();
        if (cursor.getPrevToken().type == "open") {
            cursor.previous();
            cursor.backwardThroughAnyReader();
            this.set(cursor);
            return true;
        }
        return false;
    }

    /**
     * If possible, moves this cursor backwards past any whitespace, and then backwards past the immediately following close-paren and returns true.
     * If the source does not match this, returns false and does not move the cursor.
     */
    backwardDownList(): boolean {
        let cursor = this.clone();
        cursor.backwardWhitespace();
        if (cursor.getPrevToken().type == "close") {
            cursor.previous();
            this.set(cursor);
            return true;
        }
        return false;
    }

    /**
     * Figures out the `range` for the current form according to this priority:
     * 0. If `offset` is within a symbol, literal or keyword
     * 1. Else, if `offset` is adjacent after form
     * 2. Else, if `offset` is adjacent before a form
     * 3. Else, if the previous form is on the same line
     * 4. Else, if the next form is on the same line
     * 5. Else, the previous form, if any
     * 6. Else, the next form, if any
     * 7. Else, the current enclosing form, if any
     * 8. Else, return `undefined`.
     * @param offset the current cursor (caret) offset in the document
     */
    rangeForCurrentForm(offset: number): [number, number] {
        if (['id', 'kw', 'lit', 'str-inside'].includes(this.getToken().type) && offset !== this.offsetStart) { // 0
            const cursor = this.clone();
            cursor.backwardThroughAnyReader();
            return [cursor.offsetStart, this.offsetEnd];
        }
        const afterCursor = this.clone();
        afterCursor.backwardWhitespace(true);
        if (afterCursor.offsetStart == offset && afterCursor.getPrevToken().type !== 'reader') {
            if (afterCursor.backwardSexp()) { // 1.
                return [afterCursor.offsetStart, offset];
            }
        }
        const beforeCursor = this.clone();
        beforeCursor.forwardThroughAnyReader();
        beforeCursor.forwardWhitespace(true);
        const readerCursor = beforeCursor.clone();
        readerCursor.backwardThroughAnyReader();
        if ((offset >= beforeCursor.offsetStart && offset <= beforeCursor.offsetEnd) || readerCursor.offsetStart !== beforeCursor.offsetStart) {
            if (beforeCursor.forwardSexp()) { // 2.
                return [readerCursor.offsetStart, beforeCursor.offsetStart];
            }
        }
        if (afterCursor.rowCol[0] === this.rowCol[0]) {
            const peekBehindBackwards = afterCursor.clone();
            if (peekBehindBackwards.backwardSexp()) { // 3.
                return [peekBehindBackwards.offsetStart, afterCursor.offsetStart];
            }
        }
        if (beforeCursor.rowCol[0] === this.rowCol[0]) {
            const peekPastForwards = beforeCursor.clone();
            if (peekPastForwards.forwardSexp()) { // 4.
                return [beforeCursor.offsetStart, peekPastForwards.offsetStart];
            }
        }
        const peekBehindBackwards = afterCursor.clone();
        if (peekBehindBackwards.backwardSexp()) { // 5.
            return [peekBehindBackwards.offsetStart, afterCursor.offsetStart];
        } else {
            const peekPastForwards = beforeCursor.clone();
            if (peekPastForwards.forwardSexp()) { // 6.
                return [beforeCursor.offsetStart, peekPastForwards.offsetStart];
            } else {
                const peekUp = this.clone();
                if (peekUp.upList()) {
                    const peekBehindUp = peekUp.clone();
                    if (peekBehindUp.backwardSexp()) {  // 7.
                        return [peekBehindUp.offsetStart, peekUp.offsetStart];
                    }
                }
            }
        }
        return undefined; // 8.
    }

    /**
     * Gets the range for the ”current” top level form, visiting forms from the cursor towards `offset`
     * With `commentCreatesTopLevel` as true (default): If the current top level form is a `(comment ...)`, consider it creating a new top level and continue the search.
     * @param offset The ”current” position
     * @param depth Controls if the cursor should consider `comment` top level (if > 0, it will not)
     * @param commentIsTopLevel? Controls
     */
    rangeForDefun(offset: number, depth = 0, commentCreatesTopLevel = true): [number, number] {
        let cursor = this.doc.getTokenCursor(offset);
        const [initialFormStart] = cursor.rangeForCurrentForm(offset);
        cursor = this.doc.getTokenCursor(initialFormStart);
        while (cursor.offsetEnd < offset && cursor.forwardSexp()) {}
        if (cursor.getToken().type === 'eol' && cursor.getPrevToken().raw !== ')') {
             return [offset, offset]
        }
        if (cursor.getPrevToken().raw === ')') {
            cursor.backwardSexp(); 
            cursor.downList();
        }
        // If comment block(s) should be treated as top-level and initial cursor was placed 
        // close to "comment" symbol, then we first perform "nested traveling down", potentially
        //  skipping any additional nested comment forms on the way).
        if (commentCreatesTopLevel) {
            let nearbyCommentSymbol : boolean;
            do {
                const [fl, fh] = cursor.getFunctionSexpRange();
                nearbyCommentSymbol = cursor.getFunctionName() === 'comment' && ((fl <= cursor.offsetStart && cursor.offsetStart <= fh) || cursor.getPrevToken().raw === 'comment');
                if (!nearbyCommentSymbol) {
                    break;
                }
                cursor = cursor.doc.getTokenCursor(fh);
                cursor.forwardWhitespace();
                if (cursor.getToken().raw === '(') {
                    cursor.downList();
                } else {
                    break;
                }
            } while (nearbyCommentSymbol)
        }
        // Keep navigating "forward up sexp" when possible. Always remember last visited "non-comment" cursor.
        // If comment form is reached on the way up, return that last visited non-comment form cursor..        
        let lastValidTopLevelFormCursor = cursor.clone();
        do {
            const currentFormIsComment = cursor.getFunctionName() === 'comment';
            lastValidTopLevelFormCursor = cursor.clone();
            cursor.forwardList();
            if (!cursor.upList()) {
                break;
            }
            if (commentCreatesTopLevel && currentFormIsComment) {
                return lastValidTopLevelFormCursor.rangeForCurrentForm(0);
            }
        } while (cursor.withinValidList());
        return cursor.rangeForCurrentForm(cursor.offsetStart);
    }

    rangesForTopLevelForms(): [number, number][] {
        const cursor = new LispTokenCursor(this.doc, 0, 0);
        let ranges: [number, number][] = [];
        while (cursor.forwardSexp()) {
            const end = cursor.offsetStart;
            cursor.backwardSexp();
            ranges.push([cursor.offsetStart, end]);
            cursor.forwardSexp();
        }
        return ranges;
    }

    isWhiteSpace(): boolean {
        return tokenIsWhiteSpace(this.getToken());
    }

    previousIsWhiteSpace(): boolean {
        return tokenIsWhiteSpace(this.getPrevToken());
    }

    withinWhiteSpace(): boolean {
        return this.isWhiteSpace() && this.previousIsWhiteSpace();
    }

    /**
     * Indicates if the current token is inside a string
     */
    withinString() {
        const cursor = this.clone();
        cursor.backwardList();
        if (cursor.getPrevToken().type === 'open' && cursor.getPrevToken().raw.endsWith('"')) {
            return true;
        };
        return false;
    }

    /**
     * Indicates if the current token is in a comment line
     */
    withinComment() {
        const cursor = this.clone();
        let isComment = cursor.getToken().type === 'comment' || cursor.getPrevToken().type === 'comment';
        if (!isComment && this.withinWhiteSpace()) {
            cursor.forwardWhitespace(false);
            isComment = cursor.getToken().type === 'comment';
            if (!isComment) {
                cursor.backwardWhitespace(false);
                isComment = cursor.getPrevToken().type === 'comment' && cursor.getToken().type !== 'eol';
            }
        }
        return isComment;
    }

    /**
     * Tells if the cursor is inside a properly closed list.
     */
    withinValidList(): boolean {
        let cursor = this.clone();
        while (cursor.forwardSexp()) { }
        return cursor.getToken().type == "close";
    }

    /**
     * Returns the rowCol ranges for all forms in the current list.
     * Returns undefined if the current cursor is not within a list.
     * If you are particular about which list type that should be considered, supply an `openingBracket`.
     */
    rowColRangesForSexpsInList(openingBracket?: string): [[number, number], [number, number]][] {
        let cursor = this.clone();
        return _rangesForSexpsInList(cursor, true, openingBracket) as [[number, number], [number, number]][];
    }

    /**
     * Returns the rowCol ranges for all forms in the current list.
     * Returns undefined if the current cursor is not within a list.
     * If you are particular about which list type that should be considered, supply an `openingBracket`.
     */
    rangesForSexpsInList(openingBracket?: string): [number, number][] {
        let cursor = this.clone();
        return _rangesForSexpsInList(cursor, false, openingBracket) as [number, number][];
    }

    /**
     * Tries to move this cursor backwards to the open paren of the function, `level` functions up.
     * If there aren't that many functions behind the cursor, the cursor is not moved at all.
     * @param levels how many functions up to go before placing the cursor at the start of it.
     * @returns `true` if the cursor was moved, otherwise `false`
     */
    backwardFunction(levels: number = 0): boolean {
        const cursor = this.clone();
        if (!cursor.backwardListOfType('(')) {
            return false;
        }
        for (let i = 0; i < levels; i++) {
            if (!cursor.backwardUpList()) {
                return false;
            }
            if (!cursor.backwardListOfType('(')) {
                return false;
            }
        }
        this.set(cursor);
        return true;
    }

    /**
     * Get the name of the current function, optionally digging `levels` functions up.
     * @param levels how many levels of functions to dig up.
     * @returns the function name, or undefined if there is no function there.
     */
    getFunctionName(levels: number = 0): string {
        const cursor = this.clone();
        if (cursor.backwardFunction(levels)) {
            cursor.forwardWhitespace();
            const symbol = cursor.getToken();
            if (symbol.type === 'id') {
                return symbol.raw;
            }
        }
    }

    /**
     * Get the range of the sexp that is in function position of the current list, optionally digging `levels` functions up.
     * @param levels how many levels of functions to dig up.
     * @returns the range of the function sexp/form, or undefined if there is no function there.
     */
    getFunctionSexpRange(levels: number = 0): [number, number] {
        const cursor = this.clone();
        if (cursor.backwardFunction(levels)) {
            cursor.forwardWhitespace();
            const start = cursor.offsetStart;
            cursor.forwardSexp(true, true, true);
            const end = cursor.offsetStart;
            return [start, end];
        }
        return [undefined, undefined];
    }
}

/**
 * Creates a `LispTokenCursor` for walking and manipulating the string `s`.
 */
export function createStringCursor(s: string): LispTokenCursor {
    const model = new LineInputModel();
    model.insertString(0, s);
    return model.getTokenCursor(0);
}