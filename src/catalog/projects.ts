import type { ProjectEntry } from "./types";

export const projects: ProjectEntry[] = [
  {
    id: "bb-lsm6dsv",
    title: "DIY SlimeVR Trackers",
    description:
      "Build your own SlimeVR-compatible full-body trackers with OpenPaw Labs hardware, 3D-printed cases, and step-by-step assembly guides.",
    overviewPath: "bb-lsm6dsv/0-overview",
    subguides: [
      {
        slug: "0-overview",
        path: "bb-lsm6dsv/0-overview",
        title: "Overview",
        description:
          "Materials, tools, and a high-level walkthrough of every step in this project.",
      },
      {
        slug: "1-3d-prints",
        path: "bb-lsm6dsv/1-3d-prints",
        title: "3D Print Parts",
        description:
          "Walks the user through 3D printing all the components required for later guides.",
      },
      {
        slug: "2-tracker-assembly",
        path: "bb-lsm6dsv/2-tracker-assembly",
        title: "Tracker Assembly",
        description:
          "Assemble the trackers and charging dock — batteries, screws, and cases.",
      },
      {
        slug: "3-strap-assembly",
        path: "bb-lsm6dsv/3-strap-assembly",
        title: "Strap Assembly",
        description:
          "Optional guide for creating your own low-cost DIY straps.",
        optional: true,
      },
      {
        slug: "onetime-setup",
        path: "common/0-onetime-tracker-setup",
        title: "One-Time Tracker Setup",
        description:
          "One-time setup steps for your trackers in SlimeVR and VRChat.",
        shared: true,
      },
      {
        slug: "vrchat-use",
        path: "common/1-vrchat-use",
        title: "VRChat Use",
        description:
          "Steps required in VRChat every time you use your trackers.",
        shared: true,
      },
    ],
  },
];

export function getProject(projectId: string): ProjectEntry | undefined {
  return projects.find((project) => project.id === projectId);
}

export function getSubguide(
  project: ProjectEntry,
  guideSlug: string,
): ProjectEntry["subguides"][number] | undefined {
  return project.subguides.find((subguide) => subguide.slug === guideSlug);
}
