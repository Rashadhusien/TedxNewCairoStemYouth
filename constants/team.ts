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

export const teamDepartments: StandardTeamDepartment[] = [
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
          "Nazan is a Product Manager and innovator dedicated to bridging the gap between complex STEM concepts and community-driven impact. Her work is rooted in the belief that the next generation's potential is unlocked when technical rigor meets creative problem-solving. She aims to create platforms that illuminate transformative ideas and foster STEM-driven innovation.",
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
          "A results-driven leader with strong expertise in public relations, relationship building, and strategic communication. Known for professionalism, organization, and high performance under pressure. Brings clarity, influence, and purpose to every interaction while consistently delivering meaningful and lasting impact.",
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
          "A strategic business developer with a proven ability to build partnerships and drive sustainable growth through innovative marketing solutions. Combines leadership, mentorship, and technical expertise to guide teams and projects. Recognized for strong vision, analytical thinking, and the ability to create impactful initiatives that empower businesses and communities.",
        social: {
          linkedin: "https://www.linkedin.com/in/mohamed-boghdady-a24b1830b",
          instagram: "",
          phone: "01060802741",
        },
        image: "/images/team/mohamed-boghdady.png",
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
          "An IT specialist skilled in building clean, fast, and engaging web experiences where design meets performance. Focuses on creating robust digital solutions and ensuring technical efficiency. Dedicated to supporting the team with technical expertise and seamless web functionality.",
        social: {
          linkedin: "https://www.linkedin.com/in/rashad-al-rifai-2770622aa/",
          instagram: "https://www.instagram.com/rashad_husien/",
          facebook: "https://www.facebook.com/RashadHusien",
          phone: "01110105367",
        },
        image: "/images/team/rashad-hussein.png",
      },
    ],
  },
  {
    type: "standard",
    id: "social-media",
    name: "Social Media",
    description:
      "Broadcasting the light to every corner of the digital world.",
    members: [
      {
        id: "aml",
        name: "Aml",
        role: "Account Manager",
        description: "Aml Description",
        social: {
          linkedin: "",
          instagram:
            "https://www.instagram.com/p/DW6U7LdjKw-/?utm_source=ig_web_copy_link&igsh=MzRlOD==BiNWFlZA",
          phone: "01208232196",
        },
        image: null,
      },
      {
        id: "hala-hossam",
        name: "Hala Hossam Farouk",
        role: "Social Media Specialist",
        description:
          "A passionate and strategic social media specialist who transforms creative ideas into tangible results. Expert in developing effective strategies and managing digital platforms to enhance brand presence. Committed to innovation and delivering high-quality content that engages audiences and achieves business goals.",
        social: {
          linkedin: "https://www.linkedin.com/in/hala-hossam-164993369",
          instagram: "",
          phone: "+201558389087",
        },
        image: "/images/team/hala-hossam.png",
      },
    ],
  },
  {
    type: "standard",
    id: "graphic-design",
    name: "Graphic Design",
    description: "The artists who paint the darkness into light.",
    members: [
      {
        id: "mohamed-tawfik",
        name: "Mohamed Tawfik",
        role: "Graphic Design Leader",
        description:
          "My name is Mohamed Tawfik, Art Director. I specialize in creating high-impact visual identities and strategic design solutions that help brands stand out and communicate effectively. Art Director with a strong focus on branding, visual storytelling, and creative strategy.",
        social: {
          linkedin:
            "https://www.linkedin.com/in/mohammed-tawfik-a67924328?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          instagram:
            "https://www.instagram.com/_mohamedtaw.fik_?igsh=OGQ5ZDc2ODk2ZA==",
          phone: "01110786078",
        },
        image: null,
      },
      {
        id: "farehan-sameh",
        name: "Farehan Sameh Hassan",
        role: "Graphic Designer",
        description:
          "A multidisciplinary STEM student with strong interests in design, science, and community engagement. Contributes to creating compelling visual experiences that communicate ideas effectively. Passionate about intercultural exchange, volunteering, and continuous learning, with a focus on creativity, innovation, and making meaningful impact through design and collaboration.",
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
          "A creative graphic designer specialized in branding and social media visuals, with hands-on experience in freelance and personal projects. Focused on storytelling, visual consistency, and innovation. Continuously seeks growth through new challenges while delivering designs that effectively communicate ideas and enhance brand identity.",
        social: {
          linkedin: "https://www.linkedin.com/in/sarahelgohary",
          instagram: "https://www.instagram.com/sarah.elgohary27",
          phone: "01061805502",
        },
        image: "/images/team/sara-elgohary.png",
      },
      {
        id: "sohaila-enany",
        name: "Sohaila Enany",
        role: "Graphic Designer",
        description:
          "A creative and detail-oriented graphic designer with over two years of experience in branding and visual design. Specializes in creating unique brand identities, logo design, and social media content that reflects client vision and market positioning. Passionate about continuous learning and delivering modern, clean, and impactful designs for diverse industries.",
        social: {
          linkedin: "https://www.linkedin.com/in/sohaila-enany-126188293",
          instagram: "",
          phone: "01124577534",
        },
        image: "/images/team/sohaila-enani.png",
      },
      {
        id: "hossam-hassan",
        name: "Hossam Hassan Hassan",
        role: "Graphic Designer",
        description:
          "A graphic designer specializing in brand identity and social media design, focused on delivering creative solutions that effectively communicate messages and capture attention. Brings technical expertise and artistic vision to every project. Ensuring high-quality visual outcomes that align with client objectives and market trends.",
        social: {
          linkedin: "",
          instagram: "https://www.instagram.com/hosamhassan001_",
          phone: "01551540282",
        },
        image: "/images/team/hossam-hassan.png",
      },
      {
        id: "laila-mohamed",
        name: "Laila Mohamed",
        role: "Graphic Designer",
        description:
          "I am a Graphic Designer specialized in creating visual identities and impactful designs that help brands stand out and communicate effectively. I work on social media design and branding, transforming ideas into creative visual content.",
        social: {
          linkedin: "https://www.linkedin.com/in/layla-mahmuod-8ab842397",
          instagram: "https://www.instagram.com/leilamahmuod",
          phone: "01121397360",
        },
        image: null,
      },
    ],
  },
  {
    type: "standard",
    id: "content-writing",
    name: "Content Writing",
    description: "The words that carry the light forward.",
    members: [
      {
        id: "radwa-khaled",
        name: "Radwa Khaled",
        role: "Content Writing Leader",
        description: "",
        social: {
          linkedin: "",
          instagram: "",
          phone: "",
        },
        image: null,
      },
      {
        id: "hager-saber",
        name: "Hager Saber Fathy",
        role: "Content Writer",
        description:
          "A professional content writer with four years of experience crafting engaging social media content. Specializes in helping brands achieve strategic goals through impactful storytelling. Passionate about the transformative power of words to connect with audiences and drive meaningful engagement.",
        social: {
          linkedin: "https://www.linkedin.com/in/hager-saber",
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
          "A content marketer and conversion copywriter with three years of experience driving measurable growth. Specializes in strategic content creation and high-performing campaigns that turn audience attention into results. Focused on delivering value and optimizing brand communication for success.",
        social: {
          linkedin: "https://www.linkedin.com/in/mohamed-elabnody-20888b284",
          instagram: "https://www.instagram.com/muhammed_ashraff20",
          phone: "01128005009",
        },
        image: "/images/team/mohamed-ashraf.png",
      },
    ],
  },
  {
    type: "standard",
    id: "video-editing",
    name: "Video Editing",
    description: "Capturing the light in motion.",
    members: [
      {
        id: "mathew",
        name: "Mathew",
        role: "Video Editor",
        description: "",
        social: {
          linkedin: "",
          instagram: "",
          phone: "",
        },
        image: null,
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
        id: "eslam-shabana",
        name: "Eslam Shabana",
        role: "Operations Coordinator",
        description:
          "An engineer and operations coordinator with experience in graphic design and marketing. Skilled in managing tasks and delivering creative solutions. Dedicated to operational efficiency and supporting team success through technical expertise and strategic planning.",
        social: {
          linkedin: "",
          instagram: "https://www.instagram.com/eslamali_12",
          facebook: "https://www.facebook.com/EslamShabana",
          phone: "01037379959",
        },
        image: "/images/team/eslam-shabana.png",
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
        id: "belal-deraz",
        name: "Belal Deraz",
        role: "PR Supervisor",
        description:
          "Public Relations, Marketing & Business Development Specialist with 2 years of experience, an entrepreneur seeking to create sustainable solutions for societal challenges.",
        social: {
          linkedin: "",
          instagram: "",
          phone: "",
        },
        image: null,
      },
      {
        id: "abdallah-mohamed",
        name: "Abdallah Mohamed",
        role: "PR Director",
        description:
          "A medical professional and entrepreneur with extensive experience in building and managing educational, technological, and event-based ventures. Brings strong leadership, communication, and training expertise across multiple regions. Passionate about innovation, community impact, and developing scalable initiatives that inspire growth and deliver lasting value.",
        social: {
          linkedin: "https://www.linkedin.com/in/dr-abdallah-mohamed-28b5902b1",
          instagram: "https://www.instagram.com/dr_abdallah22",
          phone: "01069725012",
        },
        image: "/images/team/abdallah-mohamed.png",
      },
      {
        id: "maram-elmahdy",
        name: "Maram Elmahdy",
        role: "PR Director",
        description:
          "A motivated business information systems student passionate about business development, communication, and building strong professional networks. Interested in international career opportunities and always eager to learn and grow. Brings enthusiasm, adaptability, and strategic thinking to public relations and organizational development initiatives.",
        social: {
          linkedin: "https://www.linkedin.com/in/maram-elmahdy-626995382",
          instagram: "https://www.instagram.com/elmahdymaram",
          phone: "01220385525",
        },
        image: "/images/team/maram-elmahdy.png",
      },
      {
        id: "malak-ashraf",
        name: "Malak Ashraf Saeed",
        role: "PR Director",
        description:
          "A Digital Media student at Cairo University with a strong passion for storytelling, marketing, and media production. Alongside my academic journey, I've gained hands-on experience in public relations and marketing through my role in a student activity and my work with a marketing agency. I also work as a program presenter in a program that is part of my graduation project.",
        social: {
          linkedin:
            "https://www.linkedin.com/in/malak-ashraf-saeed-269898363?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          instagram:
            "https://www.instagram.com/malakashraf.xx?igsh=NXJ1bTFzNG12dTJ1",
          phone: "01012438535",
        },
        image: null,
      },
      {
        id: "mohamed-hamdy",
        name: "Mohamed Hamdy Ali",
        role: "PR Director",
        description:
          "Business Development Specialist and PR Team Leader with a strong track record in building strategic partnerships, leading high-performing teams, and executing impactful events. I specialize in B2B communication, brand positioning, and creating opportunities that drive growth. Through my experience in initiatives like TEDx and large-scale youth programs, I've developed a results-driven mindset focused on influence, organization, and real impact.",
        social: {
          linkedin: "https://www.linkedin.com/in/mohamed-hamdy-79518b30a",
          instagram: "",
          phone: "01204292644",
        },
        image: null,
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
