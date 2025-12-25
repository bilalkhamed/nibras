import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '../ui/input';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

type FormFieldProps = {
  field: string;
  label: string;
  type?: 'text' | 'password' | 'email' | 'number';
  leftSlot?: ReactNode;
  error?: string | null;
  value: string;
  handleChange: () => void;
  handleOnBlur: () => void;
};

export function FormField({
  field,
  type = 'text',
  label,
  leftSlot,
  error,
  value,
  handleChange,
  handleOnBlur,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-foreground">
        {label}
      </Label>
      <div className="relative">
        {leftSlot}
        <Input
          id={field}
          type={type}
          placeholder={`أدخلي  ${label}`}
          value={value}
          className="border-border focus:border-primary focus:ring-primary"
          onChange={handleChange}
          onBlur={handleOnBlur}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function PasswordField(
  props: Omit<FormFieldProps, 'type' | 'leftSlot'>
) {
  return (
    <FormField
      {...props}
      type="password"
      leftSlot={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>

            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-2">شروط كلمة السر:</p>
              <ul className="space-y-1 text-sm">
                <li>• على الأقل 8 أحرف</li>
                <li>• حرف كبير واحد على الأقل (A-Z)</li>
                <li>• حرف صغير واحد على الأقل (a-z)</li>
                <li>• رقم واحد على الأقل (0-9)</li>
                <li>• رمز واحد على الأقل (!@#$...)</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    />
  );
}
