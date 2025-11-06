import { useState } from "react";
import { useAnimatedCanvas } from "~/hooks/useAnimatedCanvas";
import { useCanvasRecorder, type VideoFormat } from "~/hooks/useCanvasRecorder";
import { AnimatedCanvas } from "~/components/AnimatedCanvas";
import { Timeline } from "~/lib/Timeline";
import { Shadow } from "~/lib/Shadow";
import { Label } from "~/lib/Label";
import { Animate } from "~/lib/Animate";
import { Position } from "~/lib/Position";
import { Duration } from "~/lib/Duration";
import { Palettes, lighten, withAlpha } from "~/lib/Palettes";
import { CanvasDimensions } from "~/lib/CanvasDimensions";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  // Create the animation timeline with animated entrance and exit effects!
  const timeline = new Timeline()
    .addScene("Animated Shapes Demo", Duration.seconds(12), async (api) => {
      // Set global padding once - all positioning will automatically respect it
      api.canvas.setPadding(80);

      // Rectangle fades in using Position-based slide animation
      const rect = api.rect(api.canvas.pos.topLeft.moveDown(40), 100, 100, {
        stroke: Palettes.tailwind.blue,
        strokeWidth: 2,
        fill: lighten(Palettes.tailwind.blue, 0.5),
        fillStyle: "solid",
        shadow: Shadow.cast("rgba(0, 0, 0, 0.6)", 15, 15),
        label: new Label("DATABASE").fontSize(14).color(Palettes.tailwind.blue),
        animateIn: Animate.fadeIn(Duration.milliseconds(600)).slideFrom(Position.fromLeft(150), Duration.milliseconds(700)),
      });

      // Wait a bit, then triangle with Position-based animation
      await api.wait(Duration.seconds(1));
      const triangle = api.triangle(api.canvas.pos.topRight.offset(-100, 40), 100, {
        stroke: Palettes.nature.green,
        strokeWidth: 2,
        fill: lighten(Palettes.nature.green, 0.6),
        fillStyle: "solid",
        shadow: Shadow.cast("rgba(0, 0, 0, 0.7)", 18, 18),
        label: Label.create("API").fontSize(16).color(Palettes.nature.moss),
        animateIn: Animate.fadeIn(Duration.milliseconds(500)).slideFrom(Position.fromRight(150), Duration.milliseconds(600)),
      });

      // Let them display for a moment
      await api.wait(Duration.seconds(2));

      // Remove rectangle with Position-based slide out
      await rect.remove(Animate.fadeOut(Duration.milliseconds(500)).slideTo(Position.fromBottom(100), Duration.milliseconds(600)));

      // Remove triangle with different animation
      await triangle.remove(Animate.fadeOut(Duration.milliseconds(400)).slideTo(Position.fromTop(120), Duration.milliseconds(500)));

      // Wait before showing circle scene
      await api.wait(Duration.milliseconds(500));

      // Circle fades in with diagonal slide (Position.fromBottom with offset)
      const circle = api.circle(api.canvas.pos.center.moveUp(100), 50, {
        stroke: Palettes.bold.red,
        strokeWidth: 2,
        fill: withAlpha(Palettes.bold.red, 0.1),
        fillStyle: "hachure",
        shadow: Shadow.drop(withAlpha(Palettes.bold.red, 0.4), 5, 5, 4),
        animateIn: Animate.fadeIn(Duration.milliseconds(400)).slideFrom(Position.fromBottom(80), Duration.milliseconds(500)),
      });

      // Text fades in at circle's position using getPosition()
      const text = api.sketchyText("Hello!", circle.getPosition().moveUp(5), {
        fontSize: 28,
        color: Palettes.bold.red,
        textAlign: "center",
        textBaseline: "middle",
        jitter: 1.5,
        roughness: 3,
        animateIn: Animate.fadeIn(Duration.milliseconds(600)),
      });

      // Let them show
      await api.wait(Duration.seconds(2.5));

      // Exit animations with Position-based slides - fade out in sequence
      await circle.remove(Animate.fadeOut(Duration.milliseconds(400)).slideTo(Position.fromLeft(100), Duration.milliseconds(500)));
      await text.remove(Animate.fadeOut(Duration.milliseconds(300)));
    }, "#3f3f46") // zinc-700 background
    .loop(true);

  // Create animated canvas with timeline, dimensions, and viewport fitting
  const canvasRef = useAnimatedCanvas({
    timeline,
    dimensions: CanvasDimensions.square,
    fitViewport: true,
    fps: 12,
  });

  // Setup video recorder and format selection
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat>("mp4");
  const { startRecording, state: recordingState, progress, error: recordingError } = useCanvasRecorder();

  // Handle export button click
  const handleExport = () => {
    const duration = timeline.getTotalDuration();
    startRecording(canvasRef.current, duration, selectedFormat, 12);
  };

  // Get button text based on recording state
  const getButtonText = () => {
    switch (recordingState) {
      case "recording":
        return `Recording... ${Math.round(progress)}%`;
      case "processing":
        return "Processing...";
      case "error":
        return "Export Failed";
      default:
        return "Export Video";
    }
  };

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
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hand-drawn animation with fade-in/out & slide effects (12 FPS)
            </p>

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="format-select" className="text-xs text-gray-500 dark:text-gray-400">
                  Format:
                </label>
                <select
                  id="format-select"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as VideoFormat)}
                  disabled={recordingState === "recording" || recordingState === "processing"}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  <option value="mp4">MP4 (H.264)</option>
                  <option value="mov">MOV (QuickTime)</option>
                  <option value="webm">WebM</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="h-4"></div>
                <button
                  onClick={handleExport}
                  disabled={recordingState === "recording" || recordingState === "processing"}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {getButtonText()}
                </button>
              </div>
            </div>

            {recordingError && (
              <p className="text-xs text-red-600 dark:text-red-400">{recordingError}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

