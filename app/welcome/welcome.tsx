import { useAnimatedCanvas } from "~/hooks/useAnimatedCanvas";
import { AnimatedCanvas } from "~/components/AnimatedCanvas";
import { Timeline } from "~/lib/Timeline";
import { Shadow } from "~/lib/Shadow";
import { Label } from "~/lib/Label";
import { Animate } from "~/lib/Animate";
import { Palettes, lighten, withAlpha } from "~/lib/Palettes";
import { CanvasDimensions } from "~/lib/CanvasDimensions";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  // Create the animation timeline with animated entrance and exit effects!
  const timeline = new Timeline()
    .addScene("Animated Shapes Demo", 12000, async (api) => {
      // Set global padding once - all positioning will automatically respect it
      api.canvas.setPadding(80);

      // Rectangle fades in using Position object from canvas.pos
      const rect = api.rect(api.canvas.pos.topLeft.moveDown(40), 100, 100, {
        stroke: Palettes.tailwind.blue,
        strokeWidth: 2,
        fill: lighten(Palettes.tailwind.blue, 0.5),
        fillStyle: "solid",
        shadow: Shadow.cast("rgba(0, 0, 0, 0.6)", 15, 15),
        label: new Label("DATABASE").fontSize(14).color(Palettes.tailwind.blue),
        animateIn: Animate.fadeIn(600).slideFrom("left", 150, 700),
      });

      // Wait a bit, then triangle using Position offset
      await api.wait(1000);
      const triangle = api.triangle(api.canvas.pos.topRight.offset(-100, 40), 100, {
        stroke: Palettes.nature.green,
        strokeWidth: 2,
        fill: lighten(Palettes.nature.green, 0.6),
        fillStyle: "solid",
        shadow: Shadow.cast("rgba(0, 0, 0, 0.7)", 18, 18),
        label: Label.create("API").fontSize(16).color(Palettes.nature.moss),
        animateIn: Animate.fadeIn(500).slideFrom("right", 150, 600),
      });

      // Let them display for a moment
      await api.wait(2000);

      // Remove rectangle with fade out and slide to bottom
      await rect.remove(Animate.fadeOut(500).slideTo("bottom", 100, 600));

      // Remove triangle with different animation
      await triangle.remove(Animate.fadeOut(400).slideTo("top", 120, 500));

      // Wait before showing circle scene
      await api.wait(500);

      // Circle fades in using canvas.pos.center with offset
      const circle = api.circle(api.canvas.pos.center.moveUp(100), 50, {
        stroke: Palettes.bold.red,
        strokeWidth: 2,
        fill: withAlpha(Palettes.bold.red, 0.1),
        fillStyle: "hachure",
        shadow: Shadow.drop(withAlpha(Palettes.bold.red, 0.4), 5, 5, 4),
        animateIn: Animate.fadeIn(400).slideFrom("bottom", 80, 500),
      });

      // Text fades in at circle's position using getPosition()
      const text = api.sketchyText("Hello!", circle.getPosition().moveUp(5), {
        fontSize: 28,
        color: Palettes.bold.red,
        textAlign: "center",
        textBaseline: "middle",
        jitter: 1.5,
        roughness: 3,
        animateIn: Animate.fadeIn(600),
      });

      // Let them show
      await api.wait(2500);

      // Exit animations - fade out in sequence
      await circle.remove(Animate.fadeOut(400).slideTo("left", 100, 500));
      await text.remove(Animate.fadeOut(300));
    })
    .loop(true);

  // Create animated canvas with timeline, dimensions, and viewport fitting
  const canvasRef = useAnimatedCanvas({
    timeline,
    dimensions: CanvasDimensions.youtubeVideo,
    fitViewport: true,
    fps: 12,
  });

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        {/* Rough.js Canvas */}
        <div className="flex flex-col items-center gap-4">
          <AnimatedCanvas
            ref={canvasRef}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
            aria-label="Animated sketch canvas with shapes demonstrating entrance and exit animations"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hand-drawn animation with fade-in/out & slide effects (12 FPS)
          </p>
        </div>
      </div>
    </main>
  );
}

