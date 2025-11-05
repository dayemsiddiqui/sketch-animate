import type { Scene, SceneAPI } from "~/hooks/types";

/**
 * Timeline class for building sketch animations with a fluent API.
 * Inspired by Puppeteer's chainable method style.
 *
 * @example
 * ```tsx
 * const timeline = new Timeline()
 *   .addScene("Rectangle", 3500, async (api) => {
 *     api.addShape({ type: "rectangle", x: 150, y: 150, width: 100, height: 100 });
 *   })
 *   .addScene("Circle", 3500, async (api) => {
 *     api.addShape({ type: "circle", x: 200, y: 200, radius: 50 });
 *     await api.wait(1000);
 *     api.addShape({ type: "ellipse", x: 300, y: 200, width: 80, height: 60 });
 *   })
 *   .loop(true);
 * ```
 */
export class Timeline {
  private scenes: Scene[] = [];
  private shouldLoop: boolean = true;

  /**
   * Add a scene to the timeline
   *
   * @param name - Optional name for the scene (useful for debugging)
   * @param duration - Duration of the scene in milliseconds
   * @param draw - Async function that choreographs what to draw in this scene
   * @returns The Timeline instance for chaining
   */
  addScene(
    name: string,
    duration: number,
    draw: (api: SceneAPI) => Promise<void>
  ): this;
  addScene(
    duration: number,
    draw: (api: SceneAPI) => Promise<void>
  ): this;
  addScene(
    nameOrDuration: string | number,
    durationOrDraw: number | ((api: SceneAPI) => Promise<void>),
    maybeDraw?: (api: SceneAPI) => Promise<void>
  ): this {
    let scene: Scene;

    // Handle overloads
    if (typeof nameOrDuration === "string") {
      // Called with: name, duration, draw
      scene = {
        name: nameOrDuration,
        duration: durationOrDraw as number,
        draw: maybeDraw!,
      };
    } else {
      // Called with: duration, draw
      scene = {
        duration: nameOrDuration,
        draw: durationOrDraw as (api: SceneAPI) => Promise<void>,
      };
    }

    this.scenes.push(scene);
    return this;
  }

  /**
   * Set whether the timeline should loop
   *
   * @param enabled - Whether to loop the timeline (default: true)
   * @returns The Timeline instance for chaining
   */
  loop(enabled: boolean = true): this {
    this.shouldLoop = enabled;
    return this;
  }

  /**
   * Get all scenes in the timeline
   * @internal Used by useAnimationTimeline hook
   */
  getScenes(): Scene[] {
    return this.scenes;
  }

  /**
   * Get the loop setting
   * @internal Used by useAnimationTimeline hook
   */
  getLoop(): boolean {
    return this.shouldLoop;
  }

  /**
   * Get the total duration of the timeline
   */
  getTotalDuration(): number {
    return this.scenes.reduce((total, scene) => total + (scene.duration || 0), 0);
  }

  /**
   * Get the number of scenes in the timeline
   */
  getSceneCount(): number {
    return this.scenes.length;
  }
}
