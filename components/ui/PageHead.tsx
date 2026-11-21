import Head from "next/head";

interface PageHeadProps {
  title: string;
  description?: string;
}

const APP_NAME = "YoʻlYoʻldosh";

export default function PageHead({ title, description }: PageHeadProps) {
  const fullTitle = `${title} · ${APP_NAME}`;
  return (
    <Head>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
    </Head>
  );
}
