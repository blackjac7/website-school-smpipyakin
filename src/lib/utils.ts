import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, resolving Tailwind conflicts.
 *
 * `clsx` flattens the conditional inputs; `twMerge` then ensures that when two
 * conflicting Tailwind utilities collide (e.g. `bg-amber-600` + `bg-indigo-600`)
 * the last one wins instead of both landing in the DOM.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
