"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void;
  }
}

const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const scriptSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";

function getLabel(element: HTMLElement) {
  return (
    element.dataset.analyticsLabel ||
    element.getAttribute("aria-label") ||
    element.getAttribute("name") ||
    element.textContent?.trim() ||
    "unknown"
  );
}

function getLocation(element: HTMLElement) {
  return element.dataset.analyticsLocation || element.id || "unknown";
}

function track(eventName: string, props?: Record<string, string>) {
  if (!domain || typeof window === "undefined" || typeof window.plausible !== "function") return;
  window.plausible(eventName, props ? { props } : undefined);
}

export default function Analytics() {
  useEffect(() => {
    if (!domain) return;

    const startedForms = new WeakSet<HTMLFormElement>();

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>("[data-analytics-event]");
      if (element) {
        const eventName = element.dataset.analyticsEvent;
        if (!eventName) return;

        track(eventName, {
          location: getLocation(element),
          label: getLabel(element),
        });
        return;
      }

      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("/") || href.startsWith("#")) return;

      const url = href.startsWith("http") ? new URL(href, window.location.origin) : null;
      const destination = href.startsWith("mailto:")
        ? "mailto"
        : href.startsWith("tel:")
          ? "tel"
          : url?.hostname || "external";

      track("outbound_click", {
        location: getLocation(link),
        label: getLabel(link),
        destination,
      });
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form) return;

      const eventName = form.dataset.analyticsSubmitEvent;
      if (!eventName) return;

      track(eventName, {
        location: getLocation(form),
        label: getLabel(form) || "form_submit",
      });
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const form = target?.closest<HTMLFormElement>("form[data-analytics-submit-event]");
      if (!form || startedForms.has(form)) return;

      startedForms.add(form);

      const submitEvent = form.dataset.analyticsSubmitEvent || "form_submit";
      const startEvent = form.dataset.analyticsStartEvent || submitEvent.replace(/_submit$/, "_start");

      track(startEvent, {
        location: getLocation(form),
        label: getLabel(form) || "form_start",
      });
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  if (!domain) return null;

  return <Script defer data-domain={domain} src={scriptSrc} />;
}
