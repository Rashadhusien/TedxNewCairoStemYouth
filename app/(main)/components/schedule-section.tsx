import SectionTitle from "@/components/layout/section-title";
import { Clock, Calendar } from "lucide-react";

export default function ScheduleSection() {
  return (
    <section className="relative py-20 px-6 lg:px-10 bg-black">
      <div className="absolute inset-0 bg-linear-to-b from-[#050505] via-black to-[#050000] pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-red-950/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <SectionTitle
          eyebrow="Event Schedule"
          title="Coming Soon"
          subTitle="The full schedule for Luminous Darkness 2026 will be announced soon."
        />

        <div className="mt-12 border border-white/10 bg-white/[0.02] p-8 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-16 items-center justify-center border border-primary/25 bg-primary/10 text-primary rounded-full">
              <Clock className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Schedule Announcement
            </h3>
            <p className="text-white/60 max-w-md leading-relaxed">
              We&apos;re finalizing an incredible lineup of speakers,
              performers, and experiences. The complete schedule will be
              published closer to the event date.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/40 mt-4">
              <Calendar className="size-4" />
              <span>September 5, 2026 · 1:00 PM</span>
            </div>
          </div>
        </div>

        <p className="text-white/30 text-sm mt-6 italic">
          (Team confirmation required for schedule content)
        </p>
      </div>
    </section>
  );
}

// import SectionTitle from "@/components/layout/section-title";
// import {
//   Clock,
//   Calendar,
//   MapPin,
//   Coffee,
//   Users,
//   Mic,
//   Sparkles,
//   type LucideIcon,
// } from "lucide-react";

// interface ScheduleItem {
//   time: string;
//   title: string;
//   description: string;
//   type: "keynote" | "talk" | "break" | "networking" | "performance";
//   icon?: LucideIcon;
// }

// const SCHEDULE_ITEMS: ScheduleItem[] = [
//   {
//     time: "09:30 - 10:00",
//     title: "Registration & Check-in",
//     description:
//       "Pick up your badge, explore the venue, and connect with fellow attendees",
//     type: "networking",
//     icon: Users,
//   },
//   {
//     time: "10:00 - 10:15",
//     title: "Opening Ceremony",
//     description: "Welcome remarks and introduction to Luminous Darkness theme",
//     type: "keynote",
//     icon: Sparkles,
//   },
//   {
//     time: "10:15 - 10:45",
//     title: "Keynote: Illuminating the Unknown",
//     description:
//       "Dr. Sarah Ahmed - Exploring how darkness drives innovation in STEM",
//     type: "keynote",
//     icon: Mic,
//   },
//   {
//     time: "10:45 - 11:15",
//     title: "Session 1: Technology Frontiers",
//     description:
//       "Three rapid-fire talks on AI, quantum computing, and biotechnology",
//     type: "talk",
//     icon: Mic,
//   },
//   {
//     time: "11:15 - 11:45",
//     title: "Coffee Break & Networking",
//     description:
//       "Refreshments and informal networking with speakers and attendees",
//     type: "break",
//     icon: Coffee,
//   },
//   {
//     time: "11:45 - 12:30",
//     title: "Session 2: Engineering Tomorrow",
//     description:
//       "Innovative solutions in sustainable energy and infrastructure",
//     type: "talk",
//     icon: Mic,
//   },
//   {
//     time: "12:30 - 13:30",
//     title: "Lunch Break",
//     description:
//       "Catered lunch with sponsor exhibitions and networking opportunities",
//     type: "break",
//     icon: Coffee,
//   },
//   {
//     time: "13:30 - 14:15",
//     title: "Session 3: Mathematics & Logic",
//     description: "The beauty of patterns and the power of analytical thinking",
//     type: "talk",
//     icon: Mic,
//   },
//   {
//     time: "14:15 - 15:00",
//     title: "Interactive Workshop",
//     description: "Hands-on collaborative problem-solving session",
//     type: "networking",
//     icon: Users,
//   },
//   {
//     time: "15:00 - 15:30",
//     title: "Performance Interlude",
//     description:
//       "Artistic performance interpreting the Luminous Darkness theme",
//     type: "performance",
//     icon: Sparkles,
//   },
//   {
//     time: "15:30 - 16:15",
//     title: "Session 4: Future of Science",
//     description: "Breakthrough research and emerging scientific frontiers",
//     type: "talk",
//     icon: Mic,
//   },
//   {
//     time: "16:15 - 16:45",
//     title: "Closing Ceremony",
//     description: "Final remarks, awards, and call to action",
//     type: "keynote",
//     icon: Sparkles,
//   },
//   {
//     time: "16:45 - 17:30",
//     title: "Networking Reception",
//     description: "Final networking session with light refreshments",
//     type: "networking",
//     icon: Users,
//   },
// ];

