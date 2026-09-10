export type SafePrintDirection = "ltr" | "rtl";

export function openSafePrintWindow(options: {
  name: string;
  title: string;
  direction: SafePrintDirection;
  language: "ar" | "en";
  features: string;
  styleText: string;
}): Window | null {
  const printWindow = window.open("", options.name, options.features);
  if (!printWindow) return null;

  const document = printWindow.document;
  document.documentElement.lang = options.language;
  document.documentElement.dir = options.direction;
  document.title = options.title;
  document.head.replaceChildren();
  document.body.replaceChildren();

  const style = document.createElement("style");
  style.textContent = options.styleText;
  document.head.append(style);
  return printWindow;
}

export function appendSafePrintText(
  document: Document,
  parent: HTMLElement,
  tagName: keyof HTMLElementTagNameMap,
  text: string,
  className?: string,
): HTMLElement {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}
