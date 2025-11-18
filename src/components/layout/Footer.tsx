import labels from '@/lib/labels.json';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/80 backdrop-blur-sm py-10 mt-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">{labels.home.copyright}</p>
      </div>
    </footer>
  );
}
