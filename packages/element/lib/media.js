// @domina/element :: lib/media

import { media } from '@domina/proxy';

// this.media of an element: on() stops when the element is disconnected
export const mediaOf = element => Object.create(media, { on: { value: (text, fn) => element.track(media.on(text, fn)) } });
