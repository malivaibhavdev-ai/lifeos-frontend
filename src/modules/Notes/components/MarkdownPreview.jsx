import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const WIKI_LINK_SCHEME = 'wikilink://';

// react-markdown has no native concept of [[wiki links]], so they're
// rewritten into ordinary markdown links pointing at a fake `wikilink://`
// scheme before rendering, then intercepted via the `a` component override —
// same trick used for in-app deep links in markdown renderers generally,
// avoids forking the renderer just for one syntax extension.
function preprocessWikiLinks(content) {
  return content.replace(WIKI_LINK_PATTERN, (_match, target, label) => {
    const display = (label || target).trim();
    return `[${display}](${WIKI_LINK_SCHEME}${encodeURIComponent(target.trim())})`;
  });
}

// Tailwind stand-ins for the RN version's markdownStyles() — same visual
// intent (heading scale, blockquote accent bar, code/table chrome), driven
// by dark: variants instead of an isDark boolean prop.
const COMPONENTS = {
  a: ({ href, children, onWikiLinkPress }) => {
    if (href?.startsWith(WIKI_LINK_SCHEME)) {
      return (
        <button
          type="button"
          onClick={() => onWikiLinkPress?.(decodeURIComponent(href.slice(WIKI_LINK_SCHEME.length)))}
          className="text-primary-600 underline"
        >
          {children}
        </button>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" className="text-primary-600 underline">
        {children}
      </a>
    );
  },
  h1: ({ children }) => <h1 className="mb-2 mt-3 text-[26px] font-bold text-gray-900 dark:text-white">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-1.5 mt-3 text-[22px] font-bold text-gray-900 dark:text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-2.5 text-[19px] font-semibold text-gray-900 dark:text-white">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="my-1.5 border-l-[3px] border-primary-600 bg-gray-50 px-3 py-1.5 dark:bg-gray-900">{children}</blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-gray-100 px-1 text-gray-900 dark:bg-gray-800 dark:text-white">{children}</code>
    ) : (
      <code className="block rounded-lg bg-gray-100 p-2.5 text-gray-900 dark:bg-gray-800 dark:text-white">{children}</code>
    ),
  pre: ({ children }) => <pre className="overflow-x-auto rounded-lg bg-gray-100 p-2.5 dark:bg-gray-800">{children}</pre>,
  table: ({ children }) => (
    <table className="my-2 rounded-md border border-gray-200 dark:border-gray-700">{children}</table>
  ),
  th: ({ children }) => <th className="border border-gray-200 p-1.5 dark:border-gray-700">{children}</th>,
  td: ({ children }) => <td className="border border-gray-200 p-1.5 dark:border-gray-700">{children}</td>,
  hr: () => <hr className="border-gray-200 dark:border-gray-700" />,
  p: ({ children }) => <p className="text-base leading-6 text-gray-900 dark:text-white">{children}</p>,
  li: ({ children }) => <li className="text-gray-900 dark:text-white">{children}</li>,
};

export function MarkdownPreview({ content, onWikiLinkPress }) {
  const processed = preprocessWikiLinks(content || '');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...COMPONENTS,
        a: (props) => COMPONENTS.a({ ...props, onWikiLinkPress }),
      }}
    >
      {processed || '_Nothing written yet._'}
    </ReactMarkdown>
  );
}

export function extractWikiLinkTitles(content) {
  if (!content) return [];
  const titles = new Set();
  let match;
  const pattern = new RegExp(WIKI_LINK_PATTERN.source, 'g');
  while ((match = pattern.exec(content))) {
    titles.add(match[1].trim());
  }
  return [...titles];
}
