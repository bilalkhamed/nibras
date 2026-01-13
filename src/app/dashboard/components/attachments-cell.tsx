import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AssignmentAttachment, AttachmentType } from '@prisma/client';
import { ExternalLinkIcon, FileIcon } from 'lucide-react';
import Link from 'next/link';

export function AttachmentsCell({
  attachments,
}: {
  attachments: (AssignmentAttachment & { tempUrl: string | null })[];
}) {
  if (attachments.length === 0) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <Tooltip key={attachment.id}>
          <TooltipTrigger asChild>
            <Link href={attachment.tempUrl!} target="_blank">
              <Button variant="ghost" size="icon">
                {attachment.type === AttachmentType.LINK ? (
                  <ExternalLinkIcon className="h-4 w-4" />
                ) : (
                  <FileIcon className="h-4 w-4" />
                )}
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            {attachment.type === AttachmentType.LINK ? (
              <span>{attachment.url}</span>
            ) : (
              <span>{attachment.fileKey?.split('__uuid_end__').pop()}</span>
            )}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
