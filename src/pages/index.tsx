import Head from "next/head";
import { App } from "../components/App";

export default function Home() {
  return (
    <>
      <Head>
        <title>Mingdu</title>
        <meta name="description" content="TODO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <App />
      </main>
    </>
  );
}
