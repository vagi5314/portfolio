import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  projects,
  getProject,
  getNextProject,
} from "@/lib/projects";
import { WorkView } from "./work-view";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `/work/${slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
    },
  };
}

export default async function WorkPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getNextProject(slug);
  const idx = projects.findIndex((p) => p.slug === slug);
  return (
    <WorkView
      project={project}
      next={
        next
          ? { slug: next.slug, title: next.title, cover: next.cover, thumb: next.thumb, tag: next.tag }
          : null
      }
      index={idx}
      total={projects.length}
    />
  );
}
