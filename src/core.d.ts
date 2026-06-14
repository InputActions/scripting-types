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

import { CursorShape } from "./desktop";
import { Point, Signal } from "./main";

/**
 * The configuration this script belongs to. May not have been activated yet.
 */
export const config: Config;
export const input: InputBackend;
/**
 * The global variable registry for this configuration.
 */
export const variableRegistry: VariableRegistry;

/**
 * An InputActions configuration.
 *
 * Configuration loading process:
 *   1. Create a new scripting engine. The current configuration is still active at this point.
 *   2. Read scripts from the new configuration and evaluate them in the new engine.
 *   3. Load the rest of the configuration.
 *   4. Emit {@link aboutToBeDestroyed} on the current configuration.
 *   5. Destroy the current configuration.
 *   6. Emit {@link aboutToBeActivated} on the new configuration.
 *   7. Activate the new configuration.
 *   8. Emit {@link activated} on the new configuration.
 *
 * If an error occurs during steps 2 or 3, {@link aboutToBeDestroyed} is emitted on the new configuration and it is destroyed.
 */
export interface Config {
    /**
     * Emitted when the configuration has been loaded successfully and is about to be activated. At this moment, the old configuration has been destroyed and
     * no configuration is active.
     *
     * If this signal is emitted, {@link Config.activated} is guaranteed to be emitted as well.
     */
    readonly aboutToBeActivated: Signal;
    /**
     * Emitted when the configuration is about to be destroyed because another configuration is about to be activated, loading this configuration failed or
     * the program hosting the InputActions implementation is shutting down.
     *
     * It is currently not possible to postpone the engine destruction until all asynchronous operations performed in the signal handler have been completed.
     */
    readonly aboutToBeDestroyed: Signal;
    /**
     * Emitted when the configuration has been activated and input devices have been initialized.
     */
    readonly activated: Signal;
}

export interface InputBackend {
    /**
     * Virtual device for emitting anonymous mouse events. Undefined if not supported or accessed before the configuration is activated
     * ({@link Config.activated}).
     */
    readonly virtualMouse: VirtualMouse | undefined;
}

export enum KeyboardModifier {
    None,
    Shift,
    Control,
    Alt,
    Meta
}

/**
 * An InputActions variable.
 */
export interface Variable<T = any> {
    /**
     * The variable's value. For variables of non-primitive types, this property's getter always returns a new copy of the original object.
     */
    readonly value: T | null;
    readonly type: VariableType;
}

/**
 * A variable whose value is stored by InputActions. This object is the only way to set the variable's value and can be obtained when registering one.
 */
export interface StoredVariable<T = any> extends Variable<T> {
    /**
     * The variable is only updated when a value is assigned to this property, modifying the object returned by the property's getter does not update the
     * variable itself.
     * @throws {Error} When attempting to set to a value that does not match the variable's type.
     * @inheritdoc
     */
    value: T | null;
}

/**
 * Holds InputActions variables. Custom variables can be used in the configuration just like built-in ones.
 *
 * @example
 * import { Point } from "inputactions";
 * import { variableRegistry, VariableType } from "inputactions/core";
 *
 * const storedVariable = variableRegistry.registerStoredVariable<Point>("point", VariableType.Point);
 * storedVariable.value = new Point(1, 2);
 *
 * // Count increases by 1 on every variable access
 * let count = 0;
 * const countVariable = variableRegistry.registerComputedVariable<number>("count", VariableType.Number, () => ++count);
 * console.log(countVariable.value); // Output: 1
 * console.log(countVariable.value); // Output: 2
 */
export interface VariableRegistry {
    /**
     * @returns Whether a variable with the specified name exists.
     */
    contains(name: string): boolean;
    /**
     * @returns The variable with the specified name.
     * @throws {Error} No variable with such name exists.
     */
    get<T = any>(name: string): Variable<T>;

    /**
     * Registers a variable whose value is computed on demand. Registration can only be done before the configuration is loaded.
     * @param name Must consist only of alphanumeric characters and underscores, cannot begin with a digit.
     * @param getter A function that returns the variable's value. Must match the variable's type.
     * @returns The registered variable.
     * @throws {Error} The specified name is invalid.
     * @throws {Error} A variable with the specified name already exists.
     * @throws {Error} Getter is not callable.
     * @throws {Error} The configuration has already been loaded.
     */
    registerComputedVariable<T = any>(name: string, type: VariableType, getter: () => T | null): Variable<T>;

    /**
     * Registers a variable whose value is stored by InputActions. Registration can only be done before the configuration is loaded.
     * @param name Must consist only of alphanumeric characters and underscores, cannot begin with a digit.
     * @returns The registered variable, set to null by default. The returned object is the only way to set the variable's value.
     * @throws {Error} The specified name is invalid.
     * @throws {Error} A variable with the specified name already exists.
     * @throws {Error} The configuration has already been loaded.
     */
    registerStoredVariable<T = any>(name: string, type: VariableType): StoredVariable<T>;
}

export enum VariableType {
    /**
     * boolean
     */
    Boolean,
    /**
     * {@link CursorShape}
     */
    CursorShape,
    /**
     * {@link KeyboardModifier} (flags)
     */
    KeyboardModifiers,
    /**
     * number
     */
    Number,
    /**
     * {@link Point}
     */
    Point,
    /**
     * string
     */
    String
}

/**
 * Virtual device for emitting anonymous mouse events.
 */
export interface VirtualMouse {
    mouseMotion(delta: Point): void;
    mouseWheel(delta: Point): void;
}