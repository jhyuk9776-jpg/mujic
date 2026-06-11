'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { CreditModal } from '@/components/workspace/credit-modal';

const StarIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const SignOutIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
    </svg>
);

interface WorkspaceNavbarProps {
    className?: string;
    search?: string;
    onSearchChange?: (value: string) => void;
}

export function WorkspaceNavbar({ className, search, onSearchChange }: WorkspaceNavbarProps) {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [creditOpen, setCreditOpen] = useState(false);

    const avatarUrl =
        (user?.user_metadata?.avatar_url as string | undefined) ??
        (user?.user_metadata?.picture as string | undefined);
    const displayName =
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.name as string | undefined) ??
        user?.email ??
        'Account';
    const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

    const handleSignOut = async () => {
        await signOut();
        router.replace('/auth');
    };

    return (
        <nav
            className={cn(
                'flex w-full items-center justify-between gap-4 bg-transparent px-6 py-4 font-sans',
                className
            )}
        >
            {/* Left — wordmark */}
            <span
                className="shrink-0 text-2xl text-white"
                style={{ fontFamily: 'var(--font-school-bell)' }}
            >
                mujic.
            </span>

            {/* Center — liquid glass search field (filters the track list by title) */}
            <div className="relative flex max-w-md flex-1 items-center">
                <div
                    className={cn(
                        'group relative flex w-full items-center gap-2.5 rounded-full px-4 py-2',
                        // liquid glass: translucent fill + blur + edge highlight
                        'border border-white/10 bg-white/[0.06] backdrop-blur-xl',
                        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-12px_rgba(0,0,0,0.6)]',
                        'transition-colors focus-within:border-white/20 focus-within:bg-white/[0.09]'
                    )}
                >
                    <SearchIcon className="shrink-0 text-white/40" />
                    <input
                        type="text"
                        value={search ?? ''}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Search your sound…"
                        aria-label="Search"
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange?.('')}
                            aria-label="Clear search"
                            className="shrink-0 text-white/40 transition-colors hover:text-white/80"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Right — profile popover (hover reveals sign out) */}
            <div className="group relative shrink-0">
                {/* Trigger: avatar */}
                <button
                    type="button"
                    aria-label="Account menu"
                    className={cn(
                        'flex h-10 w-10 items-center justify-center overflow-hidden rounded-full',
                        'border border-white/15 bg-white/[0.06] backdrop-blur-xl',
                        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]',
                        'transition-all hover:border-white/30 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_0_0_3px_rgba(255,255,255,0.05)]'
                    )}
                >
                    {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <span className="text-sm font-medium text-white/80">{initial}</span>
                    )}
                </button>

                {/* Popover — bridged by pt-2 so the gap stays hoverable */}
                <div
                    className={cn(
                        'invisible absolute right-0 top-full z-50 w-52 pt-2 opacity-0 translate-y-1',
                        'transition-all duration-200 ease-out',
                        'group-hover:visible group-hover:opacity-100 group-hover:translate-y-0',
                        'group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0'
                    )}
                >
                    <div
                        className={cn(
                            'overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-1.5 backdrop-blur-2xl',
                            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_16px_40px_-12px_rgba(0,0,0,0.7)]'
                        )}
                    >
                        {/* Identity row */}
                        <div className="flex items-center gap-2.5 px-2.5 py-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
                                {avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={avatarUrl}
                                        alt={displayName}
                                        className="h-full w-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <span className="text-xs font-medium text-white/80">{initial}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-white">{displayName}</p>
                                {user?.email && (
                                    <p className="truncate text-[0.6875rem] text-white/40">{user.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="my-1 h-px bg-white/10" />

                        {/* Buy Credit — opens the credit/payment modal */}
                        <button
                            type="button"
                            onClick={() => setCreditOpen(true)}
                            className={cn(
                                'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-white/70',
                                'transition-colors hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <StarIcon className="shrink-0 text-[#FFF991]" />
                            Buy Credit
                        </button>

                        {/* Sign out */}
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className={cn(
                                'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-white/70',
                                'transition-colors hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <SignOutIcon className="shrink-0 text-white/50" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            <CreditModal open={creditOpen} onClose={() => setCreditOpen(false)} />
        </nav>
    );
}
