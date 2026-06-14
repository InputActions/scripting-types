/*
    TypeScript type declarations for the InputActions scripting API
    Copyright (C) 2026 Marcin Woźniak

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**
 * The global object used by classic scripts, including those in function actions and conditions. Modifying this object is reserved for the end user, modules
 * intended for public consumption are forbidden from doing so.
 *
 * @example
 * import { globalThis } from "inputactions";
 *
 * function exampleFunction() {
 *     console.log("Example function called");
 * }
 *
 * Object.assign(globalThis, {
 *     exampleFunction
 * });
 *
 * // In YAML config:
 * // actions: # actions of a trigger
 * //   - function: exampleFunction
 */
export const globalThis: any;

/**
 * @param duration Duration in milliseconds, rounded down to the nearest integer. Must be between 1 and 2,147,483,647 (inclusive).
 * @returns A promise that is fulfilled once the specified amount of time passes.
 * @throws {RangeError} Duration is not within the specified range.
 */
export function delay(duration: number): Promise<void>;

/**
 * Always copied when passed between JavaScript and the InputActions API. Cannot be subclassed.
 */
export class Point {
    x: number;
    y: number;

    /**
     * Constructs a null point with both coordinates equal to 0.
     */
    constructor();
    constructor(x: number, y: number);

    /**
     * @returns A copy of this object.
     */
    clone(): Point;
}

/**
 * If the main module exports a default function, it will be called immediately after the module is loaded with an instance of this object as the only
 * argument.
 *
 * @example
 * import { Script } from "inputactions";
 *
 * export default function(script: Script) {
 *     // ...
 * }
 */
export interface Script {
    /**
     * The absolute path to the directory containing the main module file.
     */
    readonly rootDirectory: string;
}

/**
 * Signals are used to notify its subscribers when an event occurs.
 *
 * Connected functions are invoked in the order of connection. All connections are cleaned up when the configuration is destroyed.
 *
 * @example
 * import { config } from "inputactions/core";
 *
 * function onConfigAboutToBeDestroyed() {
 *     // Code that runs only when the configuration fails to load
 * }
 *
 * function onConfigAboutToBeActivated() {
 *     config.aboutToBeDestroyed.disconnect(onConfigAboutToBeDestroyed);
 * }
 *
 * config.aboutToBeDestroyed.connect(onConfigAboutToBeDestroyed);
 * config.aboutToBeActivated.connect(onConfigAboutToBeActivated);
 */
export interface Signal<TArgs extends any[] = []> {
    /**
     * Connects a function to the signal.
     * @param func Will be called when the signal is emitted. Anonymous functions cannot be disconnected.
     * @see {@link disconnect}
     */
    connect(func: (...args: TArgs) => undefined): void;
    /**
     * Disconnects a function from the signal.
     * @param func Must be the same function that was passed to {@link connect}.
     * @see {@link connect}
     */
    disconnect(func: (...args: TArgs) => undefined): void;
}