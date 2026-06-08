export type TeamMemberSocial = {
  linkedin: string;
  instagram: string;
  phone: string;
  tiktok?: string;
  behance?: string;
  facebook?: string;
  portfolio?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  description: string;
  social: TeamMemberSocial;
  image: string | null;
};

export type TeamSubDepartment = {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
};

export type StandardTeamDepartment = {
  type: "standard";
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
};

export type HubTeamDepartment = {
  type: "hub";
  id: string;
  name: string;
  description: string;
  lead: TeamMember;
  subDepartments: TeamSubDepartment[];
};

export type TeamDepartment = StandardTeamDepartment | HubTeamDepartment;

export const teamDepartments: TeamDepartment[] = [
  {
    type: "standard",
    id: "management",
    name: "Management",
    description: "The visionaries steering the ship through the dark.",
    members: [
      {
        id: "nazan-amr",
        name: "Nazan Amr",
        role: "Chairperson",
        description:
          "Nazan is a Product Manager and innovator dedicated to bridging the gap between complex STEM concepts and community-driven impact. As Chairperson and lead organizer of TEDxNewCairoSTEMYouth, she brings a structured, milestone-driven approach to leadership—from strategic partnerships to technical integration.",
        social: {
          linkedin: "https://www.linkedin.com/in/nazan-amr/",
          instagram:
            "https://www.instagram.com/nazan_amr?igsh=MWtxeGgyenRrMjA4Zw==",
          phone: "01206593899",
        },
        image: "/images/team/nazan-amr.jpeg",
      },
      {
        id: "mohamed-ali",
        name: "Mohamed Ali",
        role: "PR Manager",
        description:
          "A results-driven leader with strong expertise in public relations, relationship building, and strategic communication—known for professionalism, organization, and high performance under pressure.",
        social: {
          linkedin: "https://www.linkedin.com/in/mohamed-ali-hafez-0a0724394",
          instagram: "https://www.instagram.com/mohafez.99",
          phone: "01060784522",
        },
        image: "/images/team/mohamed-ali.png",
      },
      {
        id: "mohamed-boghdady",
        name: "Mohamed Boghdady",
        role: "Business Developer",
        description:
          "A strategic business developer with a proven ability to build partnerships and drive sustainable growth through innovative marketing solutions and analytical thinking.",
        social: {
          linkedin: "https://www.linkedin.com/in/mohamed-boghdady-a24b1830b",
          instagram: "https://www.instagram.com/mohamedboghdady001",
          phone: "01060802741",
        },
        image: "/images/team/mohamed-boghdady.png",
      },
    ],
  },
  {
    type: "standard",
    id: "pr",
    name: "PR Team",
    description: "The storytellers who carry the light to the world.",
    members: [
      {
        id: "abdallah-mohamed",
        name: "Abdallah Mohamed",
        role: "PR Director",
        description:
          "A medical professional and entrepreneur with extensive experience in educational, technological, and event-based ventures—bringing strong leadership and communication expertise.",
        social: {
          linkedin: "https://www.linkedin.com/in/dr-abdallah-mohamed-28b5902b1",
          instagram: "https://www.instagram.com/dr_abdallah22",
          tiktok: "https://www.tiktok.com/@dr_abdallah22",
          phone: "+2012023875335",
        },
        image: "/images/team/abdallah-mohamed.png",
      },
      {
        id: "maram-elmahdy",
        name: "Maram Elmahdy",
        role: "PR Director",
        description:
          "A motivated business information systems student passionate about business development, communication, and building strong professional networks.",
        social: {
          linkedin: "https://www.linkedin.com/in/maram-elmahdy-626995382",
          instagram: "https://www.instagram.com/elmahdymaram",
          phone: "01220385525",
        },
        image: "/images/team/maram-elmahdy.png",
      },
    ],
  },
  {
    type: "standard",
    id: "it",
    name: "IT Team",
    description: "The invisible infrastructure keeping the spark alive.",
    members: [
      {
        id: "rashad-hussein",
        name: "Rashad Hussein",
        role: "IT Specialist",
        description:
          "An IT specialist skilled in building clean, fast, and engaging web experiences where design meets performance—dedicated to robust digital solutions and seamless functionality.",
        social: {
          linkedin: "https://www.linkedin.com/in/rashad-al-rifai-2770622aa/",
          instagram: "https://www.instagram.com/rashad_husien/",
          phone: "01110105367",
        },
        image: "/images/team/rashad-hussein.png",
      },
    ],
  },
  {
    type: "standard",
    id: "organizing",
    name: "Organizing Committee",
    description:
      "The engine that transforms vision into reality on the ground.",
    members: [
      {
        id: "perween-ahmed",
        name: "Perween Ahmed ",
        role: "Operations Coordinator",
        description:
          "A dedicated operations coordinator skilled in organization, problem-solving, and supporting team dynamics—ensuring smooth operations and positive collaboration.",
        social: {
          linkedin: "https://www.linkedin.com/in/perween-ahmed-1b199936b",
          instagram: "https://www.instagram.com/periahmed90",
          phone: "+201023952390",
        },
        image: "/images/team/perween-ahmed.png",
      },
      {
        id: "eslam-shabana",
        name: "Islam Shabana",
        role: "OC Vice-Head",
        description:
          "The backbone of execution—ensuring no detail is too small and no challenge too large, stepping up wherever the light needs to shine brighter.",
        social: {
          linkedin: "#",
          instagram: "#",
          phone: "",
        },
        image: "/images/team/eslam-shabana.png",
      },
    ],
  },
  {
    type: "hub",
    id: "social-media",
    name: "Social Media",
    description:
      "Broadcasting the light to every corner of the digital world—one department uniting creative, video, and content excellence.",
    lead: {
      id: "hala-hossam",
      name: "Hala Hossam Farouk",
      role: "Social Media Specialist",
      description:
        "A passionate and strategic social media specialist who transforms creative ideas into compelling digital experiences—expert in content strategy, community management, and brand storytelling.",
      social: {
        linkedin: "https://www.linkedin.com/in/hala-hossam-164993369",
        instagram: "https://www.instagram.com/onlywithloly",
        phone: "+201558389087",
      },
      image: "/images/team/hala-hossam.png",
    },
    subDepartments: [
      {
        id: "creative-graphic",
        name: "Creative & Graphic Team",
        description: "The artists who paint the darkness into light.",
        members: [
          {
            id: "farehan-sameh",
            name: "Farehan Sameh Hassan",
            role: "Graphic Design Head",
            description:
              "A multidisciplinary STEM student contributing to compelling visual experiences that communicate ideas effectively and enhance brand identity.",
            social: {
              linkedin: "https://www.linkedin.com/in/farehan-sameh-36a826330",
              instagram: "https://www.instagram.com/farehansameh11/",
              phone: "+201062281002",
            },
            image: "/images/team/farehan-sameh.png",
          },
          {
            id: "sara-elgohary",
            name: "Sara Elgohary",
            role: "Graphic Designer",
            description:
              "A creative graphic designer specializing in branding and visual storytelling with expertise in Adobe Creative Suite and modern design tools.",
            social: {
              linkedin: "https://www.linkedin.com/in/sarahelgohary",
              instagram: "https://www.instagram.com/sarah.elgohary27",
              phone: "01061805502",
            },
            image: "/images/team/sara-elgohary.png",
          },
          {
            id: "hossam-hassan",
            name: "Hossam Hassan Hassan",
            role: "Graphic Designer",
            description:
              "Specializing in brand identity and social media design—delivering creative solutions that communicate messages and capture attention.",
            social: {
              linkedin: "https://www.linkedin.com/in/hosamhassanhassan181",
              instagram: "https://www.instagram.com/hosamhassan001_",
              behance: "https://www.behance.net/hosamhassan181",
              phone: "01551540282",
            },
            image: "/images/team/hossam-hassan.png",
          },
          {
            id: "sohaila-enany",
            name: "Sohaila Enany",
            role: "Graphic Designer",
            description:
              "A detail-oriented graphic designer with strong experience in branding, logo design, and social content—delivering modern, clean, impactful designs.",
            social: {
              linkedin: "https://www.linkedin.com/in/sohaila-enany-126188293",
              instagram: "https://www.instagram.com/sohaila.enany15",
              phone: "01124577534",
            },
            image: "/images/team/sohaila-enani.png",
          },
        ],
      },
      {
        id: "video-production",
        name: "Video Production",
        description: "Capturing the light in motion.",
        members: [
          {
            id: "ibrahim-mohamed",
            name: "Ibrahim Mohamed Fathy",
            role: "Video Editor",
            description:
              "A creative video editor with extensive experience in post-production, color grading, and motion graphics—passionate about high-impact storytelling.",
            social: {
              linkedin: "https://www.linkedin.com/in/hema.mohamed.fathy.2025",
              instagram: "https://www.instagram.com/mohammed619ibrahim",
              phone: "01021857187",
            },
            image: "/images/team/ibrahim-mohamed.png",
          },
          {
            id: "fares-mohamed",
            name: "Fares Mohamed",
            role: "Video Editor",
            description:
              "Specialized in high-quality visual content, editing workflows, color grading, directing, and visual storytelling for digital platforms.",
            social: {
              linkedin: "https://www.linkedin.com/in/fares-mohamed-editor",
              instagram: "https://www.instagram.com/faressmohamed_editor",
              portfolio: "https://faress-mohamed.com/",
              phone: "01017855409",
            },
            image: "/images/team/fares-mohamed.png",
          },
        ],
      },
      {
        id: "content-writing",
        name: "Content & Writing",
        description: "The words that carry the light forward.",
        members: [
          {
            id: "hager-saber",
            name: "Hager Saber Fathy",
            role: "Content Writer",
            description:
              "A professional content writer with four years of experience crafting engaging social media content and impactful brand storytelling.",
            social: {
              linkedin: "https://www.linkedin.com/in/hager-saber",
              facebook: "https://www.facebook.com/share/1FznQWnQaR/",
              instagram: "https://www.instagram.com/hager_saber274",
              phone: "01224375335",
            },
            image: "/images/team/hager-saber.png",
          },
          {
            id: "mohamed-ashraf",
            name: "Mohamed Ashraf Elabnody",
            role: "Content Writer",
            description:
              "A content marketer and conversion copywriter with three years of experience driving measurable growth through strategic campaigns.",
            social: {
              linkedin: "https://www.linkedin.com/in/mohamed-elabnody-20888b284",
              facebook: "https://www.facebook.com/mohamed.ashraf.469927",
              instagram: "https://www.instagram.com/muhammed_ashraff20",
              phone: "01128005009",
            },
            image: "/images/team/mohamed-ashraf.png",
          },
          {
            id: "rahma-abdelghani",
            name: "Rahma Abdelghani",
            role: "Content Writer",
            description:
              "A content marketing specialist focused on storytelling, branding, and audience engagement for educational and social initiatives.",
            social: {
              linkedin: "https://www.linkedin.com/in/rahma-abdelghani-3b4b59283",
              facebook: "https://www.facebook.com/rahma.abdelghani.752",
              instagram: "https://www.instagram.com/rahma_abdelghanii",
              phone: "01067291261",
            },
            image: "/images/team/rahma-abdelghani.png",
          },
        ],
      },
    ],
  },
];

export const aboutStoryParagraphs = [
  {
    emphasis: true,
    text: "If all that surrounds you seems to be dark, maybe because you are the light.",
  },
  {
    emphasis: false,
    text: "In moments where many students feel lost or uncertain, we see something different—a hidden light waiting to be discovered. Inspired by the idea that without darkness, light has no meaning, we created TEDxNewCairoSTEMYouth as a space for that light to emerge.",
  },
  {
    emphasis: true,
    text: "Here, ideas illuminate paths, and voices inspire change. This is where luminous darkness becomes reality.",
  },
];
