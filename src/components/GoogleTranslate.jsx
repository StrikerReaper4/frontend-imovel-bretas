import { useEffect } from "react";

export default function GoogleTranslate() {
  useEffect(() => {
    // Evita criar múltiplos scripts ao navegar
    if (window.googleTranslateElementInit) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "pt",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}
    ></div>
  );
}
