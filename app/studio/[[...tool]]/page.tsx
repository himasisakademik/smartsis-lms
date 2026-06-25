import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";
import StudioClientWrapper from "@/components/admin/StudioClientWrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return (
    <StudioClientWrapper>
      <NextStudio config={config} />
    </StudioClientWrapper>
  );
}
