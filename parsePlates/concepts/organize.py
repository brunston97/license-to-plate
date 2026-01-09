#!/usr/bin/env python3
"""
batch_sorter.py

Sort all JPEG files in a source directory into sequential batch folders.

Usage
-----
python batch_sorter.py --src <source_dir> --dst <dest_dir> --size <batch_size> [--dry-run] [--verbose]

Positional arguments:
    --src   Source directory that contains the .jpg/.jpeg files.
    --dst   Destination directory where the batch folders will be created.
    --size  Maximum number of files per batch folder (integer > 0).

Optional flags:
    --dry-run   Show what would happen without moving any files.
    --verbose   Print detailed progress information.
    --reverse   Sort files in reverse order (great for “most recent first” if you also sort by mtime).

Examples
--------
# Basic usage: move files into folders of 50 images each
python batch_sorter.py --src ./unsorted_jpgs --dst ./sorted_jpgs --size 50

# Dry‑run (no actual file operations)
python batch_sorter.py --src ./unsorted_jpgs --dst ./sorted_jpgs --size 50 --dry-run
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path
from typing import Iterable, List, Sequence


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Sort JPEG files into sequential batch folders."
    )
    parser.add_argument(
        "--src",
        type=Path,
        required=True,
        help="Source directory containing the JPEG files.",
    )
    parser.add_argument(
        "--dst",
        type=Path,
        required=True,
        help="Destination directory where batch folders will be created.",
    )
    parser.add_argument(
        "--size",
        type=int,
        required=True,
        help="Maximum number of files per batch folder.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without moving any files.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print detailed progress information.",
    )
    parser.add_argument(
        "--reverse",
        action="store_true",
        help="Sort files in reverse order (useful when also sorting by mtime).",
    )
    return parser.parse_args()


def collect_jpgs(src: Path) -> List[Path]:
    """
    Return a list of .jpg/.jpeg files in *src*.
    The search is case‑insensitive and does **not** recurse into subdirectories.
    """
    if not src.is_dir():
        raise FileNotFoundError(f"Source directory does not exist: {src}")

    jpg_extensions = {".jpg", ".jpeg", ".JPG", ".JPEG"}
    files = [p for p in src.iterdir() if p.suffix in jpg_extensions and p.is_file()]
    return files


def sort_files(files: Sequence[Path], reverse: bool = False) -> List[Path]:
    """
    Sort files by name alphabetically.  If `reverse` is True, reverse the order.
    """
    return sorted(files, reverse=reverse)


def create_batch_folders(
    dst: Path, num_batches: int, dry_run: bool, verbose: bool
) -> None:
    """
    Create batch folders (batch_01, batch_02, …) under *dst*.
    If *dry_run* is True, just log what would be created.
    """
    dst.mkdir(parents=True, exist_ok=True)
    for i in range(1, num_batches + 1):
        folder = dst / f"batch_{i:02d}"
        if dry_run:
            print(f"[DRY-RUN] Would create folder: {folder}")
            continue
        if verbose:
            print(f"Creating folder: {folder}")
        folder.mkdir(exist_ok=True, parents=True)


def move_files(
    files: List[Path],
    dst: Path,
    batch_size: int,
    dry_run: bool,
    verbose: bool,
) -> None:
    """
    Move *files* into sequential batch folders under *dst*.
    """
    batch_num = 1
    file_counter = 0
    for file_path in files:
        folder = dst / f"batch_{batch_num:02d}"
        target = folder / file_path.name
        if dry_run:
            print(f"[DRY-RUN] Would move {file_path} -> {target}")
        else:
            if verbose:
                print(f"Moving {file_path} -> {target}")
            shutil.move(str(file_path), target)
        file_counter += 1
        if file_counter >= batch_size:
            batch_num += 1
            file_counter = 0


def main() -> None:
    args = parse_args()

    # Sanity checks
    if args.size <= 0:
        print("Error: --size must be a positive integer.", file=sys.stderr)
        sys.exit(1)

    try:
        jpg_files = collect_jpgs(args.src)
    except FileNotFoundError as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)

    if not jpg_files:
        print("No JPEG files found. Nothing to do.")
        sys.exit(0)

    # Sort files
    sorted_files = sort_files(jpg_files, reverse=args.reverse)

    # Determine how many batches we need
    total_files = len(sorted_files)
    num_batches = (total_files + args.size - 1) // args.size

    if args.verbose:
        print(f"Found {total_files} JPEG files.")
        print(f"Batch size: {args.size}")
        print(f"Will create {num_batches} batch folder(s).")

    # Create destination folders
    create_batch_folders(args.dst, num_batches, args.dry_run, args.verbose)

    # Move files
    move_files(sorted_files, args.dst, args.size, args.dry_run, args.verbose)

    if not args.dry_run:
        print("\n✅ Operation complete.")
    else:
        print("\n⚠️  Dry‑run complete – no files were actually moved.")


if __name__ == "__main__":
    main()
