"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (update) {
            update(); // Safe check before calling
        }
    }, [update]); 

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            router.push("/panel/dashboard");
        }
    }, [status, session, router]);

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (status === "unauthenticated") {
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <h1>Welcome to the Stock Management System</h1>
                <p>Please log in to continue</p>
                <button onClick={() => signIn("google")}>Sign in with Google</button>
            </div>
        );
    }

    return null; // Return null if the status is not loading or unauthenticated
}