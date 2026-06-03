// hooks/use-split-text.ts

export function splitText(
  el: HTMLElement,
  type: "lines" | "words" | "chars" = "lines",
): { inners: HTMLElement[]; revert: () => void } {
  const original = el.innerHTML;

  if (type === "lines") {
    // ── Step 1: Convert children into word tokens, preserving spans ──
    const tokens: Array<{ text: string; html: string }> = [];

    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Plain text — split into words
        const words = (node.textContent ?? "")
          .trim()
          .split(/\s+/)
          .filter(Boolean);
        words.forEach((w) => tokens.push({ text: w, html: w }));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        // Preserve the entire span as one token
        tokens.push({
          text: el.innerText.trim(),
          html: el.outerHTML, // ← keeps className, styles intact
        });
      }
    });

    // ── Step 2: Render tokens as measurable inline spans ──
    el.innerHTML = tokens
      .map(
        (t, i) =>
          `<span data-token="${i}" style="display:inline-block;white-space:nowrap">${t.html}&nbsp;</span>`,
      )
      .join("");

    const tokenEls = [...el.querySelectorAll<HTMLElement>("[data-token]")];

    // ── Step 3: Group tokens by Y position → lines ──
    const lineGroups: number[][] = [];
    let currentLine: number[] = [];
    let currentY: number | null = null;

    tokenEls.forEach((el, i) => {
      const y = el.getBoundingClientRect().top;
      if (currentY === null) currentY = y;
      if (Math.abs(y - currentY) > 4) {
        lineGroups.push(currentLine);
        currentLine = [];
        currentY = y;
      }
      currentLine.push(i);
    });
    if (currentLine.length) lineGroups.push(currentLine);

    // ── Step 4: Rebuild with mask wrappers, restoring original HTML ──
    el.innerHTML = lineGroups
      .map(
        (indices) =>
          `<span style="display:block;overflow:hidden;padding-bottom:.08em">
             <span class="line-inner" style="display:block">
               ${indices.map((i) => tokens[i].html).join(" ")}
             </span>
           </span>`,
      )
      .join("");

    return {
      inners: [...el.querySelectorAll<HTMLElement>(".line-inner")],
      revert: () => {
        el.innerHTML = original;
      },
    };
  }

  if (type === "words") {
    // Words mode — same fix: use outerHTML for element nodes
    const tokens: Array<{ html: string }> = [];

    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = (node.textContent ?? "")
          .trim()
          .split(/\s+/)
          .filter(Boolean);
        words.forEach((w) => tokens.push({ html: w }));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        tokens.push({ html: (node as HTMLElement).outerHTML });
      }
    });

    el.innerHTML = tokens
      .map(
        (t) =>
          `<span class="word-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.05em">
             <span class="word-inner" style="display:inline-block">${t.html}</span>
           </span>`,
      )
      .join(" ");

    return {
      inners: [...el.querySelectorAll<HTMLElement>(".word-inner")],
      revert: () => {
        el.innerHTML = original;
      },
    };
  }

  if (type === "chars") {
    const chars = el.innerText.trim().split("");
    el.innerHTML = chars
      .map((c) =>
        c === " "
          ? `<span style="display:inline-block;white-space:pre"> </span>`
          : `<span class="char-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom">
               <span class="char-inner" style="display:inline-block">${c}</span>
             </span>`,
      )
      .join("");

    return {
      inners: [...el.querySelectorAll<HTMLElement>(".char-inner")],
      revert: () => {
        el.innerHTML = original;
      },
    };
  }

  return {
    inners: [],
    revert: () => {
      el.innerHTML = original;
    },
  };
}
