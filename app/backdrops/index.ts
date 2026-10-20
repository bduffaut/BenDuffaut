import { elements } from './elements'
import { grove } from './grove'
import { lattice } from './lattice'
import { mustafar } from './mustafar'
import type { BackdropFactory } from './runner'

// The animated backdrops a theme can pick with `effects.backdrop` in app/themes/index.ts.
// To add one, write a BackdropFactory (see ./runner.ts and any file here) and list it below.

export const BACKDROPS = { lattice, grove, mustafar, elements } satisfies Record<string, BackdropFactory>

export type BackdropId = keyof typeof BACKDROPS

export { runBackdrop } from './runner'
