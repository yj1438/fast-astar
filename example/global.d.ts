
import type { Application } from 'pixi.js';

// global
declare global {
  interface Window {
    app: Application;
  }
}
