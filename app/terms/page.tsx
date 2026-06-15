import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/site/legal-page';

export const metadata: Metadata = {
    title: 'Terms of Service — mujic',
    description: 'The terms that govern your use of mujic.',
};

const sections: LegalSection[] = [
    {
        heading: 'Acceptance of terms',
        body: [
            'By accessing or using mujic, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service. These terms apply to everyone who signs in and generates music with mujic.',
        ],
    },
    {
        heading: 'Your account',
        body: [
            'You sign in to mujic using your Google account. You are responsible for the activity that happens under your account and for keeping your sign-in credentials secure. You must be old enough to form a binding contract in your jurisdiction to use the service.',
        ],
    },
    {
        heading: 'Credits and generation',
        body: [
            'Generating music consumes credits from your balance. Each generation is charged when it succeeds; if a generation fails, the credits for that request are refunded to your balance.',
        ],
        bullets: [
            'Credits are required to generate tracks and are deducted per request.',
            'Failed generations are not charged.',
            'Credits have no cash value and are non-transferable.',
        ],
    },
    {
        heading: 'Ownership and use of your music',
        body: [
            'Subject to these terms, the tracks you generate with mujic are royalty-free and yours to use, including in YouTube videos and other personal or commercial projects. We do not claim ownership of your generated output.',
            'You are responsible for the prompts and lyrics you submit and for ensuring your use of the generated music complies with applicable laws and any platform requirements.',
        ],
    },
    {
        heading: 'Acceptable use',
        body: ['To keep mujic safe and reliable for everyone, you agree not to:'],
        bullets: [
            'Submit content that is unlawful, infringing, or violates the rights of others.',
            'Attempt to disrupt, reverse engineer, or abuse the service or its infrastructure.',
            'Use the service to generate content that impersonates others or is misleading.',
            'Resell or redistribute access to the service without our permission.',
        ],
    },
    {
        heading: 'Intellectual property',
        body: [
            'The mujic name, branding, software, and interface are owned by us and protected by intellectual property laws. These terms do not grant you any rights to our trademarks or brand assets beyond using the service as intended.',
        ],
    },
    {
        heading: 'Service availability',
        body: [
            'We work to keep mujic available and dependable, but we provide the service on an "as is" and "as available" basis. We may modify, suspend, or discontinue features at any time, and generation results depend on third-party model providers.',
        ],
    },
    {
        heading: 'Limitation of liability',
        body: [
            'To the maximum extent permitted by law, mujic is not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability for any claim is limited to the amount you paid us, if any, in the period giving rise to the claim.',
        ],
    },
    {
        heading: 'Termination',
        body: [
            'You may stop using mujic at any time. We may suspend or terminate your access if you violate these terms or use the service in a way that creates risk or harm to others. On termination, your right to use the service ends.',
        ],
    },
    {
        heading: 'Changes to these terms',
        body: [
            'We may update these Terms of Service as the service evolves. When we make material changes, we will update the date below and, where appropriate, notify you within the service. Continued use after changes means you accept the updated terms.',
        ],
    },
    {
        heading: 'Contact us',
        body: [
            'If you have questions about these Terms of Service, contact us at support@mujic.app.',
        ],
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            kicker="Legal"
            title="Terms of Service"
            intro="These terms govern your access to and use of mujic. Please read them carefully — by creating music with us, you agree to everything below."
            lastUpdated="June 12, 2026"
            sections={sections}
            sibling={{ label: 'Privacy Policy', href: '/privacy' }}
        />
    );
}
