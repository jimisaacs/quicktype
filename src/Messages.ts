"use strict";

import { StringMap } from "./Support";

export enum ErrorMessage {
    InternalError = "Internal error: ${message}",

    // Misc
    JSONParseError = "Syntax error in ${description} JSON ${address}: ${message}",
    ReadError = "Cannot read from file or URL ${fileOrURL}: ${message}",

    // JSON Schema input
    ArrayIsInvalidJSONSchema = "An array is not a valid JSON Schema",
    NullIsInvalidJSONSchema = "null is not a valid JSON Schema",
    RefMustBeString = "$ref must be a string",
    AdditionalTypesForbidRequired = "Can't have non-specified required properties but forbidden additionalTypes",
    NoTypeSpecified = "JSON Schema must specify at least one type",
    FalseSchemaNotSupported = 'Schema "false" is not supported',
    RefWithFragmentNotAllowed = "Ref URI with fragment is not allowed: ${ref}",
    InvalidJSONSchemaType = "Value of type ${type} is not valid JSON Schema",
    RequiredMustBeStringOrStringArray = "`required` must be string or array of strings, but is ${actual}",
    RequiredElementMustBeString = "`required` must contain only strings, but it has ${element}",
    TypeMustBeStringOrStringArray = "`type` must be string or array of strings, but is ${actual}",
    TypeElementMustBeString = "`type` must contain only strings, but it has ${element}",
    ArrayItemsMustBeStringOrArray = "Array items must be an array or an object, but is ${actual}",
    IDMustHaveAddress = "$id doesn't have an address: ${id}",
    WrongAccessorEntryArrayLength = "Accessor entry array must have the same number of entries as the ${operation}",
    SetOperationCasesIsNotArray = "${operation} cases must be an array, but is ${cases}",
    CannotFetchSchema = "Cannot fetch schema at address ${address}",

    // Driver
    UnknownSourceLanguage = "Unknown source language ${lang}",
    UnknownOutputLanguage = "Unknown output language ${lang}",
    NoGraphQLQueryGiven = "Please specify at least one GraphQL query as input",
    NoGraphQLSchemaInDir = "No GraphQL schema in ${dataDir}",
    InputFileDoesNotExist = "Input file ${filename} does not exist",
    CannotMixJSONWithOtherSamples = "Cannot mix JSON samples with JSON Schems, GraphQL, or TypeScript in input subdirectory ${dir}",
    CannotMixNonJSONInputs = "Cannot mix JSON Schema, GraphQL, and TypeScript in an input subdirectory ${dir}",
    UnknownDebugOption = "Unknown debug option ${option}",

    // IR
    NoForwardDeclarableTypeInCycle = "Cannot resolve cycle because it doesn't contain types that can be forward declared",
    TypeAttributesNotPropagated = "Type attributes for ${count} types were not carried over to the new graph",

    // Rendering
    UnknownRendererOptionValue = "Unknown value ${value} for option ${name}",

    // TypeScript input
    TypeScriptCompilerError = "TypeScript error: ${message}"
}

/*
type Error =
    | { message: ErrorMessage.InternalError; properties: { message: string } }

    // Misc
    | { message: ErrorMessage.JSONParseError; properties: { description: string; address: string; message: string } }
    | { message: ErrorMessage.ReadError; properties: { fileOrURL: string; message: string } }

    // JSON Schema input
    | { message: ErrorMessage.ArrayIsInvalidJSONSchema; properties: {} }
    | { message: ErrorMessage.NullIsInvalidJSONSchema; properties: {} }
    | { message: ErrorMessage.RefMustBeString; properties: {} }
    | { message: ErrorMessage.AdditionalTypesForbidRequired; properties: {} }
    | { message: ErrorMessage.NoTypeSpecified; properties: {} }
    | { message: ErrorMessage.FalseSchemaNotSupported; properties: {} }
    | { message: ErrorMessage.RefWithFragmentNotAllowed; properties: { ref: string } }
    | { message: ErrorMessage.InvalidJSONSchemaType; properties: { type: string } }
    | { message: ErrorMessage.RequiredMustBeStringOrStringArray; properties: { actual: any } }
    | { message: ErrorMessage.RequiredElementMustBeString; properties: { element: any } }
    | { message: ErrorMessage.TypeMustBeStringOrStringArray; properties: { actual: any } }
    | { message: ErrorMessage.TypeElementMustBeString; properties: { element: any } }
    | { message: ErrorMessage.ArrayItemsMustBeStringOrArray; properties: { actual: any } }
    | { message: ErrorMessage.IDMustHaveAddress, properties: { id: string } }
    | { message: ErrorMessage.WrongAccessorEntryArrayLength, properties: { operation: string } }
    | { message: ErrorMessage.SetOperationCasesIsNotArray; properties: { operation: string; cases: any } }
    | { message: ErrorMessage.CannotFetchSchema; properties: { address: string } }

    // Driver
    | { message: ErrorMessage.UnknownSourceLanguage; properties: { lang: string } }
    | { message: ErrorMessage.UnknownOutputLanguage; properties: { lang: string } }
    | { message: ErrorMessage.NoGraphQLQueryGiven; properties: {} }
    | { message: ErrorMessage.NoGraphQLSchemaInDir; properties: { dir: string } }
    | { message: ErrorMessage.InputFileDoesNotExist; properties: { filename: string } }
    | { message: ErrorMessage.CannotMixJSONWithOtherSamples; properties: { dir: string } }
    | { message: ErrorMessage.CannotMixNonJSONInputs; properties: { dir: string } }
    | { message: ErrorMessage.UnknownDebugOption; properties: { option: string } }

    // IR
    | { message: ErrorMessage.NoForwardDeclarableTypeInCycle; properties: {} }
    | { message: ErrorMessage.TypeAttributesNotPropagated; properties: { count: number } }

    // Rendering
    | { message: ErrorMessage. UnknownRendererOptionValue; properties: { value: string; name: string } }

    // TypeScript input
    | { message: ErrorMessage.TypeScriptCompilerError; properties: { message: string } }
    ;
*/

/*
type Errors =
   { kind: "foo"; properties: { quux: number } } |
   { kind: "bar"; properties: { frob: boolean } };
type Kind = Errors extends { kind: infer T } ? T : never;
type properties = Errors extends { properties: infer P } ? P : never;
type KindFor<P> = Extract<Errors, { properties: P }> extends { kind: infer K } ? K : never;

function error<P extends properties>(kind: KindFor<P>, properties: P): void {}
*/

export class QuickTypeError extends Error {
    constructor(readonly errorMessage: ErrorMessage, userMessage: string, readonly properties: StringMap) {
        super(userMessage);
    }
}

export function messageError(message: ErrorMessage): never;
export function messageError(message: ErrorMessage, properties: StringMap): never;
export function messageError(message: ErrorMessage, properties?: StringMap): never {
    let userMessage: string = message;

    if (properties !== undefined) {
        for (const name of Object.getOwnPropertyNames(properties)) {
            let value = properties[name];
            if (typeof value !== "string") {
                value = JSON.stringify(value);
            }
            userMessage = userMessage.replace("${" + name + "}", value);
        }
    } else {
        properties = {};
    }

    throw new QuickTypeError(message, userMessage, properties);
}

export function messageAssert(assertion: boolean, message: ErrorMessage): void;
export function messageAssert(assertion: boolean, message: ErrorMessage, properties: StringMap): void;
export function messageAssert(assertion: boolean, message: ErrorMessage, properties?: StringMap): void {
    if (assertion) return;
    return (messageError as any)(message, properties);
}
