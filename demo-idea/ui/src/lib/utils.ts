import clsx, {ClassValue} from 'clsx'
import {twMerge} from 'tailwind-merge'

// Address merge conflicts that arise when concatonating tailwind classes together
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}