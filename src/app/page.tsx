import Link from "next/link";


import {  HydrateClient } from "@/trpc/server";
import AlternateLanding from "@/components/AlternateLanding";


export default async function Home() {

  return (
    <HydrateClient>
      <main className="mt-20 h-full w-full flex flex-col items-center justify-center gap-6">
      
   <AlternateLanding/>
   
      </main>
    </HydrateClient>
  );
}
