import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AssignmentAttachment, AttachmentType } from '@prisma/client';
import { ExternalLinkIcon, FileIcon } from 'lucide-react';
import Link from 'next/link';
import { forwardRef, useEffect, useState } from 'react';

export function AttachmentsCell({
  attachments,
}: {
  attachments: AssignmentAttachment[];
}) {
  if (attachments.length === 0) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <Tooltip key={attachment.id}>
          <TooltipTrigger asChild>
            {attachment.type === AttachmentType.LINK ? (
              <Link href={attachment.url!} target="_blank">
                <Button variant="ghost" size="icon">
                  <ExternalLinkIcon className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <FileLink fileKey={attachment.fileKey!}>
                <Button variant="ghost" size="icon">
                  <FileIcon className="w-4 h-4" />
                </Button>
              </FileLink>
            )}
          </TooltipTrigger>
          <TooltipContent>
            {attachment.type === AttachmentType.LINK ? (
              <span>{attachment.url}</span>
            ) : (
              <span>{attachment.fileKey?.split('-').pop()}</span>
            )}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

const FileLink = forwardRef<
  HTMLAnchorElement,
  { fileKey: string; children: React.ReactNode }
>(({ fileKey, children, ...props }, ref) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUrl() {
      const response = await fetch(`/api/s3/view`, {
        method: 'POST',
        body: JSON.stringify({ key: fileKey }),
      });

      if (response.ok) {
        const data = await response.json();
        setUrl(data.url);
      } else {
        setUrl(null);
      }
    }

    fetchUrl();
  }, [fileKey]);

  if (!url) {
    return (
      <Link ref={ref} href={''} onClick={(e) => e.preventDefault()} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Link ref={ref} href={url} target="_blank" {...props}>
      {children}
    </Link>
  );
});

FileLink.displayName = 'FileLink';
