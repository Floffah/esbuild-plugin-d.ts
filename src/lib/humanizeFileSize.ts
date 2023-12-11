export function humanizeFileSize(size: number): string {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (
        Math.round((size / Math.pow(1024, i)) * 100) / 100 +
        ["b", "kb", "mb", "gb", "tb"][i]
    );
}
