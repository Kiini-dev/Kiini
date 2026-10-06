import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { ModuleLayout } from "@/components/ModuleLayout";

export default function CustomPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.websiteAdmin.getPublicPage.useQuery({ slug });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading page...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Page not found.</div>;

  return (
    <ModuleLayout title={data.title || slug} breadcrumbs={[{ label: data.title || slug }]}>
      <article className="mx-auto max-w-5xl rounded-lg border bg-background p-6 shadow-sm md:p-10">
        <h1 className="mb-8 text-4xl font-bold">{data.title}</h1>
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: data.contentHtml || "<p>This page has no content yet.</p>" }} />
      </article>
    </ModuleLayout>
  );
}
