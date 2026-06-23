import { createClient } from "next-sanity";
import { createImageUrlBuilder, SanityImageSource } from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

const builder = createImageUrlBuilder(client);
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}