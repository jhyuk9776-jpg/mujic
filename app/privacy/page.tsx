import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/site/legal-page';

export const metadata: Metadata = {
    title: 'Privacy Policy — mujic',
    description: 'How mujic collects, uses, and protects your information.',
};

const sections: LegalSection[] = [
    {
        heading: 'Information we collect',
        body: [
            'When you sign in to mujic, we receive your basic account details from Google through our authentication provider — your name, email address, and profile picture. We use this to create and secure your account.',
        ],
        bullets: [
            'Account data: name, email, and avatar from your Google sign-in.',
            'Creative input: the text prompts, lyrics, and generation settings you submit.',
            'Generated content: the audio tracks you create, along with their titles and metadata.',
            'Usage data: credit balance, generation history, and basic activity needed to run the service.',
        ],
    },
    {
        heading: 'How we use your information',
        body: ['We use the information we collect to operate and improve mujic.'],
        bullets: [
            'To generate music from the prompts and lyrics you provide.',
            'To store your tracks so you can play, rename, download, and manage them.',
            'To track and apply your credit balance for each generation.',
            'To secure your account and prevent abuse of the service.',
        ],
    },
    {
        heading: 'AI generation and third parties',
        body: [
            'mujic generates audio using third-party model providers. The prompt and lyrics you submit are sent to these providers solely to produce your track. We do not sell your personal information.',
            'We rely on trusted infrastructure partners for authentication, database storage, and model inference. These partners process data only on our behalf and under their own security commitments.',
        ],
    },
    {
        heading: 'Ownership of generated music',
        body: [
            'Tracks you generate are intended to be royalty-free for your use, including in your videos and other projects, subject to our Terms of Service. We do not claim ownership of the creative output you generate.',
        ],
    },
    {
        heading: 'Data retention',
        body: [
            'We keep your account information and generated tracks for as long as your account is active. You can delete individual tracks at any time from your workspace. When you delete a track, it is removed from your library.',
        ],
    },
    {
        heading: 'Your rights',
        body: ['You have control over your data.'],
        bullets: [
            'Access and review the tracks and account details associated with you.',
            'Delete tracks you no longer want from your workspace.',
            'Request deletion of your account and associated data by contacting us.',
        ],
    },
    {
        heading: 'Security',
        body: [
            'We use industry-standard measures to protect your information, including encrypted connections and access controls. No method of transmission or storage is completely secure, but we work to safeguard your data and respond promptly to issues.',
        ],
    },
    {
        heading: 'Cookies and sessions',
        body: [
            'We use cookies strictly to keep you signed in and maintain your session. We do not use them to track you across other websites.',
        ],
    },
    {
        heading: 'Changes to this policy',
        body: [
            'We may update this Privacy Policy from time to time. When we make material changes, we will revise the date below and, where appropriate, notify you within the service.',
        ],
    },
    {
        heading: 'Contact us',
        body: [
            'If you have questions about this Privacy Policy or how we handle your data, reach out to us at privacy@mujic.app and we will be happy to help.',
        ],
    },
];

export default function PrivacyPage() {
    return (
        <LegalPage
            kicker="Legal"
            title="Privacy Policy"
            intro="Your privacy matters to us. This policy explains what information mujic collects when you create music with us, how we use it, and the choices you have."
            lastUpdated="June 12, 2026"
            sections={sections}
            sibling={{ label: 'Terms of Service', href: '/terms' }}
        />
    );
}
