import dynamic from "next/dynamic";

const GtsApp = dynamic(() => import("@/components/GtsApp"), { ssr: false });

export default function Home() {
  return <GtsApp />;
}
