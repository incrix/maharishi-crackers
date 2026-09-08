/**
 * Commerce constants shared by server and client code.
 *
 * MIN_ORDER lives here rather than in util/cart.js because that module is
 * "use client" - importing it from a server component would drag the whole
 * cart hook into the client bundle just to read a number.
 */

/** Minimum value for an online order, in rupees. */
export const MIN_ORDER = 3000;
