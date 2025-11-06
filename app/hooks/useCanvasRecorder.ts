import { useState, useCallback, useRef } from "react";

/**
 * Recording state machine
 */
export type RecordingState = "idle" | "recording" | "processing" | "error";

/**
 * Supported video formats
 */
export type VideoFormat = "mp4" | "webm" | "mov";

/**
 * Hook for recording canvas animations to video files
 * Uses MediaRecorder API with canvas.captureStream()
 *
 * @example
 * ```tsx
 * const { startRecording, state, progress, error } = useCanvasRecorder();
 *
 * <button onClick={() => startRecording(canvasRef.current, 12000)}>
 *   Export Video
 * </button>
 * ```
 */
export function useCanvasRecorder() {
  const [state, setState] = useState<RecordingState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const progressIntervalRef = useRef<number | null>(null);

  /**
   * Detect the best supported MIME type for video recording based on format
   */
  const getSupportedMimeType = useCallback((format: VideoFormat): string | null => {
    let types: string[] = [];

    switch (format) {
      case "mp4":
      case "mov":
        // MOV and MP4 both use H.264 codec, differ only in container/extension
        types = [
          "video/mp4;codecs=h264,aac",
          "video/mp4;codecs=h264",
          "video/mp4",
        ];
        break;
      case "webm":
        types = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8,opus",
          "video/webm;codecs=vp8",
          "video/webm",
        ];
        break;
    }

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return null;
  }, []);

  /**
   * Download the recorded video blob
   */
  const downloadVideo = useCallback((blob: Blob, format: VideoFormat) => {
    const url = URL.createObjectURL(blob);
    const filename = `animation-${Date.now()}.${format}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  /**
   * Start recording the canvas
   *
   * @param canvas - Canvas element to record
   * @param duration - Recording duration in milliseconds
   * @param format - Video format (mp4, webm, or mov)
   * @param fps - Frames per second (default: 12)
   */
  const startRecording = useCallback(
    (canvas: HTMLCanvasElement | null, duration: number, format: VideoFormat = "mp4", fps: number = 12) => {
      if (!canvas) {
        setError("Canvas element not found");
        setState("error");
        return;
      }

      // Check MediaRecorder support
      if (typeof MediaRecorder === "undefined") {
        setError("Video recording is not supported in this browser");
        setState("error");
        return;
      }

      const mimeType = getSupportedMimeType(format);
      if (!mimeType) {
        setError(`${format.toUpperCase()} format is not supported in this browser`);
        setState("error");
        return;
      }

      try {
        // Capture canvas stream
        const stream = canvas.captureStream(fps);

        // Create MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 2500000, // 2.5 Mbps
        });

        chunksRef.current = [];

        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        // Handle recording stop
        mediaRecorder.onstop = () => {
          setState("processing");

          // Create blob from chunks
          const blob = new Blob(chunksRef.current, { type: mimeType });

          // Download the video
          downloadVideo(blob, format);

          // Reset state
          setState("idle");
          setProgress(0);
          chunksRef.current = [];

          // Clear progress interval
          if (progressIntervalRef.current !== null) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        };

        // Handle errors
        mediaRecorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setError("Recording failed. Please try again.");
          setState("error");

          if (progressIntervalRef.current !== null) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        };

        // Start recording
        mediaRecorder.start(100); // Collect data every 100ms
        mediaRecorderRef.current = mediaRecorder;
        setState("recording");
        setProgress(0);
        setError(null);

        // Update progress
        const startTime = Date.now();
        progressIntervalRef.current = window.setInterval(() => {
          const elapsed = Date.now() - startTime;
          const currentProgress = Math.min((elapsed / duration) * 100, 100);
          setProgress(currentProgress);
        }, 100);

        // Auto-stop after duration
        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        }, duration);
      } catch (err) {
        console.error("Failed to start recording:", err);
        setError("Failed to start recording. Please try again.");
        setState("error");
      }
    },
    [getSupportedMimeType, downloadVideo]
  );

  /**
   * Stop recording manually (if needed)
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setState("idle");
  }, []);

  return {
    startRecording,
    stopRecording,
    clearError,
    state,
    progress,
    error,
    isRecording: state === "recording",
    isProcessing: state === "processing",
    hasError: state === "error",
  };
}
