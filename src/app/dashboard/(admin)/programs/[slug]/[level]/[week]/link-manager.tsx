'use client';

import {
  Control,
  FieldError,
  FieldErrorsImpl,
  Merge,
  useFieldArray,
} from 'react-hook-form';
import { AssignmentFormData } from './assignment-form';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/forms/error-message';

type LinkManagerProps = {
  control: Control<AssignmentFormData>;
  errors:
    | Merge<
        FieldError,
        (
          | Merge<
              FieldError,
              FieldErrorsImpl<{
                url: string;
                type: 'LINK';
                id: string;
              }>
            >
          | undefined
        )[]
      >
    | undefined;
};

export default function LinkManager({ control, errors }: LinkManagerProps) {
  const links = useFieldArray({
    name: 'links',
    control: control,
  });

  return (
    <div className="mx-3 py-1  border rounded-2xl">
      <div className="flex items-center justify-between">
        <p className="lead p-3">الروابط</p>
        <Button
          variant="outline"
          size="sm"
          className="m-3"
          onClick={() => links.append({ url: '', type: 'LINK' })}
        >
          إضافة رابط
        </Button>
      </div>
      {links.fields.map((field, index) => (
        <div key={field.id} className="mb-1 flex flex-col p-2 justify-start">
          <div className="flex items-center mb-2  ">
            <Input
              type="url"
              {...control.register(`links.${index}.url` as const)}
              defaultValue={field.url}
              className="w-full p-2"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => links.remove(index)}
              className="text-destructive ms-2"
            >
              <Trash2Icon size={15} />
            </Button>
          </div>
          <ErrorMessage message={errors?.[index]?.url?.message} />
        </div>
      ))}
    </div>
  );
}
