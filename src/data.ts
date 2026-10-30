export const siteConfig: {
  name: string;
  legalName: string;
  address: string;
  whatsapp: string | null;
  instagram: string | null;
  telegram: string | null;
} = {
  name: "Aurelle Estates",
  legalName: "Aurelle Limited",
  address:
    "Aurelle Building, Lekki-Epe Expressway, Salem bus stop, Lekki, Lagos (address awaiting confirmation)",
  whatsapp: "+2348102180628",
  instagram: "belhrah",
  telegram: "+2348102180628",
};
export const image = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
export const photos = [
  "photo-1600607687920-4e2a09cf159d",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1600596542815-ffad4c1539a9",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1613977257363-707ba9348227",
  "photo-1600047509807-ba8f99d2cdde",
];
export const categories = [
  "All properties",
  "For Sale",
  "For Rent",
  "Land for Sale",
  "Short-Term Rentals",
  "Airbnb Stays",
];
export type Property = {
  slug: string;
  title: string;
  location: string;
  category: string;
  price: number;
  period: string;
  beds: number;
  baths: number;
  area: number;
  type: string;
  status: string;
  photo: string;
  externalUrl?: string;
};
export const properties: Property[] = [
  {
    slug: "the-palm-residence",
    title: "The Palm Residence",
    location: "Lekki Phase 1, Lagos",
    category: "For Sale",
    price: 285000000,
    period: "",
    beds: 5,
    baths: 6,
    area: 450,
    type: "Detached house",
    status: "Available",
    photo: photos[2],
  },
  {
    slug: "the-ikoyi-retreat",
    title: "The Ikoyi Retreat",
    location: "Ikoyi, Lagos",
    category: "For Rent",
    price: 18000000,
    period: "/ year",
    beds: 3,
    baths: 4,
    area: 220,
    type: "Apartment",
    status: "Available",
    photo: photos[1],
  },
  {
    slug: "cove-terraces",
    title: "Cove Terraces",
    location: "Ajah, Lagos",
    category: "For Sale",
    price: 145000000,
    period: "",
    beds: 4,
    baths: 4,
    area: 310,
    type: "Terrace",
    status: "Under Offer",
    photo: photos[4],
  },
  {
    slug: "epe-garden-plots",
    title: "Epe Garden Plots",
    location: "Epe, Lagos",
    category: "Land for Sale",
    price: 25000000,
    period: "/ plot",
    beds: 0,
    baths: 0,
    area: 600,
    type: "Land",
    status: "Available",
    photo: photos[5],
  },
  {
    slug: "weekend-at-the-cove",
    title: "Weekend at the Cove",
    location: "Victoria Island, Lagos",
    category: "Short-Term Rentals",
    price: 150000,
    period: "/ night",
    beds: 2,
    baths: 2,
    area: 140,
    type: "Apartment",
    status: "Available",
    photo: photos[0],
  },
  {
    slug: "lagos-city-stay",
    title: "Lagos City Stay",
    location: "Lekki Phase 1, Lagos",
    category: "Airbnb Stays",
    price: 120000,
    period: "/ night",
    beds: 2,
    baths: 2,
    area: 120,
    type: "Apartment",
    status: "Let",
    photo: photos[3],
  },
  {
    slug: "ibeju-lekki-sample-plot",
    title: "Ibeju-Lekki Sample Plot",
    location: "Ibeju-Lekki, Lagos",
    category: "Land for Sale",
    price: 40000000,
    period: "/ plot",
    beds: 0,
    baths: 0,
    area: 500,
    type: "Land",
    status: "Sample only",
    photo: photos[5],
  },
];
export const services = [
  [
    "Sales",
    "A home that fits the life you want.",
    "From your first shortlist to the final handover, we help you compare homes, arrange viewings and ask the right questions.",
    "Property purchase",
  ],
  [
    "Lettings",
    "Make your next move feel effortless.",
    "Explore rental options around your routine, with clear conversations about rent, deposits, service charges and maintenance.",
    "Rental",
  ],
  [
    "Property management",
    "Your property, thoughtfully looked after.",
    "Discuss tenant communication, maintenance coordination, reporting and an agreed scope of support for your property.",
    "Property management",
  ],
  [
    "Land advisory",
    "A clearer path from plot to possibility.",
    "Define your intended use, location and budget, then coordinate independent title checks and a physical site inspection.",
    "Land",
  ],
  [
    "Short-stay management",
    "Welcoming stays. Considered details.",
    "Plan guest communication, turnover, housekeeping and a practical operating approach for your furnished apartment.",
    "Short-stay",
  ],
  [
    "Valuation",
    "Start with a considered perspective.",
    "Request a property assessment and discuss whether you need an independent, appropriately qualified professional valuation.",
    "General enquiry",
  ],
  [
    "Inspection scheduling",
    "See the details for yourself.",
    "Arrange a convenient viewing and bring a focused checklist of questions about condition, access, costs and documentation.",
    "Inspection",
  ],
];
export const articles = [
  {
    slug: "before-you-buy-in-lagos",
    title: "Before you fall in love with a home, ask these questions.",
    category: "Buying Guides",
    excerpt:
      "A thoughtful checklist for your first property inspection in Lagos.",
    photo: photos[0],
    sections: [
      [
        "Begin with your everyday life",
        "Write down your non-negotiables: commute, access, room sizes and the way you want to live. Visit the neighbourhood at different times and record the things a listing cannot show.",
      ],
      [
        "Look beyond the finish",
        "Ask about water supply, power arrangements, drainage, maintenance and service charges. Take notes and request permission before photographing issues.",
      ],
      [
        "Pause before you commit",
        "Request the relevant documents and independent professional review before paying. Confirm the recipient, written payment terms and what is included in the transaction.",
      ],
    ],
  },
  {
    slug: "renting-with-confidence",
    title: "A little preparation. A much better rental experience.",
    category: "Renting",
    excerpt: "Look beyond the annual rent to understand your next move.",
    photo: photos[1],
    sections: [
      [
        "Understand the full cost",
        "Ask for a written breakdown of rent, deposits, service charges and other agreed fees. Make a budget for moving and utilities.",
      ],
      [
        "Inspect and record",
        "Check fixtures, water pressure and electrical fittings. Agree a written condition record before moving in.",
      ],
      [
        "Read your agreement",
        "Clarify repairs, renewal, notice periods and deposit arrangements with independent advice where needed.",
      ],
    ],
  },
  {
    slug: "land-buying-checklist",
    title: "Land is a beginning. Start with the right questions.",
    category: "Land Ownership",
    excerpt: "Location, boundaries and documents deserve equal attention.",
    photo: photos[5],
    sections: [
      [
        "Walk the site",
        "Visit the actual plot and discuss access, drainage and surrounding uses. Marketing descriptions alone do not establish boundaries.",
      ],
      [
        "Seek independent checks",
        "Engage qualified local professionals to review title, survey and intended use. Ask them to explain uncertainties before payment.",
      ],
      [
        "Keep a record",
        "Retain signed documents, professional reports and payment records. This sample guide is educational and does not replace legal advice.",
      ],
    ],
  },
  {
    slug: "investment-with-perspective",
    title: "Think long term. Look beyond the asking price.",
    category: "Investment",
    excerpt:
      "An approach to evaluating a property without relying on promises.",
    photo: photos[2],
    sections: [
      [
        "Define your goal",
        "Decide whether your priority is personal use, rental income or a future project. Consider your time horizon and ability to handle unexpected costs.",
      ],
      [
        "Model the costs",
        "Include maintenance, vacancy, financing and management in your own scenarios. Sample estimates are not guaranteed outcomes.",
      ],
      [
        "Ask for evidence",
        "Independently verify comparable information and discuss tax and legal questions with qualified advisers.",
      ],
    ],
  },
  {
    slug: "preparing-a-short-stay",
    title: "The art of a stay that feels like home.",
    category: "Short-Term Letting",
    excerpt:
      "Practical details that make a furnished apartment more welcoming.",
    photo: photos[3],
    sections: [
      [
        "Make arrival simple",
        "Provide clear access instructions and an accurate description of amenities. Set expectations about power, internet and house rules.",
      ],
      [
        "Prioritise the essentials",
        "Comfortable bedding, cleanliness, secure access and dependable communication deserve attention before decorative extras.",
      ],
      [
        "Plan for each turnover",
        "Create a repeatable inventory, housekeeping checklist and maintenance process. Confirm any building restrictions before hosting.",
      ],
    ],
  },
  {
    slug: "property-documents-explained",
    title: "Understand the paperwork before the next step.",
    category: "Legal Basics",
    excerpt: "Build a list of questions for your independent legal adviser.",
    photo: photos[4],
    sections: [
      [
        "Gather the records",
        "Ask what documents are available and who is authorised to act. Document names alone do not establish validity.",
      ],
      [
        "Arrange professional review",
        "Use qualified Nigerian legal counsel and other relevant professionals for transaction-specific checks.",
      ],
      [
        "Resolve uncertainty",
        "Ask for explanations in writing and avoid assuming any verification has been completed. This draft is general educational content.",
      ],
    ],
  },
];