// const getTypeStyles = (type: ScheduleItem["type"]) => {
//   switch (type) {
//     case "keynote":
//       return "border-primary/30 bg-primary/5";
//     case "talk":
//       return "border-white/10 bg-white/[0.02]";
//     case "break":
//       return "border-white/5 bg-white/[0.01]";
//     case "networking":
//       return "border-blue-500/20 bg-blue-500/5";
//     case "performance":
//       return "border-purple-500/20 bg-purple-500/5";
//     default:
//       return "border-white/10 bg-white/[0.02]";
//   }
// };

// const getTypeBadge = (type: ScheduleItem["type"]) => {
//   switch (type) {
//     case "keynote":
//       return "bg-primary/20 text-primary";
//     case "talk":
//       return "bg-white/10 text-white/70";
//     case "break":
//       return "bg-white/5 text-white/50";
//     case "networking":
//       return "bg-blue-500/20 text-blue-400";
//     case "performance":
//       return "bg-purple-500/20 text-purple-400";
//     default:
//       return "bg-white/10 text-white/70";
//   }
// };

// export default function ScheduleSection() {
//   return (
//     <section className="relative py-20 px-6 lg:px-10 bg-black">
//       <div className="absolute inset-0 bg-linear-to-b from-[#050505] via-black to-[#050000] pointer-events-none" />
//       <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-red-950/15 rounded-full blur-[160px] pointer-events-none" />

//       <div className="relative z-10 max-w-4xl mx-auto">
//         <SectionTitle
//           eyebrow="Event Schedule"
//           title="Luminous Darkness 2026"
//           subTitle="A day of inspiring talks, performances, and connections"
//         />

//         <div className="mt-12 space-y-4">
//           {SCHEDULE_ITEMS.map((item, index) => {
//             const Icon = item.icon;
//             return (
//               <div
//                 key={index}
//                 className={`group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${getTypeStyles(item.type)}`}
//               >
//                 <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

//                 <div className="flex flex-col sm:flex-row sm:items-start gap-4">
//                   <div className="flex-shrink-0">
//                     <div className="inline-flex items-center gap-2 text-sm font-mono text-primary/80 bg-primary/10 px-3 py-1.5 rounded-lg">
//                       <Clock className="size-4" />
//                       {item.time}
//                     </div>
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-3 mb-2">
//                       {Icon && (
//                         <div className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-white/60">
//                           <Icon className="size-4" />
//                         </div>
//                       )}
//                       <h3 className="text-lg font-bold text-white">
//                         {item.title}
//                       </h3>
//                       <span
//                         className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getTypeBadge(item.type)}`}
//                       >
//                         {item.type}
//                       </span>
//                     </div>
//                     <p className="text-white/60 text-sm leading-relaxed">
//                       {item.description}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/40">
//           <div className="flex items-center gap-2">
//             <Calendar className="size-4" />
//             <span>September 5, 2026</span>
//           </div>
//           <div className="hidden sm:block size-1 rounded-full bg-white/20" />
//           <div className="flex items-center gap-2">
//             <MapPin className="size-4" />
//             <span>Galal El Sharkawy - down town cairo</span>
//           </div>
//           <div className="hidden sm:block size-1 rounded-full bg-white/20" />
//           <div className="flex items-center gap-2">
//             <Clock className="size-4" />
//             <span>09:30 - 17:30</span>
//           </div>
//         </div>

//         <p className="text-white/30 text-sm mt-6 text-center italic">
//           * Schedule is subject to change. Final program will be confirmed
//           closer to event date.
//         </p>
//       </div>
//     </section>
//   );
// }
