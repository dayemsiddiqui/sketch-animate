import { useAnimatedCanvas } from "~/hooks/useAnimatedCanvas";
import { useAnimationTimeline } from "~/hooks/useAnimationTimeline";
import { Timeline } from "~/lib/Timeline";
import { Shadow } from "~/lib/Shadow";
import { Label } from "~/lib/Label";
import { Animate } from "~/lib/Animate";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  // Create the animation timeline with animated entrance and exit effects!
  const timeline = new Timeline()
    .addScene("Animated Shapes Demo", 12000, async (api) => {
      // Rectangle fades in and slides from left
      const rect = api.rect(80, 120, 100, 100, {
        stroke: "rgb(59, 130, 246)", // blue-500
        strokeWidth: 2,
        fill: "rgb(147, 197, 253)",
        fillStyle: "solid",
        shadow: Shadow.cast("rgba(0, 0, 0, 0.6)", 15, 15),
        label: new Label("DATABASE").fontSize(14).color("rgb(29, 78, 216)"),
        animateIn: Animate.fadeIn(600).slideFrom("left", 150, 700),
      });

      // Wait a bit, then triangle fades in and slides from right
      await api.wait(1000);
      const triangle = api.triangle(220, 120, 100, {
        stroke: "rgb(34, 197, 94)", // green-500
        strokeWidth: 2,
        fill: "rgb(134, 239, 172)",
        fillStyle: "solid",
        shadow: Shadow.cast("rgba(0, 0, 0, 0.7)", 18, 18),
        label: Label.create("API").fontSize(16).color("rgb(21, 128, 61)"),
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

      // Circle fades in from bottom
      const circle = api.circle(200, 200, 50, {
        stroke: "rgb(239, 68, 68)", // red-500
        strokeWidth: 2,
        fill: "rgba(239, 68, 68, 0.1)",
        fillStyle: "hachure",
        shadow: Shadow.drop("rgba(239, 68, 68, 0.4)", 5, 5, 4),
        animateIn: Animate.fadeIn(400).slideFrom("bottom", 80, 500),
      });

      // Text fades in separately
      const text = api.sketchyText("Hello!", 200, 205, {
        fontSize: 28,
        color: "rgb(239, 68, 68)",
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

  // Get the draw function from the timeline
  const timelineDraw = useAnimationTimeline(timeline);

  // Pass it to the animated canvas at 12 FPS
  const canvasRef = useAnimatedCanvas(timelineDraw, { fps: 12 });

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
      

        {/* Rough.js Canvas */}
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hand-drawn animation with fade-in/out & slide effects (12 FPS)
          </p>
        </div>

        
      </div>
    </main>
  );
}

