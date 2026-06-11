'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface CreditModalProps {
    open: boolean;
    onClose: () => void;
}

interface Plan {
    name: string;
    price: number;
    credits: number;
    featured?: boolean;
}

const PLANS: Plan[] = [
    { name: 'Pro', price: 5, credits: 100 },
    { name: 'Ultra', price: 50, credits: 1100, featured: true },
];

function PlanCard({ plan }: { plan: Plan }) {
    return (
        <div
            className={cn(
                'relative flex-1 overflow-hidden rounded-2xl border p-6',
                'transition-colors',
                plan.featured
                    ? 'border-white/20 bg-white/[0.04] hover:border-white/30'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            )}
        >
            {/* Soft yellow glow — sits behind the card content */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at center, #FFF991 0%, transparent 70%)',
                    opacity: plan.featured ? 0.22 : 0.12,
                    mixBlendMode: 'screen',
                }}
            />

            <div className="relative z-10 flex flex-col gap-5">
                <span className="text-sm font-medium uppercase tracking-[0.15em] text-white/50">
                    {plan.name}
                </span>

                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold text-white">${plan.price}</span>
                </div>

                <div className="h-px w-full bg-white/10" />

                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold text-[#FFF991]">
                        {plan.credits.toLocaleString()}
                    </span>
                    <span className="text-sm text-white/50">credits</span>
                </div>
            </div>
        </div>
    );
}

export function CreditModal({ open, onClose }: CreditModalProps) {
    const [mounted, setMounted] = useState(false);

    // Portals need a DOM target, which only exists on the client.
    useEffect(() => setMounted(true), []);

    // Close on Escape while the modal is open.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!mounted || !open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Buy Credit"
                className={cn(
                    'relative z-10 w-full max-w-lg rounded-3xl border border-white/10 p-7',
                    'bg-[#141416]',
                    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_24px_64px_-16px_rgba(0,0,0,0.8)]'
                )}
            >
                <div className="mb-6 flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-white">Buy Credit</h2>
                    <p className="text-sm text-white/40">Choose the plan that fits your flow.</p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    {PLANS.map((plan) => (
                        <PlanCard key={plan.name} plan={plan} />
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}
