import { useEffect } from "react";

// Ajusta el <title> y la clase del <body> que tenía cada página HTML.
export function usePage(title: string, bodyClass?: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!bodyClass) return;
    document.body.classList.add(bodyClass);
    return () => document.body.classList.remove(bodyClass);
  }, [bodyClass]);
}
