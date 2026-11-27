import { CourseDetails } from "@/features/learning/catalog/BackendCoursePages";

export default async function CourseDetailRoute({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <CourseDetails code={code} />;
}
