import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export type XOR<T, U> =
    T | U extends Record<string, unknown>
        ? (Without<T, U> & U) | (Without<U, T> & T)
        : T | U;
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
