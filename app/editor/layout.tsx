import "@/app/globals.css";

export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="w-full h-screen">
            {children}
        </main>
    );
}
