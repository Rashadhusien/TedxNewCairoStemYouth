// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";

// import TicketReviewDialog from "@/components/admin/ticket-review-dialog";
// import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { formatPiastres } from "@/lib/pricing";
// import type { TicketWithRelations } from "@/types/ticket";

// interface AdminTicketsClientProps {
//   items: TicketWithRelations[];
//   total: number;
//   page: number;
//   pageSize: number;
//   status: string;
//   search: string;
// }

// export default function AdminTicketsClient({
//   items,
//   total,
//   page,
//   pageSize,
//   status,
//   search,
// }: AdminTicketsClientProps) {
//   const router = useRouter();
//   const [selected, setSelected] = useState<TicketWithRelations | null>(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [searchInput, setSearchInput] = useState(search);

//   const totalPages = Math.ceil(total / pageSize);

//   const updateFilters = (next: { status?: string; search?: string; page?: number }) => {
//     const params = new URLSearchParams();
//     params.set("status", next.status ?? status);
//     if (next.search ?? search) params.set("search", next.search ?? search);
//     params.set("page", String(next.page ?? page));
//     router.push(`/admin/tickets?${params.toString()}`);
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">Ticket Verification</h1>
//         <p className="text-muted-foreground text-sm">
//           Review payment proofs and approve or reject tickets.
//         </p>
//       </div>

//       <div className="flex flex-wrap gap-3">
//         <Select
//           value={status}
//           onValueChange={(v) => updateFilters({ status: v, page: 1 })}
//         >
//           <SelectTrigger className="w-48">
//             <SelectValue placeholder="Filter by status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All</SelectItem>
//             <SelectItem value="payment_submitted">Awaiting Review</SelectItem>
//             <SelectItem value="confirmed">Confirmed</SelectItem>
//             <SelectItem value="rejected">Rejected</SelectItem>
//             <SelectItem value="checked_in">Checked In</SelectItem>
//             <SelectItem value="pending_payment">Pending Payment</SelectItem>
//           </SelectContent>
//         </Select>

//         <form
//           className="flex gap-2"
//           onSubmit={(e) => {
//             e.preventDefault();
//             updateFilters({ search: searchInput, page: 1 });
//           }}
//         >
//           <Input
//             placeholder="Search email, phone, ref..."
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             className="w-64"
//           />
//           <Button type="submit" variant="outline">
//             Search
//           </Button>
//         </form>
//       </div>

//       <div className="rounded-lg border overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-muted/30">
//             <tr>
//               <th className="text-left p-3 font-medium">Attendee</th>
//               <th className="text-left p-3 font-medium">Tier</th>
//               <th className="text-left p-3 font-medium">Amount</th>
//               <th className="text-left p-3 font-medium">Status</th>
//               <th className="text-left p-3 font-medium">Submitted</th>
//               <th className="text-right p-3 font-medium">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="p-8 text-center text-muted-foreground">
//                   No tickets found
//                 </td>
//               </tr>
//             ) : (
//               items.map((ticket) => (
//                 <tr key={ticket.id} className="border-t hover:bg-muted/10">
//                   <td className="p-3">
//                     <p className="font-medium">{ticket.user?.fullName ?? "—"}</p>
//                     <p className="text-muted-foreground text-xs">
//                       {ticket.user?.email}
//                     </p>
//                   </td>
//                   <td className="p-3 uppercase">{ticket.type}</td>
//                   <td className="p-3">{formatPiastres(ticket.pricePaid)}</td>
//                   <td className="p-3">
//                     <TicketStatusBadge status={ticket.status} />
//                   </td>
//                   <td className="p-3 text-muted-foreground">
//                     {ticket.paymentSubmittedAt
//                       ? new Date(ticket.paymentSubmittedAt).toLocaleDateString()
//                       : "—"}
//                   </td>
//                   <td className="p-3 text-right">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setSelected(ticket);
//                         setDialogOpen(true);
//                       }}
//                     >
//                       View
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {totalPages > 1 && (
//         <div className="flex justify-between items-center">
//           <p className="text-sm text-muted-foreground">
//             Page {page} of {totalPages} ({total} tickets)
//           </p>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page <= 1}
//               onClick={() => updateFilters({ page: page - 1 })}
//             >
//               Previous
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page >= totalPages}
//               onClick={() => updateFilters({ page: page + 1 })}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       )}

//       <TicketReviewDialog
//         ticket={selected}
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         onReviewed={() => router.refresh()}
//       />
//     </div>
//   );
// }
