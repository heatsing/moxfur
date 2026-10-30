import metadata from '../content/metadata.json';

export function pageMetadata(record) {
  if (!record) return {};
  const url = record.route ? record.route + '/' : '/';
  const original = metadata.pages[record.route] || {};
  return {
    ...original,
    title: record.title.trim(),
    description: record.description,
    alternates: {canonical: url},
    openGraph: {...original.openGraph, url},
    icons: {icon: metadata.favicon},
  };
}
