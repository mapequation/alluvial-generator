export default function raise(element: HTMLElement) {
  if (element.nextSibling) {
    element.parentElement?.appendChild(element);
  }
}
