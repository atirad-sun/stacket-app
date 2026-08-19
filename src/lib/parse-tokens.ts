export type TokenMap = Record<string, string>;

function block(css: string, selector: string): string {
  const index = css.indexOf(selector);
  if (index === -1) throw new Error(`Selector not found: ${selector}`);
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

function declarations(body: string): TokenMap {
  const map: TokenMap = {};
  for (const line of body.split(';')) {
    const [rawName, ...rest] = line.split(':');
    if (!rawName || rest.length === 0) continue;
    const name = rawName.trim();
    if (!name.startsWith('--')) continue;
    map[name.slice(2)] = rest.join(':').trim();
  }
  return map;
}

export function parseTokens(css: string): { light: TokenMap; dark: TokenMap } {
  return {
    light: declarations(block(css, '[data-theme="light"]')),
    dark: declarations(block(css, '[data-theme="dark"]')),
  };
}
