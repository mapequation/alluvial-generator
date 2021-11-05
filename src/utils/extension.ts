export default function fileExtension(filename: string) {
  const index = filename.lastIndexOf(".");
  if (index === -1 || index + 1 === filename.length) return "";
  return filename.substring(index + 1).toLowerCase();
}
