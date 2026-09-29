// waitForAnimations.js

import { resolveElements } from './resolveElements.js';

/**
 * waits for the running animations of the targets -> Promise<Element[]>.
 * { name } only the css animation of that name, { subtree } the children's too.
 * a cancelled animation counts as done, an infinite one never is
 */
export function waitForAnimations (spec, { name, subtree = false } = {}) {
  const checkName   = animation => !name || animation.animationName === name;
  const checkFinish = animation => animation.finished.catch(() => null);
  const getNames    = element   => element.getAnimations({ subtree })
  
  const elements   = resolveElements(spec);
  const animations = elements.flatMap(getNames).filter(checkName);
  
  return Promise.all(animations.map(checkFinish)).then(() => elements);
}

export default waitForAnimations;
