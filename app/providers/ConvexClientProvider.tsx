"use client";

import React from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://localhost:3000"
)

const queryClient = new QueryClient();

export default function ConvexClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <QueryClientProvider client={queryClient}>
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    {children}
                </ConvexProviderWithClerk>
            </QueryClientProvider>
        </ClerkProvider>
    )
}
