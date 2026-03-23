import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";
import { DeleteEnquiryAction } from "./sanity/actions/deleteEnquiry";
import { dashboardPlugin } from "./sanity/plugins/dashboard";

export default defineConfig({
  name: "astgse",
  title: "ASTGSE | Studio",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kcmbd43u",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool({ structure }), visionTool(), dashboardPlugin()],
  schema: { types: schemaTypes },
  document: {
    actions: (prev, { schemaType }) =>
      schemaType === "contactSubmission"
        ? [DeleteEnquiryAction, ...prev.filter(a => a.action !== "delete")]
        : prev,
  },
});
