'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ArrowUp, Square, Mic2, Clock, Layers, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { creditCost, durationSurcharge, batchSurcharge } from '@/lib/credits';

// Options collected alongside the prompt and passed to the generation API.
export interface GenerateOptions {
  lyrics: string;
  duration: number; // seconds
  batchSize: number;
}

// Duration choices surfaced in the popover (label → seconds).
const DURATION_OPTIONS = [
  { label: '1분', seconds: 60 },
  { label: '2분', seconds: 120 },
  { label: '3분', seconds: 180 },
] as const;

const BATCH_OPTIONS = [1, 2, 3, 4] as const;

const MAX_LYRICS = 4096;

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none',
      className
    )}
    ref={ref}
    rows={1}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

// Tooltip Components
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white hover:bg-white/80 text-black',
      outline: 'border border-[#444444] bg-transparent hover:bg-[#3A3A40]',
      ghost: 'bg-transparent hover:bg-[#3A3A40]',
    };
    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-6',
      icon: 'h-8 w-8 rounded-full aspect-[1/1]',
    };
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// PromptInput Context and Components
interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: '',
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});
function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context) throw new Error('usePromptInput must be used within a PromptInput');
  return context;
}

interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, isLoading = false, maxHeight = 240, value, onValueChange, onSubmit, children, disabled = false }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || '');
    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };
    return (
      <TooltipProvider>
        <PromptInputContext.Provider
          value={{
            isLoading,
            value: value ?? internalValue,
            setValue: onValueChange ?? handleChange,
            maxHeight,
            onSubmit,
            disabled,
          }}
        >
          <div
            ref={ref}
            className={cn(
              'rounded-3xl bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300',
              className
            )}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  }
);
PromptInput.displayName = 'PromptInput';

interface PromptInputTextareaProps {
  disableAutosize?: boolean;
  placeholder?: string;
}
const PromptInputTextarea: React.FC<PromptInputTextareaProps & React.ComponentProps<typeof Textarea>> = ({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholder,
  ...props
}) => {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height =
      typeof maxHeight === 'number'
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn('text-base', className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
};

// A pill-shaped control used for the lyrics / duration / batch toggles.
interface OptionPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}
const OptionPill = React.forwardRef<HTMLButtonElement, OptionPillProps>(
  ({ icon, label, active = false, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-all',
        active
          ? 'border-[#9b87f5] bg-[#9b87f5]/15 text-[#c4b5fd]'
          : 'border-transparent bg-transparent text-[#9CA3AF] hover:bg-gray-600/30 hover:text-[#D1D5DB]',
        className
      )}
      {...props}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
);
OptionPill.displayName = 'OptionPill';

// Shared popover panel styling for the duration / batch option lists.
const popoverContentClass =
  'z-50 w-32 rounded-xl border border-[#333333] bg-[#1F2023] p-1 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

interface OptionRowProps {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}
const OptionRow: React.FC<OptionRowProps> = ({ selected, onSelect, children }) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
      selected ? 'bg-white/10 text-white' : 'text-gray-200 hover:bg-white/10'
    )}
  >
    {children}
    {selected && <Check className="h-4 w-4 text-[#9b87f5]" />}
  </button>
);

// Small "+N" badge marking the extra credits an option costs.
const SurchargeBadge: React.FC<{ amount: number }> = ({ amount }) =>
  amount > 0 ? (
    <span className="rounded-full bg-[#FFF991]/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[#FFF991]">
      +{amount}
    </span>
  ) : null;

// Action bar at the bottom of the prompt box.
type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;
const PromptInputActions: React.FC<PromptInputActionsProps> = ({ children, className, ...props }) => (
  <div className={cn('flex items-center justify-between gap-2 p-0 pt-2', className)} {...props}>
    {children}
  </div>
);

// Main PromptInputBox Component
interface PromptInputBoxProps {
  onSend?: (message: string, options: GenerateOptions) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}
