// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { Plus } from "lucide-react";
// import { toast } from "sonner";

// import OfferFormDialog from "@/components/admin/offer-form-dialog";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { deleteOffer } from "@/lib/db/actions/offer.action";
// import { getActionErrorMessage } from "@/types/actions";
// import { formatPiastres } from "@/lib/pricing";
// import type { Offer } from "@/lib/db/schema";

// interface AdminOffersClientProps {
//   items: Offer[];
// }

// export default function AdminOffersClient({ items }: AdminOffersClientProps) {
//   const router = useRouter();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editing, setEditing] = useState<Offer | null>(null);

//   const handleDelete = async (id: string) => {
//     const result = await deleteOffer(id);
//     if (!result.success) {
//       toast.error(getActionErrorMessage(result, "Failed to deactivate offer"));
//       return;
//     }
//     toast.success("Offer deactivated");
//     router.refresh();
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold">Offers</h1>
//           <p className="text-muted-foreground text-sm">
//             Manage promotional campaigns shown on the homepage and tickets page.
//           </p>
//         </div>
//         <Button
//           onClick={() => {
//             setEditing(null);
//             setDialogOpen(true);
//           }}
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Create Offer
//         </Button>
//       </div>

//       <div className="rounded-lg border overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-muted/30">
//             <tr>
//               <th className="text-left p-3">Title</th>
//               <th className="text-left p-3">Type</th>
//               <th className="text-left p-3">Price</th>
//               <th className="text-left p-3">Slots</th>
//               <th className="text-left p-3">Status</th>
//               <th className="text-right p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="p-8 text-center text-muted-foreground">
//                   No offers yet
//                 </td>
//               </tr>
//             ) : (
//               items.map((offer) => (
//                 <tr key={offer.id} className="border-t">
//                   <td className="p-3">
//                     <p className="font-medium">{offer.title}</p>
//                     {offer.isFeatured && (
//                       <Badge variant="outline" className="mt-1 text-xs">
//                         Featured
//                       </Badge>
//                     )}
//                   </td>
//                   <td className="p-3 capitalize">{offer.type.replace("_", " ")}</td>
//                   <td className="p-3">
//                     {offer.discountedPrice != null
//                       ? formatPiastres(offer.discountedPrice)
//                       : "—"}
//                   </td>
//                   <td className="p-3">
//                     {offer.remainingSlots ?? "∞"}
//                   </td>
//                   <td className="p-3">
//                     <Badge variant={offer.isActive ? "default" : "secondary"}>
//                       {offer.isActive ? "Active" : "Inactive"}
//                     </Badge>
//                   </td>
//                   <td className="p-3 text-right space-x-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setEditing(offer);
//                         setDialogOpen(true);
//                       }}
//                     >
//                       Edit
//                     </Button>
//                     {offer.isActive && (
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => void handleDelete(offer.id)}
//                       >
//                         Deactivate
//                       </Button>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <OfferFormDialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         offer={editing}
//         onSaved={() => router.refresh()}
//       />
//     </div>
//   );
// }
