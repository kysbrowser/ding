import dynamic from 'next/dynamic';
const Eliminator = dynamic(() => import('../components/Eliminator'), { ssr: false });

export default function Home() {
  return <Eliminator />;
}