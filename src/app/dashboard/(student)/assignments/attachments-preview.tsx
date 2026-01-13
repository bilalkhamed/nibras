import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AssignmentAttachment, AttachmentType } from '@prisma/client';
import { ExternalLinkIcon, FileTextIcon, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/shared/utils';

export function AttachmentsPreview({
  attachments,
}: {
  attachments: (AssignmentAttachment & { tempUrl: string | null })[];
}) {
  if (attachments.length === 0) {
    return null;
  }

  const visibleAttachments = attachments.slice(0, 3);
  const remainingCount = attachments.length - 3;

  return (
    <div className="flex items-center gap-2">
      {visibleAttachments.map((attachment) => (
        <AttachmentPreview key={attachment.id} attachment={attachment} />
      ))}
      {remainingCount > 0 && (
        <div className="flex items-center justify-center h-9 px-2.5 rounded-full bg-primary-soft border border-primary/15 text-xs font-medium text-primary">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

function AttachmentPreview({
  attachment,
}: {
  attachment: AssignmentAttachment & { tempUrl: string | null };
}) {
  const isLink = attachment.type === AttachmentType.LINK;
  const isPdf = attachment.fileKey?.toLowerCase().endsWith('.pdf');
  const isImage =
    !isPdf && attachment.fileKey?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

  const fileName = attachment.fileKey?.split('__uuid_end__').pop() || 'ملف';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={attachment.tempUrl!}
          target="_blank"
          className={cn(
            'group relative h-9 w-9 rounded-full overflow-hidden border transition-all',
            'hover:-translate-y-0.5 hover:shadow-sm',
            isLink
              ? 'bg-secondary-soft border-secondary/20'
              : isPdf
                ? 'bg-accent-soft border-accent/20'
                : 'bg-card border-border'
          )}
        >
          {isImage && attachment.tempUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={attachment.tempUrl}
              alt={fileName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              {isLink ? (
                <ExternalLinkIcon className="h-4 w-4 text-secondary-foreground" />
              ) : isPdf ? (
                <FileTextIcon className="h-4 w-4 text-accent-foreground" />
              ) : (
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {isLink ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold">رابط</p>
            <p className="text-xs text-muted-foreground truncate">
              {attachment.url}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs font-semibold">
              {isPdf ? 'ملف PDF' : 'صورة'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{fileName}</p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
