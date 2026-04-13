import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively removes all 'undefined' properties from an object.
 * Required for Firestore setDoc/updateDoc calls.
 */
export function cleanObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key) => {
      const val = cleanObject(obj[key]);
      if (val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {});
  }
  return obj;
}
