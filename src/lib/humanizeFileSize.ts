export function humanizeFileSize(size: number): string {
    if (size <= 0) {
        return "0b";
    }

    const units = ["b", "kb", "mb", "gb", "tb"] as const;
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const clampedIndex = Math.min(Math.max(i, 0), units.length - 1);

    const value = Math.round((size / Math.pow(1024, clampedIndex)) * 100) / 100;

    return value + units[clampedIndex]!;
}
