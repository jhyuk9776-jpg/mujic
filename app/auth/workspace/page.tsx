'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { WorkspaceNavbar } from '@/components/workspace/navbar';
import { PromptInputBox } from '@/components/workspace/prompt-input-box';

export default function WorkspacePage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        // Once the session is resolved, bounce visitors who aren't signed in.
        if (!loading && !user) {
            router.replace('/auth');
        }
    }, [loading, user, router]);

    // Hold the page blank until we know whether there's a session.
    if (loading || !user) {
        return <main className="min-h-screen w-full bg-[#171717]" />;
    }

    const handleSend = (message: string, files?: File[]) => {
        // Generation pipeline isn't wired up yet — log for now.
        console.log('prompt submitted:', message, files);
    };

    return (
        <main className="relative flex min-h-screen w-full flex-col bg-[#171717] font-sans text-white">
            <WorkspaceNavbar />

            {/* Center content area (empty for now) */}
            <div className="flex-1" />

            {/* Prompt box — pinned to the bottom, centered */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-6">
                <div className="pointer-events-auto w-full max-w-2xl">
                    <PromptInputBox
                        onSend={handleSend}
                        placeholder="Describe the music you want to create…"
                    />
                </div>
            </div>
        </main>
    );
}
