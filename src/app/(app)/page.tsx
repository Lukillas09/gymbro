import type { Metadata } from "next";
import { AdaptiveHome } from "@/features/home/components/adaptive-home";
import { getAdaptiveHomeModel } from "@/features/home/queries";

export const metadata: Metadata = {
  title: "Inicio",
};

export default async function HomePage() {
  const model = await getAdaptiveHomeModel();
  return <AdaptiveHome model={model} />;
}
