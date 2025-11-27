'use client';

import AuthGuard from "../components/authGuard";//AuthGuard
import Header from "../components/header"; // O Header também pode ficar aqui!

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <Header />
            {children}
        </AuthGuard>
    );
}