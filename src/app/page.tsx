import Link from "next/link";


import {  HydrateClient } from "@/trpc/server";


export default async function Home() {

  return (
    <HydrateClient>
      <main className="mt-20 h-full w-full flex flex-col items-center justify-center gap-6">
      
      <h2>CYBERCLASH</h2>
      <Link href="/dashboard" className="text-emerald-500 text-xl font-bold mt-4">
        Go to Dashboard
      </Link>
   
      </main>
    </HydrateClient>
  );
}
