import type { StructureResolver } from "sanity/structure";

const CATEGORIES = [
  "ACU / ASU / GPU",
  "Aircraft Heaters",
  "Ambulift",
  "Baggage Tractors",
  "Bagged Carts",
  "Belt Loaders",
  "Buses",
  "Cars",
  "Catering Trucks",
  "Chocks",
  "Container Transport",
  "Crash Tenders",
  "Deck Loaders / Cargo",
  "Deicing Units",
  "Dollies",
  "Forklifts",
  "Fuel Tankers",
  "Ground Support Equipment",
  "Loaders / Transporters",
  "Lorries",
  "Miscellaneous",
  "Other GSE",
  "Passenger Access",
  "PRM Units & Equipment",
  "Push Back Tractors",
  "Sweepers & Vacuum Tankers",
  "Toilet Units",
  "Towbar",
  "Tugs",
  "X-ray and Screening",
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem().title("Homepage").child(
        S.document().schemaType("homepage").documentId("homepage")
      ),
      S.listItem().title("Services").child(
        S.documentTypeList("servicePage").title("Services")
      ),
      S.listItem()
        .title("Equipment")
        .child(
          S.list()
            .title("Equipment")
            .items([
              S.listItem()
                .title("All Equipment")
                .child(S.documentTypeList("listing").title("All Equipment")),
              S.divider(),
              ...CATEGORIES.map((category) =>
                S.listItem()
                  .title(category)
                  .child(
                    S.documentList()
                      .title(category)
                      .filter('_type == "listing" && category == $category')
                      .params({ category })
                  )
              ),
            ])
        ),
      S.listItem().title("About").child(
        S.document().schemaType("about").documentId("about")
      ),
      S.listItem().title("Newsroom").child(
        S.documentTypeList("post").title("Newsroom")
      ),
      S.listItem().title("Menu").child(
        S.document().schemaType("navigation").documentId("navigation")
      ),
      S.divider(),
      S.listItem().title("Website enquiries").child(
        S.documentTypeList("contactSubmission").title("Website enquiries")
      ),
    ]);
