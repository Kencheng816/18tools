/* Text Highlight Engine V1
 * 將純文字依可配置規則拆成 richTextRuns。
 * 引擎本身不綁定任何公版；各 Rule 可自行選擇是否啟用。
 */
(function initTextHighlightEngine() {
  'use strict';

  const normalizeColor = (value, fallback) => String(value || fallback || '').trim();

  function collectMatches(text, rules = []) {
    const matches = [];

    rules.forEach((rule, priority) => {
      if (!rule || !(rule.pattern instanceof RegExp)) return;
      const flags = rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`;
      const pattern = new RegExp(rule.pattern.source, flags);
      let match;

      while ((match = pattern.exec(text)) !== null) {
        const groupIndex = Number.isInteger(rule.group) ? rule.group : 0;
        const value = match[groupIndex] || '';
        if (!value) {
          if (pattern.lastIndex === match.index) pattern.lastIndex += 1;
          continue;
        }

        const relativeOffset = groupIndex === 0 ? 0 : match[0].indexOf(value);
        const start = match.index + Math.max(0, relativeOffset);
        matches.push({
          start,
          end: start + value.length,
          color: normalizeColor(rule.color, '#d0011b'),
          priority,
          value,
        });

        if (pattern.lastIndex === match.index) pattern.lastIndex += 1;
      }
    });

    // 規則越前面優先權越高；相同起點時優先較長的命中。
    return matches.sort((a, b) => a.priority - b.priority || a.start - b.start || b.end - a.end);
  }

  function removeOverlaps(matches) {
    const accepted = [];
    matches.forEach((candidate) => {
      const overlaps = accepted.some((item) => candidate.start < item.end && candidate.end > item.start);
      if (!overlaps) accepted.push(candidate);
    });
    return accepted.sort((a, b) => a.start - b.start);
  }

  function buildRuns(textValue, options = {}) {
    const text = String(textValue == null ? '' : textValue);
    const defaultColor = normalizeColor(options.defaultColor, '#2b2b2b');
    if (!text) return [];

    const matches = removeOverlaps(collectMatches(text, options.rules || []));
    const runs = [];
    let cursor = 0;

    matches.forEach((match) => {
      if (match.start > cursor) runs.push({ text: text.slice(cursor, match.start), color: defaultColor });
      runs.push({ text: text.slice(match.start, match.end), color: match.color });
      cursor = match.end;
    });

    if (cursor < text.length) runs.push({ text: text.slice(cursor), color: defaultColor });
    if (!runs.length) runs.push({ text, color: defaultColor });

    // 合併相鄰且同色的片段，保持 JSON 簡潔。
    return runs.reduce((result, run) => {
      const previous = result[result.length - 1];
      if (previous && previous.color === run.color) previous.text += run.text;
      else result.push({ ...run });
      return result;
    }, []);
  }

  window.TextHighlightEngine = Object.freeze({ buildRuns });
})();
