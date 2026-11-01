"""
Shared helpers for the docs render scripts: write a list of PIL frames as a
browser-friendly H.264 MP4 (yuv420p, even dimensions, faststart) plus a JPEG
poster.  Uses the static ffmpeg shipped with the imageio-ffmpeg package
(`pip install imageio-ffmpeg`).
"""
import numpy as np
import imageio_ffmpeg
from PIL import Image


def _even(im):
    w, h = im.size
    if w % 2 == 0 and h % 2 == 0:
        return im
    canvas = Image.new("RGB", (w + w % 2, h + h % 2), "white")
    canvas.paste(im, (0, 0))
    return canvas


def crop_to_content(frames, pad=12, thresh=245):
    """Crop all frames to the union bounding box of non-white pixels."""
    box = None
    for f in frames:
        a = np.asarray(f.convert("L"))
        ys, xs = np.nonzero(a < thresh)
        if len(xs) == 0:
            continue
        b = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]),
                                     max(box[2], b[2]), max(box[3], b[3]))
    if box is None:
        return frames
    w, h = frames[0].size
    box = (max(box[0] - pad, 0), max(box[1] - pad, 0), min(box[2] + pad, w), min(box[3] + pad, h))
    return [f.crop(box) for f in frames]


def save_mp4(frames, path, fps=8, hold_last=1.0, crf=20, poster=None, poster_index=-1,
             crop=False):
    """Write `frames` (PIL images, same size) to `path` as H.264 MP4.

    hold_last: seconds to hold the final frame before the loop restarts.
    poster:    optional JPEG path; written from frames[poster_index].
    crop:      trim white margins (union over all frames, so nothing jumps).
    """
    if crop:
        frames = crop_to_content(frames)
    frames = [_even(f.convert("RGB")) for f in frames]
    frames += [frames[-1]] * int(round(hold_last * fps))
    w, h = frames[0].size
    writer = imageio_ffmpeg.write_frames(
        path, (w, h), fps=fps, codec="libx264", pix_fmt_out="yuv420p",
        quality=None, macro_block_size=1,
        output_params=["-crf", str(crf), "-preset", "slow", "-movflags", "+faststart"])
    writer.send(None)
    for f in frames:
        writer.send(np.ascontiguousarray(np.asarray(f, dtype=np.uint8)))
    writer.close()
    if poster:
        frames[poster_index].save(poster, quality=88)
