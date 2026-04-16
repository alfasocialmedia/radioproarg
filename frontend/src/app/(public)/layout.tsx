import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <PublicNavbar />
            <main className="min-h-screen">
                {children}
            </main>
            <PublicFooter />
        </>
    );
}