export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>((props, ref) => {
  const { onSend = () => {}, isLoading = false, placeholder = 'Type your message here...', className } = props;
  const [input, setInput] = React.useState('');
  const [lyrics, setLyrics] = React.useState('');
  const [lyricsDraft, setLyricsDraft] = React.useState('');
  const [lyricsOpen, setLyricsOpen] = React.useState(false);
  const [duration, setDuration] = React.useState<number>(DURATION_OPTIONS[0].seconds);
  const [batchSize, setBatchSize] = React.useState<number>(1);
  const promptBoxRef = React.useRef<HTMLDivElement>(null);

  const hasLyrics = lyrics.trim().length > 0;
  const durationLabel =
    DURATION_OPTIONS.find((o) => o.seconds === duration)?.label ?? `${Math.round(duration / 60)}분`;

  // Credits this generation will cost (base + duration + batch surcharges).
  const cost = creditCost(duration, batchSize);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input, { lyrics: lyrics.trim(), duration, batchSize });
    setInput('');
  };

  const openLyrics = () => {
    setLyricsDraft(lyrics);
    setLyricsOpen(true);
  };

  const saveLyrics = () => {
    setLyrics(lyricsDraft.slice(0, MAX_LYRICS));
    setLyricsOpen(false);
  };

  const hasContent = input.trim() !== '';

  return (
    <>
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className={cn(
          'w-full bg-[#1F2023] border-[#444444] shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 ease-in-out',
          className
        )}
        disabled={isLoading}
        ref={ref || promptBoxRef}
      >
        <PromptInputTextarea placeholder={placeholder} className="text-base" />

        <PromptInputActions>
          <div className="flex items-center gap-1">
            {/* Lyrics — opens a portal modal for entering song lyrics */}
            <Tooltip>
              <TooltipTrigger asChild>
                <OptionPill
                  icon={<Mic2 className="h-4 w-4" />}
                  label="가사"
                  active={hasLyrics}
                  onClick={openLyrics}
                />
              </TooltipTrigger>
              <TooltipContent>{hasLyrics ? '가사 편집' : '가사 추가 (선택)'}</TooltipContent>
            </Tooltip>

            {/* Duration — popover with 1/2/3 minute options */}
            <PopoverPrimitive.Root>
              <PopoverPrimitive.Trigger asChild>
                <OptionPill icon={<Clock className="h-4 w-4" />} label={durationLabel} active />
              </PopoverPrimitive.Trigger>
              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content align="start" sideOffset={8} className={popoverContentClass}>
                  {DURATION_OPTIONS.map((option) => (
                    <PopoverPrimitive.Close asChild key={option.seconds}>
                      <OptionRow
                        selected={duration === option.seconds}
                        onSelect={() => setDuration(option.seconds)}
                      >
                        <span className="flex items-center gap-2">
                          {option.label}
                          <SurchargeBadge amount={durationSurcharge(option.seconds)} />
                        </span>
                      </OptionRow>
                    </PopoverPrimitive.Close>
                  ))}
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>

            {/* Batch size — popover with 1-4 options */}
            <PopoverPrimitive.Root>
              <PopoverPrimitive.Trigger asChild>
                <OptionPill icon={<Layers className="h-4 w-4" />} label={`${batchSize}곡`} active />
              </PopoverPrimitive.Trigger>
              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content align="start" sideOffset={8} className={popoverContentClass}>
                  {BATCH_OPTIONS.map((n) => (
                    <PopoverPrimitive.Close asChild key={n}>
                      <OptionRow selected={batchSize === n} onSelect={() => setBatchSize(n)}>
                        <span className="flex items-center gap-2">
                          {n}곡
                          <SurchargeBadge amount={batchSurcharge(n)} />
                        </span>
                      </OptionRow>
                    </PopoverPrimitive.Close>
                  ))}
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
          </div>

          <div className="flex items-center gap-2">
            {/* Credit cost of this generation */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="flex h-8 items-center gap-1.5 rounded-full bg-[#FFF991]/10 px-2.5 text-xs font-semibold tabular-nums text-[#FFF991]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {cost}
                </span>
              </TooltipTrigger>
              <TooltipContent>이번 생성에 사용되는 크레딧</TooltipContent>
            </Tooltip>

            <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className={cn(
                  'h-8 w-8 rounded-full transition-all duration-200',
                  hasContent
                    ? 'bg-white hover:bg-white/80 text-[#1F2023]'
                    : 'bg-transparent hover:bg-gray-600/30 text-[#9CA3AF] hover:text-[#D1D5DB]'
                )}
                onClick={handleSubmit}
                disabled={isLoading || !hasContent}
              >
                {isLoading ? (
                  <Square className="h-4 w-4 fill-[#1F2023] animate-pulse" />
                ) : (
                  <ArrowUp className={cn('h-4 w-4', hasContent ? 'text-[#1F2023]' : '')} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isLoading ? '생성 중…' : '생성'}</TooltipContent>
          </Tooltip>
          </div>
        </PromptInputActions>
      </PromptInput>

      {/* Lyrics editor — portal-based modal */}
      <Modal
        open={lyricsOpen}
        onOpenChange={setLyricsOpen}
        title="가사"
        description="비워두면 연주곡(Instrumental)으로 생성됩니다."
      >
        <textarea
          autoFocus
          value={lyricsDraft}
          onChange={(e) => setLyricsDraft(e.target.value.slice(0, MAX_LYRICS))}
          placeholder={'[verse]\n첫 소절을 입력하세요\n\n[chorus]\n후렴을 입력하세요'}
          className="h-64 w-full resize-none rounded-xl border-none bg-[#C9A961]/[0.07] px-3 py-2.5 text-sm text-[#C9A961] caret-[#C9A961] placeholder:text-[#C9A961]/30 focus-visible:bg-[#C9A961]/10 focus-visible:outline-none"
        />
        <div className="flex items-center justify-end gap-2">
          {lyricsDraft && (
            <Button variant="ghost" size="sm" className="text-gray-300" onClick={() => setLyricsDraft('')}>
              지우기
            </Button>
          )}
          <Button variant="default" size="sm" onClick={saveLyrics}>
            저장
          </Button>
        </div>
      </Modal>
    </>
  );
});
PromptInputBox.displayName = 'PromptInputBox';
